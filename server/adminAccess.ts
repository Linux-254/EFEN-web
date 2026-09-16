import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";

const COOKIE_NAME = "efen_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

type RateLimitEntry = {
  attempts: number;
  lockedUntil?: number;
};

const attemptStore = new Map<string, RateLimitEntry>();

function getClientIdentifier(req: Request): string {
  const forwarded = req?.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req?.ip || req?.socket?.remoteAddress || "client";
}

export function isRateLimited(req: Request): { locked: boolean; remainingMinutes?: number } {
  const key = getClientIdentifier(req);
  const entry = attemptStore.get(key);
  if (!entry) return { locked: false };
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    const remainingMinutes = Math.ceil((entry.lockedUntil - Date.now()) / (60 * 1000));
    return { locked: true, remainingMinutes };
  }
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    attemptStore.delete(key);
    return { locked: false };
  }
  return { locked: false };
}

function recordFailedAttempt(req: Request) {
  const key = getClientIdentifier(req);
  const entry = attemptStore.get(key) || { attempts: 0 };
  entry.attempts += 1;
  if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  attemptStore.set(key, entry);
}

function recordSuccessfulAttempt(req: Request) {
  const key = getClientIdentifier(req);
  attemptStore.delete(key);
}

function secret() {
  return ENV.cookieSecret || "efen-preview-signing-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function readCookie(req: Request) {
  const raw = req.headers?.cookie ?? "";
  const pair = raw.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return pair?.slice(COOKIE_NAME.length + 1) ?? null;
}

function validPin(pin: string) {
  const configured = ENV.adminPin;
  if (!configured || !pin) return false;
  // Constant-time comparison using fixed 32-byte SHA-256 digests prevents timing side channels
  const receivedHash = createHash("sha256").update(pin).digest();
  const expectedHash = createHash("sha256").update(configured).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

export function isAdminSession(req: Request) {
  const value = readCookie(req);
  if (!value) return false;
  const [issuedAt, signature] = value.split(".");
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued) || Date.now() - issued > MAX_AGE_SECONDS * 1000 || Date.now() < issued) return false;
  const expected = sign(issuedAt);
  const received = Buffer.from(signature ?? "");
  const target = Buffer.from(expected);
  return received.length === target.length && timingSafeEqual(received, target);
}

export function establishAdminSession(req: Request, res: Response, pin: string): { success: boolean; rateLimited?: boolean; message?: string } {
  const limit = isRateLimited(req);
  if (limit.locked) {
    return {
      success: false,
      rateLimited: true,
      message: `Access temporarily locked due to excessive failed attempts. Please try again in ${limit.remainingMinutes} minute(s).`,
    };
  }

  if (!validPin(pin)) {
    recordFailedAttempt(req);
    const entry = attemptStore.get(getClientIdentifier(req));
    const remaining = entry ? Math.max(0, MAX_FAILED_ATTEMPTS - entry.attempts) : MAX_FAILED_ATTEMPTS;
    return {
      success: false,
      rateLimited: remaining === 0,
      message: remaining > 0 ? `Incorrect password. ${remaining} attempt(s) remaining before temporary lockout.` : "Too many failed attempts. Locked out for 15 minutes.",
    };
  }

  recordSuccessfulAttempt(req);
  const issuedAt = String(Date.now());
  const value = `${issuedAt}.${sign(issuedAt)}`;
  const isSecure = ENV.isProduction || Boolean(req?.secure || req?.headers?.["x-forwarded-proto"] === "https");

  res.cookie(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    maxAge: MAX_AGE_SECONDS * 1000,
    path: "/",
  });
  return { success: true };
}

export function clearAdminSession(res: Response) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: ENV.isProduction, path: "/" });
}

export function hasConfiguredAdminPin() {
  return true;
}


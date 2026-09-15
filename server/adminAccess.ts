import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";

const COOKIE_NAME = "efen_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  return ENV.cookieSecret || "efen-preview-signing-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function readCookie(req: Request) {
  const raw = req.headers.cookie ?? "";
  const pair = raw.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`));
  return pair?.slice(COOKIE_NAME.length + 1) ?? null;
}

function validPin(pin: string) {
  const configured = ENV.adminPin || (!ENV.isProduction ? "2468" : "");
  if (!configured || !pin) return false;
  const received = Buffer.from(pin);
  const expected = Buffer.from(configured);
  return received.length === expected.length && timingSafeEqual(received, expected);
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

export function establishAdminSession(req: Request, res: Response, pin: string) {
  if (!validPin(pin)) return false;
  const issuedAt = String(Date.now());
  const value = `${issuedAt}.${sign(issuedAt)}`;
  res.cookie(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.isProduction,
    maxAge: MAX_AGE_SECONDS * 1000,
    path: "/",
  });
  return true;
}

export function clearAdminSession(res: Response) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: ENV.isProduction, path: "/" });
}

export function hasConfiguredAdminPin() {
  return Boolean(ENV.adminPin || !ENV.isProduction);
}

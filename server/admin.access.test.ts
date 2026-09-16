import { describe, expect, it } from "vitest";
import { establishAdminSession, isAdminSession } from "./adminAccess";

function requestWithCookie(cookie?: string) {
  return { headers: { cookie } } as never;
}

describe("EFEN admin session security", () => {
  it("creates a valid signed session for the secure password", () => {
    let cookie = "";
    const response = {
      cookie: (_name: string, value: string) => { cookie = `efen_admin=${value}`; },
    } as never;

    const result = establishAdminSession({} as never, response, "8429@ef3n26");
    expect(result.success).toBe(true);
    expect(cookie).toContain("efen_admin=");
    expect(isAdminSession(requestWithCookie(cookie))).toBe(true);
  });

  it("rejects an incorrect password and maintains security", () => {
    const response = { cookie: () => undefined } as never;
    const result = establishAdminSession({} as never, response, "wrong-password");
    expect(result.success).toBe(false);
    expect(isAdminSession(requestWithCookie())).toBe(false);
  });
});

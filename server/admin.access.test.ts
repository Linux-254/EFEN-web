import { describe, expect, it } from "vitest";
import { establishAdminSession, isAdminSession } from "./adminAccess";

function requestWithCookie(cookie?: string) {
  return { headers: { cookie } } as never;
}

describe("EFEN admin PIN session", () => {
  it("creates a valid signed session for the preview PIN", () => {
    let cookie = "";
    const response = {
      cookie: (_name: string, value: string) => { cookie = `efen_admin=${value}`; },
    } as never;

    expect(establishAdminSession({} as never, response, "2468")).toBe(true);
    expect(cookie).toContain("efen_admin=");
    expect(isAdminSession(requestWithCookie(cookie))).toBe(true);
  });

  it("rejects the wrong PIN and a missing session", () => {
    const response = { cookie: () => undefined } as never;
    expect(establishAdminSession({} as never, response, "0000")).toBe(false);
    expect(isAdminSession(requestWithCookie())).toBe(false);
  });
});

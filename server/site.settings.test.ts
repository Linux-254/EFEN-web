import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("site.settings", () => {
  it("returns the editable content shape with safe defaults", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const result = await appRouter.createCaller(ctx).site.settings();
    expect(result.faqs.length).toBeGreaterThan(0);
    expect(result.socialLinks.length).toBeGreaterThan(0);
    expect(result.contact).toHaveProperty("address");
    expect(result.contact).toHaveProperty("whatsapp");
    expect(result.about).toHaveProperty("mission");
  });
});

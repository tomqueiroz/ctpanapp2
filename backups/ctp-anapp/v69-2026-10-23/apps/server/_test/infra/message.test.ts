import { afterEach, describe, expect, it, vi } from "vitest";

describe("message service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("sends verification code through Gateway with X-Skywork-Api-Token", async () => {
    vi.stubEnv("SKYWORK_API_TOKEN", "opaque-token");
    vi.stubEnv("SKYWORK_GATEWAY_BASE_URL", "https://gateway.example.test/");
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 0, message: "ok", data: { id: "email_1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { sendEmailVerificationCode } = await import("../../services/message");
    await expect(
      sendEmailVerificationCode({
        email: "visitor@example.test",
        code: "123456",
        expiresInMinutes: 10,
        siteName: "Demo Shop",
        locale: "zh"
      })
    ).resolves.toEqual({ id: "email_1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://gateway.example.test/api/v1/website/message/email/template/send",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Skywork-Api-Token": "opaque-token"
        }
      })
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      template_id: "email_verification_code",
      locale: "zh",
      sender_mode: "auto",
      data: {
        code: "123456",
        expires_in_minutes: 10,
        site_name: "Demo Shop"
      },
      recipient: {
        email: "visitor@example.test"
      }
    });
  });

  it("sends catalog-discovered templates through the generic helper", async () => {
    vi.stubEnv("SKYWORK_API_TOKEN", "opaque-token");
    vi.stubEnv("SKYWORK_GATEWAY_BASE_URL", "https://gateway.example.test/");
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 0, message: "ok", data: { id: "email_5" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { sendTemplateEmail } = await import("../../services/message");
    await expect(
      sendTemplateEmail({
        templateId: "order_refund_notice",
        senderMode: "public",
        data: {
          order_id: "ORDER-123",
          amount: "$12.34"
        },
        recipient: {
          email: "visitor@example.test"
        }
      })
    ).resolves.toEqual({ id: "email_5" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://gateway.example.test/api/v1/website/message/email/template/send",
      expect.objectContaining({
        body: JSON.stringify({
          template_id: "order_refund_notice",
          sender_mode: "public",
          data: {
            order_id: "ORDER-123",
            amount: "$12.34"
          },
          recipient: {
            email: "visitor@example.test"
          }
        })
      })
    );
  });

  it("fails before calling Gateway when token is missing", async () => {
    vi.stubEnv("SKYWORK_API_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { sendEmailVerificationCode, MessageServiceError } = await import("../../services/message");
    await expect(
      sendEmailVerificationCode({
        email: "visitor@example.test",
        code: "123456",
        expiresInMinutes: 10
      })
    ).rejects.toBeInstanceOf(MessageServiceError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

});

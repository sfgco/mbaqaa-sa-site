import { describe, expect, it } from "vitest";
import { clothesRequestSchema, donationNotifySchema, ibanSchema, phone } from "./index";

describe("phone", () => {
  it.each(["0512345678", "+966512345678", "966 51 234 5678", "00966512345678"])("accepts %s", (v) => {
    expect(phone.safeParse(v).success).toBe(true);
  });
  it.each(["0412345678", "12345", "05123456789"])("rejects %s", (v) => {
    expect(phone.safeParse(v).success).toBe(false);
  });
});

describe("iban", () => {
  it("normalises spaces and case", () => {
    expect(ibanSchema.parse("sa00 0000 0000 0000 0000 0000")).toBe("SA0000000000000000000000");
  });
  it("rejects non-Saudi IBANs", () => {
    expect(ibanSchema.safeParse("GB00000000000000000000").success).toBe(false);
  });
});

describe("forms", () => {
  it("rejects a filled honeypot", () => {
    const r = clothesRequestSchema.safeParse({
      name: "a", phone: "0512345678", city: "الرياض", district: "النرجس",
      quantity: "bag", itemTypes: ["men"], website: "spam",
    });
    expect(r.success).toBe(false);
  });
  it("defaults recurring to false and drops empty email", () => {
    const r = donationNotifySchema.parse({
      name: "أحمد", phone: "0512345678", email: "", amount: "100", transferDate: "2026-11-01",
    });
    expect(r.recurring).toBe(false);
    expect(r.email).toBeUndefined();
    expect(r.amount).toBe(100);
  });
});

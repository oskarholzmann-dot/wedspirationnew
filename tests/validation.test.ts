import { describe, expect, it } from "vitest";
import {
  adminPhotoFieldsSchema,
  folderFieldsSchema,
  registerSchema,
  routeId,
  userFolderFieldsSchema,
} from "@/lib/validation";

describe("validation", () => {
  it("turns empty optional photo fields into null and rejects unknown categories", () => {
    const valid = adminPhotoFieldsSchema.parse({ title: " Veil ", description: "", category: "", subcategory_id: "" });
    expect(valid).toEqual({ title: "Veil", description: null, category: null, subcategory_id: null });

    expect(adminPhotoFieldsSchema.safeParse({ title: "Veil", category: "cake" }).success).toBe(false);
  });

  it("needs at least 3 characters for a couple's folder name, but not for admins", () => {
    expect(userFolderFieldsSchema.safeParse({ name: "AB" }).success).toBe(false);
    expect(folderFieldsSchema.safeParse({ name: "AB" }).success).toBe(true);
  });

  it("rejects invalid wedding dates", () => {
    expect(folderFieldsSchema.safeParse({ name: "Our day", wedding_date: "next summer" }).success).toBe(false);
    expect(folderFieldsSchema.parse({ name: "Our day", wedding_date: "2027-06-12" }).wedding_date).toBe("2027-06-12");
  });

  it("needs a matching password confirmation to register", () => {
    const data = { name: "Mia", email: "mia@example.com", password: "secret123" };

    expect(registerSchema.safeParse({ ...data, password_confirmation: "other123" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...data, password_confirmation: "secret123" }).success).toBe(true);
  });

  it("only accepts positive whole numbers as route ids", () => {
    expect(routeId("12")).toBe(12);
    expect(routeId("0")).toBeNull();
    expect(routeId("abc")).toBeNull();
    expect(routeId("1.5")).toBeNull();
  });
});

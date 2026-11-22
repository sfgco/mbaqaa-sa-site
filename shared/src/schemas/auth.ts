import { z } from "zod";

export const userRoles = ["admin", "editor"] as const;
export const userRole = z.enum(userRoles);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("invalid_email"),
  password: z.string().min(1, "required").max(200),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email("invalid_email"),
  password: z.string().min(10, "password_too_short").max(200),
  role: userRole.default("editor"),
});

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    role: userRole,
    active: z.boolean(),
    password: z.string().min(10, "password_too_short").max(200),
  })
  .partial();

export type LoginInput = z.infer<typeof loginSchema>;
export type UserCreateInput = z.input<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

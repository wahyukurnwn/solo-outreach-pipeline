import z from "zod";

export const registerSchema = z.object({
	email: z.email(),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
});

export const forgotPasswordSchema = z.object({
	email: z.email(),
	// Menentukan link reset password mengarah ke app mana (lihat
	// config/env.ts:resetPasswordUrlByApp) — bukan dari Origin header, supaya
	// tidak bisa dipakai untuk menyuntik URL sembarangan ke email reset.
	app: z.enum(["platform", "admin"]).default("platform"),
});

export const resetPasswordSchema = z.object({
	token: z.string(),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const googleExchangeSchema = z.object({
	code: z.string(),
});

export const changePasswordSchema = z.object({
	currentPassword: z.string(),
	newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export const removePasswordSchema = z.object({
	currentPassword: z.string(),
});

import z from "zod";

export const registerSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long")
		.optional(),
});

export const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
});

export const forgotPasswordSchema = z.object({
	email: z.email(),
});

export const resetPasswordSchema = z.object({
	token: z.string(),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

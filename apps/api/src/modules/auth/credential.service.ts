import type { GoogleUser } from "@hono/oauth-providers/google";
import type z from "zod";
import { env } from "../../config/env";
import {
	AlreadyExistsError,
	InvalidCredentialsError,
	InvalidCurrentPasswordError,
	InvalidMinimumLengthPassword,
	InvalidResetTokenError,
	PasswordNotSetError,
	UnauthorizedError,
} from "../../exceptions";
import { mailer } from "../../libs/mailer";
import { comparePassword, hashPassword } from "../../libs/password";
import { generateResetToken, hashResetToken } from "../../libs/reset-token";
import { userRepository } from "../user/user.repository";
import type {
	changePasswordSchema,
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
} from "./auth.schema";
import { passwordResetTokenRepository } from "./password-reset-token.repository";

export const credentialService = {
	async register({ email, password }: z.infer<typeof registerSchema>) {
		if (!password || password.length < 8)
			throw new InvalidMinimumLengthPassword();

		const existingUser = await userRepository.findByEmail(email);

		if (existingUser) throw new AlreadyExistsError();

		const passwordHash = await hashPassword(password);

		return userRepository.create({ email, password: passwordHash });
	},
	async login({ email, password }: z.infer<typeof loginSchema>) {
		const existingUser = await userRepository.findByEmail(email);
		if (!existingUser?.password) throw new InvalidCredentialsError();

		const isPasswordValid = await comparePassword(
			password,
			existingUser.password,
		);
		if (!isPasswordValid) throw new InvalidCredentialsError();

		return { user: existingUser };
	},
	async loginWithGoogle({ id: googleId, email }: Partial<GoogleUser>) {
		if (!googleId || !email) throw new InvalidCredentialsError();

		const existingUserByGoogleId =
			await userRepository.findByGoogleId(googleId);
		if (existingUserByGoogleId) return { user: existingUserByGoogleId };

		const existingUserByEmail = await userRepository.findByEmail(email);
		if (existingUserByEmail)
			return {
				user: await userRepository.linkGoogleId(
					existingUserByEmail.id,
					googleId,
				),
			};

		return { user: await userRepository.create({ email, googleId }) };
	},
	async forgotPassword({ email }: z.infer<typeof forgotPasswordSchema>) {
		const existingUser = await userRepository.findByEmail(email);

		// Tidak melempar error kalau email tidak ditemukan — sama seperti InvalidCredentialsError,
		// mencegah endpoint ini dipakai untuk mengecek daftar email terdaftar.
		if (!existingUser) return;

		const rawToken = generateResetToken();
		const tokenHash = hashResetToken(rawToken);
		const expiresAt = new Date(
			Date.now() + env.passwordResetTtlMinutes * 60 * 1000,
		);

		await passwordResetTokenRepository.create({
			userId: existingUser.id,
			tokenHash,
			expiresAt,
		});

		const resetUrl = `${env.corsOrigins[0]}/auth/reset-password?token=${rawToken}`;

		await mailer.sendPasswordResetEmail(existingUser.email, resetUrl);
	},
	async resetPassword({
		token,
		password,
	}: z.infer<typeof resetPasswordSchema>) {
		const tokenHash = hashResetToken(token);
		const resetToken =
			await passwordResetTokenRepository.findByTokenHash(tokenHash);

		if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date())
			throw new InvalidResetTokenError();

		const passwordHash = await hashPassword(password);

		await userRepository.updatePassword(resetToken.userId, passwordHash);
		await passwordResetTokenRepository.markUsed(resetToken.id);
	},
	async changePassword(
		userId: string,
		{ currentPassword, newPassword }: z.infer<typeof changePasswordSchema>,
	) {
		const existingUser = await userRepository.findById(userId);
		if (!existingUser) throw new UnauthorizedError();

		if (!existingUser.password) throw new PasswordNotSetError();

		const isCurrentPasswordValid = await comparePassword(
			currentPassword,
			existingUser.password,
		);
		if (!isCurrentPasswordValid) throw new InvalidCurrentPasswordError();

		const passwordHash = await hashPassword(newPassword);

		await userRepository.updatePassword(userId, passwordHash);
	},
};

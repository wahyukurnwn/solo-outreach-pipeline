import type { GoogleUser } from "@hono/oauth-providers/google";
import type z from "zod";
import {
	AlreadyExistsError,
	InvalidCredentialsError,
	InvalidMinimumLengthPassword,
} from "../../exceptions";
import { comparePassword, hashPassword } from "../../libs/password";
import { userRepository } from "../user/user.repository";
import type { loginSchema, registerSchema } from "./auth.schema";

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
};

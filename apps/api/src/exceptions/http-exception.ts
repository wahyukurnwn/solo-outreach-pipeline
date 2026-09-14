import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorBody = {
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
};

export class AppError extends HTTPException {
	readonly code: string;
	readonly details?: unknown;

	constructor(
		status: ContentfulStatusCode,
		code: string,
		message: string,
		details?: unknown,
	) {
		super(status, { message });
		this.name = new.target.name;
		this.code = code;
		this.details = details;
	}

	toBody(): ErrorBody {
		return {
			error: {
				code: this.code,
				message: this.message,
				...(this.details === undefined ? {} : { details: this.details }),
			},
		};
	}
}

/** Akun Sudah pernah terdaftar */
export class AlreadyExistsError extends AppError {
	constructor(message = "Email already registered!") {
		super(409, "CONFLICT", message);
	}
}

/** Password yang digunakan terlalu pendek */
export class InvalidMinimumLengthPassword extends AppError {
	constructor(message = "Password must be at least 8 characters long") {
		super(422, "UNPROCESSABLE_ENTITY", message);
	}
}

/**
 * Sengaja tidak membedakan "email tidak terdaftar" dari "password salah":
 * pesan spesifik akan membocorkan daftar email terdaftar (PRD §6 user story 7).
 */
export class InvalidCredentialsError extends AppError {
	constructor() {
		super(401, "INVALID_CREDENTIALS", "Email atau password salah");
	}
}

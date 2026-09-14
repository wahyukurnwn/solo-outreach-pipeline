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

/** Sudah login, tapi role-nya tidak cukup — beda dari 401. */
export class ForbiddenError extends AppError {
	constructor(message = "Akses ditolak") {
		super(403, "FORBIDDEN", message);
	}
}

/** Token tidak ada/kedaluwarsa/tidak sah — client harus login ulang. */
export class UnauthorizedError extends AppError {
	constructor(message = "Autentikasi dibutuhkan", code = "UNAUTHORIZED") {
		super(401, code, message);
	}
}

/** Dependency eksternal belum dikonfigurasi (mis. kredensial Google kosong). */
export class ServiceUnavailableError extends AppError {
	constructor(message: string, code = "SERVICE_UNAVAILABLE") {
		super(503, code, message);
	}
}

/** Token reset password tidak ditemukan, sudah dipakai, atau sudah kedaluwarsa. */
export class InvalidResetTokenError extends AppError {
	constructor() {
		super(
			400,
			"INVALID_RESET_TOKEN",
			"Token reset password tidak valid atau sudah kedaluwarsa",
		);
	}
}

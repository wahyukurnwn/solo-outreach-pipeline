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

/** Resource tidak ditemukan, atau ditemukan tapi bukan milik user yang login — sengaja disamakan jadi 404 supaya tidak bocor keberadaan data milik user lain. */
export class NotFoundError extends AppError {
	constructor(message = "Data tidak ditemukan") {
		super(404, "NOT_FOUND", message);
	}
}

/** Body/param/query request tidak lolos validasi Zod — disamakan formatnya dengan error lain lewat AppError. */
export class ValidationError extends AppError {
	constructor(details: unknown) {
		super(422, "VALIDATION_ERROR", "Data yang dikirim tidak valid", details);
	}
}

/** Kode tukar (exchange code) OAuth Google tidak ditemukan, sudah dipakai, atau sudah kedaluwarsa. */
export class InvalidExchangeCodeError extends AppError {
	constructor() {
		super(
			400,
			"INVALID_EXCHANGE_CODE",
			"Kode OAuth tidak valid atau sudah kedaluwarsa",
		);
	}
}

/** Password saat ini yang dikirim ke endpoint ganti password tidak cocok. */
export class InvalidCurrentPasswordError extends AppError {
	constructor() {
		super(401, "INVALID_CURRENT_PASSWORD", "Password saat ini salah");
	}
}

/** Akun belum pernah punya password (mis. cuma pernah signup/login lewat Google) — arahkan ke alur forgot-password buat membuat password pertama kali. */
export class PasswordNotSetError extends AppError {
	constructor() {
		super(
			409,
			"PASSWORD_NOT_SET",
			"Akun ini belum punya password. Gunakan fitur lupa password untuk membuat password baru.",
		);
	}
}

/** Akun belum terhubung dengan Google — tidak ada apa-apa buat di-unlink. */
export class GoogleNotLinkedError extends AppError {
	constructor() {
		super(409, "GOOGLE_NOT_LINKED", "Akun ini belum terhubung dengan Google");
	}
}

/**
 * Invariant ERD: setiap user wajib punya minimal satu dari password atau
 * googleId — mencegah aksi (unlink Google / hapus password) yang bakal
 * bikin user kehilangan semua cara login.
 */
export class LastAuthMethodError extends AppError {
	constructor() {
		super(
			409,
			"LAST_AUTH_METHOD",
			"Tidak bisa menghapus metode login terakhir. Pastikan akun masih punya cara login lain sebelum ini dihapus.",
		);
	}
}

/** Belum ada user dengan is_demo=true — endpoint /api/demo/* belum bisa dipakai sampai satu akun ditandai sebagai demo. */
export class DemoUnavailableError extends AppError {
	constructor() {
		super(503, "DEMO_UNAVAILABLE", "Data demo belum tersedia");
	}
}

/** Terlalu banyak percobaan dari IP yang sama dalam satu window waktu — proteksi brute-force di endpoint auth sensitif (signin/signup/forgot-password). */
export class TooManyRequestsError extends AppError {
	constructor(retryAfterSeconds: number) {
		super(
			429,
			"TOO_MANY_REQUESTS",
			"Terlalu banyak percobaan. Coba lagi nanti.",
			{
				retryAfterSeconds,
			},
		);
	}
}

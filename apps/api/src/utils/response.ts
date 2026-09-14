export interface SuccessResponse<T> {
	status: number;
	message: string;
	data?: T;
}

export function createdAccountResponse<T>(
	message: string,
	_data?: T,
): SuccessResponse<T> {
	return {
		status: 201,
		message,
	};
}

export function messageResponse(message: string): SuccessResponse<undefined> {
	return {
		status: 200,
		message,
	};
}

/** Bungkus array jadi `{ data: [...] }` — dipakai semua endpoint listing (GET /api/prospects, /api/admin/users, dst). */
export function listResponse<T>(data: T[]): { data: T[] } {
	return { data };
}

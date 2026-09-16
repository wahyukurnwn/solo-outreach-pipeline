// Setiap error response dari apps/api
// { error: { code, message, details? } } — lihat exceptions/http-exception.ts.

export async function extractErrorMessage(res: Response, fallback: string) {
	try {
		const body = (await res.json()) as { error?: { message?: string } };
		return body.error?.message ?? fallback;
	} catch {
		return fallback;
	}
}

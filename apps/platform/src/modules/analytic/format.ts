const percentFormatter = new Intl.NumberFormat("en-US", {
	style: "percent",
	maximumFractionDigits: 1,
});

// null berarti belum ada prospek yang dihubungi — ditampilkan sebagai "—",
// bukan "0%", karena 0% akan terbaca seperti "sudah dicoba dan gagal semua".
export function formatRate(rate: number | null) {
	return rate === null ? "—" : percentFormatter.format(rate);
}

// Di bawah angka ini rate masih mudah berubah drastis oleh satu-dua prospek.
export const SMALL_SAMPLE_SIZE = 30;

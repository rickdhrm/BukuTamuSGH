/** Visit purpose options for the dropdown */
export const VISIT_PURPOSES = [
  { value: "rapat", label: "Rapat" },
  { value: "kirim_barang", label: "Kirim Barang" },
  { value: "kirim_dokumen", label: "Kirim Dokumen" },
  { value: "maintenance", label: "Maintenance" },
  { value: "lainnya", label: "Lainnya" },
] as const;

/** KTP / ID Card status options */
export const KTP_STATUS_OPTIONS = [
  { value: "belum_diverifikasi", label: "Belum Diverifikasi" },
  { value: "ditahan", label: "KTP Ditahan" },
  { value: "diverifikasi", label: "Sudah Diverifikasi" },
] as const;

/** Max selfie file size in bytes (500kb) */
export const MAX_SELFIE_SIZE = 500 * 1024;

/** Selfie compression quality (0-1) */
export const SELFIE_COMPRESSION_QUALITY = 0.7;

/** Max selfie width in pixels after compression */
export const SELFIE_MAX_WIDTH = 800;

/** Session cookie name */
export const SESSION_COOKIE_NAME = "bukutamu_session";

/** Application name */
export const APP_NAME = "Buku Tamu SGH Tower";

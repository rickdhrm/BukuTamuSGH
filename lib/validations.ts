export interface PersonalInfoFormData {
  namaLengkap: string;
  nomorTelepon: string;
  asalPerusahaan: string;
  alamatPerusahaan: string;
}

export interface VisitDetailsFormData {
  tujuanBerkunjung: string;
  tujuanBerkunjungLainnya?: string;
  perusahaanTujuan: string;
  departemenTujuan: string;
  namaOrangDituju: string;
  keperluan: string;
}

export interface FullGuestFormData extends PersonalInfoFormData, VisitDetailsFormData {
  selfieImage: string;
}

export type PersonalInfoErrors = Partial<Record<keyof PersonalInfoFormData, string>>;
export type VisitDetailsErrors = Partial<Record<keyof VisitDetailsFormData, string>>;

export function validatePersonalInfo(data: PersonalInfoFormData): PersonalInfoErrors {
  const errors: PersonalInfoErrors = {};

  if (!data.namaLengkap.trim()) {
    errors.namaLengkap = "Nama lengkap wajib diisi";
  }

  if (!data.nomorTelepon.trim()) {
    errors.nomorTelepon = "Nomor telepon wajib diisi";
  } else if (!/^[0-9+\-\s]{8,15}$/.exec(data.nomorTelepon.trim())) {
    errors.nomorTelepon = "Nomor telepon tidak valid (contoh: 08123456789)";
  }

  if (!data.asalPerusahaan.trim()) {
    errors.asalPerusahaan = "Asal perusahaan / instansi wajib diisi";
  }

  if (!data.alamatPerusahaan.trim()) {
    errors.alamatPerusahaan = "Alamat perusahaan wajib diisi";
  }

  return errors;
}

export function validateVisitDetails(data: VisitDetailsFormData): VisitDetailsErrors {
  const errors: VisitDetailsErrors = {};

  if (!data.tujuanBerkunjung) {
    errors.tujuanBerkunjung = "Pilih tujuan berkunjung";
  } else if (data.tujuanBerkunjung === "lainnya" && (!data.tujuanBerkunjungLainnya || !data.tujuanBerkunjungLainnya.trim())) {
    errors.tujuanBerkunjungLainnya = "Sebutkan tujuan berkunjung Anda";
  }

  if (!data.perusahaanTujuan.trim()) {
    errors.perusahaanTujuan = "Nama perusahaan tujuan (tenant) wajib diisi";
  }

  if (!data.departemenTujuan.trim()) {
    errors.departemenTujuan = "Departemen tujuan wajib diisi";
  }

  if (!data.namaOrangDituju.trim()) {
    errors.namaOrangDituju = "Nama orang yang dituju wajib diisi";
  }

  if (!data.keperluan.trim()) {
    errors.keperluan = "Detail keperluan wajib diisi";
  }

  return errors;
}

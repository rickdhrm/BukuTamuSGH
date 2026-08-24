import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonalInfoFormData, PersonalInfoErrors } from "@/lib/validations";

interface PersonalInfoStepProps {
  formData: PersonalInfoFormData;
  errors: PersonalInfoErrors;
  onChange: (field: keyof PersonalInfoFormData, value: string) => void;
  onNext: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  errors,
  onChange,
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Bagian 1: Data Diri &amp; Instansi
        </h2>
        <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
          Silakan isi informasi identitas dan asal perusahaan/instansi Anda.
        </p>
      </div>

      <Input
        label="Nama Lengkap"
        placeholder="Contoh: Budi Santoso"
        value={formData.namaLengkap}
        onChange={(e) => onChange("namaLengkap", e.target.value)}
        error={errors.namaLengkap}
        required
      />

      <Input
        label="Nomor Telepon (WhatsApp)"
        type="tel"
        placeholder="Contoh: 081234567890"
        value={formData.nomorTelepon}
        onChange={(e) => onChange("nomorTelepon", e.target.value)}
        error={errors.nomorTelepon}
        required
      />

      <Input
        label="Asal Perusahaan / Instansi"
        placeholder="Contoh: PT Teknologi Bangunan"
        value={formData.asalPerusahaan}
        onChange={(e) => onChange("asalPerusahaan", e.target.value)}
        error={errors.asalPerusahaan}
        required
      />

      <Input
        label="Alamat Perusahaan / Instansi"
        placeholder="Contoh: Jl. Sudirman No. 45, Jakarta Selatan"
        value={formData.alamatPerusahaan}
        onChange={(e) => onChange("alamatPerusahaan", e.target.value)}
        error={errors.alamatPerusahaan}
        required
      />

      <div className="pt-4 flex justify-end">
        <Button type="submit" size="lg" className="w-full sm:w-auto font-bold">
          Lanjut Ke Detail Kunjungan →
        </Button>
      </div>
    </form>
  );
};

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VISIT_PURPOSES } from "@/lib/constants";
import { VisitDetailsFormData, VisitDetailsErrors } from "@/lib/validations";

interface VisitDetailsStepProps {
  formData: VisitDetailsFormData;
  errors: VisitDetailsErrors;
  onChange: (field: keyof VisitDetailsFormData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const VisitDetailsStep: React.FC<VisitDetailsStepProps> = ({
  formData,
  errors,
  onChange,
  onNext,
  onBack,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h2 className="text-xl font-bold text-white">Bagian 2: Detail Kunjungan</h2>
        <p className="text-xs text-slate-400">
          Silakan isi informasi pihak dan keperluan kunjungan Anda di SGH Tower.
        </p>
      </div>

      <Select
        label="Tujuan Berkunjung"
        options={VISIT_PURPOSES}
        value={formData.tujuanBerkunjung}
        onChange={(e) => onChange("tujuanBerkunjung", e.target.value)}
        error={errors.tujuanBerkunjung}
        required
      />

      {/* Conditional Input if "Lainnya" is selected */}
      {formData.tujuanBerkunjung === "lainnya" && (
        <Input
          label="Sebutkan Tujuan Berkunjung (Lainnya)"
          placeholder="Contoh: Audit Fasilitas / Wawancara Kerja"
          value={formData.tujuanBerkunjungLainnya || ""}
          onChange={(e) => onChange("tujuanBerkunjungLainnya", e.target.value)}
          error={errors.tujuanBerkunjungLainnya}
          required
          className="animate-fade-in"
        />
      )}

      <Input
        label="Nama Perusahaan Tujuan (Tenant)"
        placeholder="Contoh: PT SGH Indonesia"
        value={formData.perusahaanTujuan}
        onChange={(e) => onChange("perusahaanTujuan", e.target.value)}
        error={errors.perusahaanTujuan}
        required
      />

      <Input
        label="Bertemu dengan Bagian? (Departemen)"
        placeholder="Contoh: IT / General Affairs / Marketing"
        value={formData.departemenTujuan}
        onChange={(e) => onChange("departemenTujuan", e.target.value)}
        error={errors.departemenTujuan}
        required
      />

      <Input
        label="Nama Orang yang Dituju"
        placeholder="Contoh: Ibu Rina Permata"
        value={formData.namaOrangDituju}
        onChange={(e) => onChange("namaOrangDituju", e.target.value)}
        error={errors.namaOrangDituju}
        required
      />

      <Textarea
        label="Keperluan"
        placeholder="Jelaskan secara singkat keperluan kunjungan Anda..."
        value={formData.keperluan}
        onChange={(e) => onChange("keperluan", e.target.value)}
        error={errors.keperluan}
        required
        rows={3}
      />

      <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="w-full sm:w-auto"
        >
          ← Kembali
        </Button>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Lanjut Ke Selfie Verification →
        </Button>
      </div>
    </form>
  );
};

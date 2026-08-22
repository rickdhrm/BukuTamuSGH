"use client";

import React, { useState } from "react";
import { StepIndicator } from "@/components/ui/step-indicator";
import { PersonalInfoStep } from "./personal-info-step";
import { VisitDetailsStep } from "./visit-details-step";
import { SelfieStep } from "./selfie-step";
import { ConfirmationScreen } from "./confirmation-screen";
import {
  PersonalInfoFormData,
  VisitDetailsFormData,
  PersonalInfoErrors,
  VisitDetailsErrors,
  validatePersonalInfo,
  validateVisitDetails,
} from "@/lib/validations";

const initialPersonalInfo: PersonalInfoFormData = {
  namaLengkap: "",
  nomorTelepon: "",
  asalPerusahaan: "",
  alamatPerusahaan: "",
};

const initialVisitDetails: VisitDetailsFormData = {
  tujuanBerkunjung: "",
  tujuanBerkunjungLainnya: "",
  perusahaanTujuan: "",
  departemenTujuan: "",
  namaOrangDituju: "",
  keperluan: "",
};

export const GuestRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoFormData>(initialPersonalInfo);
  const [visitDetails, setVisitDetails] = useState<VisitDetailsFormData>(initialVisitDetails);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const [personalInfoErrors, setPersonalInfoErrors] = useState<PersonalInfoErrors>({});
  const [visitDetailsErrors, setVisitDetailsErrors] = useState<VisitDetailsErrors>({});
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedGuest, setSubmittedGuest] = useState<{
    namaLengkap: string;
    waktuMasuk: string;
  } | null>(null);

  // Field change handlers
  const handlePersonalInfoChange = (field: keyof PersonalInfoFormData, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
    if (personalInfoErrors[field]) {
      setPersonalInfoErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleVisitDetailsChange = (field: keyof VisitDetailsFormData, value: string) => {
    setVisitDetails((prev) => ({ ...prev, [field]: value }));
    if (visitDetailsErrors[field]) {
      setVisitDetailsErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Step 1 -> Step 2
  const handleNextFromStep1 = () => {
    const errors = validatePersonalInfo(personalInfo);
    if (Object.keys(errors).length > 0) {
      setPersonalInfoErrors(errors);
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 -> Step 3
  const handleNextFromStep2 = () => {
    const errors = validateVisitDetails(visitDetails);
    if (Object.keys(errors).length > 0) {
      setVisitDetailsErrors(errors);
      return;
    }
    setCurrentStep(3);
  };

  // Final Form Submission
  const handleSubmit = async () => {
    if (!selfieImage) {
      setSubmitError("Foto selfie wajib diambil untuk verifikasi keamanan.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      // Format visit purpose string if "Lainnya" was chosen
      const formattedTujuan =
        visitDetails.tujuanBerkunjung === "lainnya"
          ? `Lainnya: ${visitDetails.tujuanBerkunjungLainnya || ""}`
          : visitDetails.tujuanBerkunjung;

      // 1. Upload selfie image
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: selfieImage }),
      });

      let selfiePath = "";
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        selfiePath = uploadData.filePath || "";
      }

      // 2. Submit guest record
      const guestRes = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personalInfo,
          ...visitDetails,
          tujuanBerkunjung: formattedTujuan,
          selfiePath,
        }),
      });

      if (!guestRes.ok) {
        const errorData = await guestRes.json();
        throw new Error(errorData.message || "Gagal menyimpan data pendaftaran.");
      }

      const newGuest = await guestRes.json();
      setSubmittedGuest({
        namaLengkap: newGuest.namaLengkap || personalInfo.namaLengkap,
        waktuMasuk: newGuest.waktuMasuk || new Date().toISOString(),
      });
      setCurrentStep(4);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPersonalInfo(initialPersonalInfo);
    setVisitDetails(initialVisitDetails);
    setSelfieImage(null);
    setPersonalInfoErrors({});
    setVisitDetailsErrors({});
    setSubmitError(undefined);
    setSubmittedGuest(null);
    setCurrentStep(1);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
          <span>🏢 SGH Tower</span>
          <span>•</span>
          <span>Portal Tamu</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Buku Tamu Digital
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Pendaftaran Kunjungan Tamu Gedung SGH Tower
        </p>
      </div>

      {/* Glass Card Container */}
      <div className="glass-card p-6 sm:p-8">
        {currentStep <= 3 && (
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        )}

        {currentStep === 1 && (
          <PersonalInfoStep
            formData={personalInfo}
            errors={personalInfoErrors}
            onChange={handlePersonalInfoChange}
            onNext={handleNextFromStep1}
          />
        )}

        {currentStep === 2 && (
          <VisitDetailsStep
            formData={visitDetails}
            errors={visitDetailsErrors}
            onChange={handleVisitDetailsChange}
            onNext={handleNextFromStep2}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <SelfieStep
            selfieImage={selfieImage}
            onSelfieCaptured={setSelfieImage}
            onRetake={() => setSelfieImage(null)}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(2)}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        )}

        {currentStep === 4 && submittedGuest && (
          <ConfirmationScreen
            guestName={submittedGuest.namaLengkap}
            waktuMasuk={submittedGuest.waktuMasuk}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-500 text-xs">
        <p>© {new Date().getFullYear()} SGH Tower Building Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { prisma } from "@/lib/prisma";
import { mockGuestsStore } from "@/app/api/guests/route";
import { formatDateShort, formatTime, formatDateTime } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "xlsx").toLowerCase();
    const name = searchParams.get("name") || "";
    const dateStr = searchParams.get("date") || "";

    // 1. Fetch filtered guest records
    let guestRecords: any[] = [];

    try {
      const whereClause: any = {};
      if (name) {
        whereClause.namaLengkap = { contains: name, mode: "insensitive" };
      }
      if (dateStr) {
        const startOfDay = new Date(`${dateStr}T00:00:00.000+07:00`);
        const endOfDay = new Date(`${dateStr}T23:59:59.999+07:00`);
        whereClause.waktuMasuk = { gte: startOfDay, lte: endOfDay };
      }

      guestRecords = await prisma.guest.findMany({
        where: whereClause,
        orderBy: { waktuMasuk: "desc" },
      });
    } catch (dbErr) {
      // Fallback to in-memory mock store
      let filtered = [...mockGuestsStore];
      if (name) {
        filtered = filtered.filter((g) =>
          g.namaLengkap.toLowerCase().includes(name.toLowerCase())
        );
      }
      if (dateStr) {
        filtered = filtered.filter((g) => g.waktuMasuk && g.waktuMasuk.startsWith(dateStr));
      }
      guestRecords = filtered;
    }

    const dateTag = dateStr || new Date().toISOString().split("T")[0];

    // ===================================
    // EXCEL EXPORT (.xlsx)
    // ===================================
    if (format === "xlsx" || format === "excel") {
      // Format tabular data with separated Date and Time columns (Asia/Jakarta UTC+7)
      const excelRows = guestRecords.map((g, index) => ({
        No: index + 1,
        "Tanggal Masuk": g.waktuMasuk ? formatDateShort(g.waktuMasuk) : "-",
        "Jam Masuk": g.waktuMasuk ? `${formatTime(g.waktuMasuk)} WIB` : "-",
        "Tanggal Keluar": g.waktuKeluar ? formatDateShort(g.waktuKeluar) : "Belum Out",
        "Jam Keluar": g.waktuKeluar ? `${formatTime(g.waktuKeluar)} WIB` : "Belum Out",
        "Nama Lengkap": g.namaLengkap,
        "No. Telepon": g.nomorTelepon,
        "Asal Perusahaan": g.asalPerusahaan,
        "Alamat Perusahaan": g.alamatPerusahaan,
        "Tujuan Berkunjung": g.tujuanBerkunjung,
        "Perusahaan Tujuan": g.perusahaanTujuan,
        Departemen: g.departemenTujuan,
        "Orang Dituju": g.namaOrangDituju,
        Keperluan: g.keperluan,
        "No. Kartu Akses": g.nomorKartuAkses || "-",
        "Status KTP": g.statusKtp || "Belum Diverifikasi",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);

      // Auto-adjust column widths
      const colWidths = Object.keys(excelRows[0] || {}).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...excelRows.map((row: any) => String(row[key] || "").length)
        );
        return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
      });
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Tamu");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new Response(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="Laporan_Tamu_SGH_Tower_${dateTag}.xlsx"`,
        },
      });
    }

    // ===================================
    // PDF EXPORT (.pdf) - Asia/Jakarta UTC+7
    // ===================================
    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Title & Header Information
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN KUNJUNGAN TAMU — SGH TOWER", 14, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Tanggal Filter: ${dateTag} | Total Tamu: ${guestRecords.length} | Waktu Cetak: ${formatDateTime(new Date())}`,
        14,
        22
      );

      const tableHeaders = [
        [
          "No",
          "Tgl & Jam Masuk (WIB)",
          "Tgl & Jam Keluar (WIB)",
          "Nama Tamu",
          "No. Telp",
          "Perusahaan",
          "Tujuan",
          "Perusahaan Tujuan",
          "Orang Dituju",
          "No. Kartu",
          "Status KTP",
        ],
      ];

      const tableData = guestRecords.map((g, index) => [
        index + 1,
        g.waktuMasuk ? `${formatDateShort(g.waktuMasuk)} ${formatTime(g.waktuMasuk)}` : "-",
        g.waktuKeluar ? `${formatDateShort(g.waktuKeluar)} ${formatTime(g.waktuKeluar)}` : "Belum Out",
        g.namaLengkap,
        g.nomorTelepon,
        g.asalPerusahaan,
        g.tujuanBerkunjung,
        g.perusahaanTujuan,
        g.namaOrangDituju,
        g.nomorKartuAkses || "-",
        g.statusKtp || "Belum Diverifikasi",
      ]);

      autoTable(doc, {
        startY: 26,
        head: tableHeaders,
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 25, left: 14, right: 14 },
      });

      const pdfArrayBuffer = doc.output("arraybuffer");
      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Laporan_Tamu_SGH_Tower_${dateTag}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { message: "Format tidak didukung. Gunakan format=xlsx atau format=pdf" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      { message: "Gagal mengekspor data: " + error.message },
      { status: 500 }
    );
  }
}

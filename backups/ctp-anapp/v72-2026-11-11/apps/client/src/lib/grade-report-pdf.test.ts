import { describe, expect, it } from "vitest";
import type { GradeReport } from "@/lib";
import {
  buildGradeReportFileName,
  buildGradeReportPdf,
} from "./grade-report-pdf";

function makeReport(chapterCount = 20): GradeReport {
  return {
    user: {
      first_name: "João",
      last_name: "da Silva",
      cpf: "222.333.456-11",
    },
    chapters: Array.from({ length: chapterCount }, (_, index) => ({
      chapter_number: index + 1,
      chapter_title: `Conteúdo técnico do capítulo ${index + 1}`,
      best_score: index % 3 === 0 ? 58.5 : 87.25,
      attempts: index + 1,
    })),
    average_score: 77.66,
    total_chapters: chapterCount,
    completed_chapters: Math.floor(chapterCount * 0.7),
    is_certified: false,
    passing_score: 70,
    generated_at: "2026-08-18T12:00:00.000Z",
  };
}

describe("grade report PDF", () => {
  it("builds a non-empty multipage PDF for a long report", () => {
    const pdf = buildGradeReportPdf(makeReport(30));
    const bytes = pdf.output("arraybuffer");

    expect(bytes.byteLength).toBeGreaterThan(5_000);
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
  });

  it("supports a report without exams without invalid progress values", () => {
    const pdf = buildGradeReportPdf(makeReport(0));
    const bytes = pdf.output("arraybuffer");

    expect(bytes.byteLength).toBeGreaterThan(1_000);
    expect(pdf.getNumberOfPages()).toBe(1);
  });

  it("creates a safe file name without accents or spaces", () => {
    expect(buildGradeReportFileName(makeReport())).toBe(
      "Boletim_CTP_ANAPP_Joao_da_Silva.pdf",
    );
  });
});

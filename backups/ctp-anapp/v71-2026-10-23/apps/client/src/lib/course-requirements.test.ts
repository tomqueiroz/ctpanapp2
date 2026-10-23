import { describe, expect, it } from "vitest";
import {
  calculateChapterCompletionPercentage,
  chapterHasAssessments,
  COURSE_PASSING_GRADE,
  COURSE_PASSING_SCORE_PERCENT,
} from "./course-requirements";

describe("course certification requirements", () => {
  it("requires 70% (grade 7.0) for course approval", () => {
    expect(COURSE_PASSING_SCORE_PERCENT).toBe(70);
    expect(COURSE_PASSING_GRADE).toBe(7);
  });

  it.each([0, 13, 14])(
    "exempts chapter %i from quiz and exam requirements",
    (chapterNumber) => {
      expect(chapterHasAssessments(chapterNumber)).toBe(false);
    },
  );

  it("keeps assessments required in chapters 1 through 12", () => {
    for (let chapterNumber = 1; chapterNumber <= 12; chapterNumber += 1) {
      expect(chapterHasAssessments(chapterNumber)).toBe(true);
    }
  });

  it("allows chapter zero to reach 100% without unavailable activities", () => {
    expect(
      calculateChapterCompletionPercentage(0, {
        video_completed: true,
        apostila_completed: true,
        podcast_completed: true,
      }),
    ).toBe(100);
  });

  it.each([13, 14])(
    "allows chapter %i to reach 100% without quiz or exam",
    (chapterNumber) => {
      expect(
        calculateChapterCompletionPercentage(chapterNumber, {
          video_completed: true,
          apostila_completed: true,
          podcast_completed: true,
          materials_completed: true,
          slides_completed: true,
          quiz_completed: false,
        }),
      ).toBe(100);
    },
  );
});

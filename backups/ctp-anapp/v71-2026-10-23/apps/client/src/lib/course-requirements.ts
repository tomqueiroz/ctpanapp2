export const CERTIFICATE_EXEMPT_CHAPTERS = [0, 13, 14] as const;
export const COURSE_PASSING_SCORE_PERCENT = 70;
export const COURSE_PASSING_GRADE = 7;

type ChapterProgressState = {
  video_completed?: boolean;
  apostila_completed?: boolean;
  podcast_completed?: boolean;
  quiz_completed?: boolean;
  materials_completed?: boolean;
  slides_completed?: boolean;
};

export function chapterHasAssessments(chapterNumber: number): boolean {
  return !CERTIFICATE_EXEMPT_CHAPTERS.some(
    (exemptChapter) => exemptChapter === chapterNumber,
  );
}

export function calculateChapterCompletionPercentage(
  chapterNumber: number,
  progress: ChapterProgressState | null | undefined,
): number {
  const requirements = [
    Boolean(progress?.video_completed),
    Boolean(progress?.apostila_completed),
    Boolean(progress?.podcast_completed),
  ];

  if (chapterNumber !== 0) {
    requirements.push(
      Boolean(progress?.materials_completed),
      Boolean(progress?.slides_completed),
    );
  }

  if (chapterHasAssessments(chapterNumber)) {
    requirements.push(Boolean(progress?.quiz_completed));
  }

  const completed = requirements.filter(Boolean).length;
  return Math.round((completed / requirements.length) * 100);
}

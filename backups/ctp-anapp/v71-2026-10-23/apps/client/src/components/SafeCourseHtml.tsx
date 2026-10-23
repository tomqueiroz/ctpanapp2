import { useMemo } from 'react';
import DOMPurify from 'dompurify';

export function sanitizeCourseHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['style', 'srcdoc'],
  });
}

export function SafeCourseHtml({ html }: { html: string }) {
  const sanitized = useMemo(() => sanitizeCourseHtml(html), [html]);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

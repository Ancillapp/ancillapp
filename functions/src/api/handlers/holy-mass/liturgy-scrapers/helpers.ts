import sanitizeHtml from 'sanitize-html';

export const dropHtml = (str: string) =>
  sanitizeHtml(str.replace(/(?:\s*<br\s*\/?>\s*)+/gi, '\n'), {
    allowedTags: [],
  }).trim();

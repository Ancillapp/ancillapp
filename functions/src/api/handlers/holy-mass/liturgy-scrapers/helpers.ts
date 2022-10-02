import sanitizeHtml from 'sanitize-html';

export const dropHtml = (str: string) =>
  sanitizeHtml(str.replace(/(?:\s*<br\s*\/?>\s*)+/, '\n'), {
    allowedTags: [],
  }).trim();

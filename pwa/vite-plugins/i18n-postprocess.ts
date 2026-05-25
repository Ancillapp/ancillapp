import { remark } from 'remark';
import gfm from 'remark-gfm';
import html from 'remark-html';
import breaks from 'remark-breaks';
import { Script } from 'node:vm';
import { generateMessageId } from '@lingui/message-utils/generateMessageId';
import type { Plugin } from 'vite';

const parser = remark().use(gfm).use(html).use(breaks);

const markdownPoweredTranslations = [
  'ffbInfoDescription',
  'marianSpiritualityDescription',
  'franciscanSpiritualityDescription',
  'founderDescription',
  'foundationDescription',
  'prayerPillarDescription',
  'hospitalityPillarDescription',
  'brotherlyLifePillarDescription',
  'bookingCancellationConfirmation {0} {1} {2}',
  'breviaryAlternative',
].map((key) => generateMessageId(key));

const mapMessage = async (
  key: string,
  value: string | (string | string[])[],
) => {
  if (!markdownPoweredTranslations.includes(key)) {
    return value;
  }

  if (typeof value === 'string') {
    const vfile = await parser.process(value);
    return vfile.value.toString();
  }

  if (!Array.isArray(value)) {
    return value;
  }

  const tempString = value
    .map((element, index) =>
      typeof element === 'string' ? element : `$$${index}$$`,
    )
    .join('');

  const vfile = await parser.process(tempString);
  const contentsString = vfile.value.toString();

  const regex = /\$\$(\d+)\$\$/g;
  let match;
  const newArr: (string | string[])[] = [];
  let prevStartIndex = 0;

  while ((match = regex.exec(contentsString)) !== null) {
    const { 0: stringMatch, 1: arrIndex, index } = match;
    newArr.push(
      contentsString.slice(prevStartIndex, index),
      value[parseInt(arrIndex, 10)],
    );
    prevStartIndex = index + stringMatch.length;
  }

  newArr.push(contentsString.slice(prevStartIndex));

  return newArr.filter((str) => str !== '') as (string | string[])[];
};

export function i18nPostprocess(): Plugin {
  return {
    name: 'i18n-postprocess',
    // Run after @lingui/vite-plugin has compiled the .po file
    enforce: 'post',
    async transform(code: string, id: string) {
      if (!id.endsWith('.po')) return null;

      // Strip all ESM export syntax so Node's vm.Script can evaluate the code.
      // (lingui v5 output may have comments or other content before the export,
      // so we cannot rely on a start-of-string anchor.)
      const vmSource =
        code
          // export const X = … → const X = …
          .replace(/\bexport\s+const\s+(\w+)\s*=/g, 'const $1 =')
          // remove standalone export { … } lines
          .replace(/\bexport\s+\{[^}]*\};?\s*/g, '')
          // export default … → const _default = …
          .replace(/\bexport\s+default\b/g, 'const _default =') +
        '\nmodule.exports = messages;';

      const script = new Script(vmSource);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sandbox: any = { module: { exports: {} } };
      script.runInNewContext(sandbox);

      const rawMessages: Record<string, string | (string | string[])[]> =
        sandbox.module.exports;

      const mappedEntries = await Promise.all(
        Object.entries(rawMessages).map(async ([key, value]) => [
          key,
          await mapMessage(key, value),
        ]),
      );

      const mappedMessages = Object.fromEntries(mappedEntries);

      // Lingui v5 macros (t`...`, msg`...`) generate a compact hash ID from the
      // message text (e.g. "home" → "Fn4bcc") via generateMessageId().  The .po
      // catalog uses the plain text as msgid, so at runtime the hash lookup would
      // fail and fall back to the English message text.  Fix: add a hash-keyed
      // alias for every catalog entry so that both plain-text and hashed lookups
      // succeed.
      const withHashAliases: typeof mappedMessages = { ...mappedMessages };
      for (const key of Object.keys(mappedMessages)) {
        const hashed = generateMessageId(key);
        if (hashed !== key) {
          withHashAliases[hashed] = mappedMessages[key];
        }
      }

      return {
        code: `/*eslint-disable*/export const messages=${JSON.stringify(withHashAliases)}`,
        map: null,
      };
    },
  };
}

import remark from 'remark';
import html from 'remark-html';
import breaks from 'remark-breaks';
import { loader } from 'webpack';
import { Script } from 'vm';

const parser = remark()
  .data('settings', {
    commonmark: true,
    footnotes: true,
    pedantic: true,
    gfm: true,
  })
  .use(html)
  .use(breaks);

const markdownPoweredTranslations = [
  'ffbInfoDescription',
  'marianSpiritualityDescription',
  'franciscanSpiritualityDescription',
  'founderDescription',
  'foundationDescription',
  'prayerPillarDescription',
  'hospitalityPillarDescription',
  'brotherlyLifePillarDescription',
];

const mapMessage = async (key: string, value: string) => {
  if (
    !value ||
    typeof value !== 'string' ||
    !markdownPoweredTranslations.includes(key)
  ) {
    return value;
  }

  const { contents } = await parser.process(value);

  return contents.toString();
};

export default function (
  this: loader.LoaderContext,
  content: string | Buffer,
  sourceMap: any,
) {
  this.cacheable && this.cacheable();

  const callback = this.async()!;

  const source = content.toString();

  const script = new Script(source);

  const sandbox: any = { module: {} };

  script.runInNewContext(sandbox);

  Promise.all(
    Object.entries<string>(
      sandbox.module.exports.messages,
    ).map(async ([key, value]) => [key, await mapMessage(key, value)]),
  )
    .then((mappedMessagesKeyVal) => {
      const mappedMessages = mappedMessagesKeyVal.reduce(
        (newMessages, [key, value]) => ({
          ...newMessages,
          [key]: value,
        }),
        {},
      );

      const newSource = `/*eslint-disable*/module.exports={messages:${JSON.stringify(
        mappedMessages,
      )}}`;

      callback(null, newSource, sourceMap);
    })
    .catch((error) => callback(error));
}

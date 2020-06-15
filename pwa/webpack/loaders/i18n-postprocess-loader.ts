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

const mapMessage = async (
  key: string,
  value: string | (string | string[])[],
) => {
  if (!markdownPoweredTranslations.includes(key)) {
    return value;
  }

  if (typeof value === 'string') {
    const { contents } = await parser.process(value);

    return contents.toString();
  }

  if (!Array.isArray(value)) {
    return value;
  }

  const tempString = value
    .map((element, index) =>
      typeof element === 'string' ? element : `$$${index}$$`,
    )
    .join('');

  const { contents } = await parser.process(tempString);

  const contentsString = contents.toString();

  const regex = /\$\$(\d+)\$\$/g;
  let match;
  const newArr = [];
  let prevStartIndex = 0;

  while ((match = regex.exec(contentsString)) !== null) {
    const { 0: stringMatch, 1: arrIndex, index } = match;

    newArr.push(
      contents.slice(prevStartIndex, index),
      value[parseInt(arrIndex, 10)],
    );

    prevStartIndex = index + stringMatch.length;
  }

  newArr.push(contents.slice(prevStartIndex));

  return newArr.filter((str) => str !== '') as (string | string[])[];
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
      const mappedMessages = (mappedMessagesKeyVal as [
        string,
        string | (string | string[])[],
      ][]).reduce(
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

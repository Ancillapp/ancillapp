import Fuse from 'fuse.js';
import { Prayer, PrayerLanguage } from '../../models/prayer';

export interface ExtendedPrayer extends Prayer {
  displayedTitle: string;
}

let _fuse: Fuse<ExtendedPrayer>;

const localizedSearchKeys = Object.values(PrayerLanguage).flatMap((lang) => [
  `title.${lang}`,
  `content.${lang}`,
]);

export const configureSearch = async (songs: ExtendedPrayer[]) => {
  if (_fuse) {
    _fuse.setCollection(songs);
  } else {
    _fuse = new Fuse(songs, {
      keys: localizedSearchKeys,
      includeMatches: true,
      ignoreLocation: true,
    });
  }
};

export const search = async (term: string): Promise<ExtendedPrayer[]> => {
  if (!_fuse) {
    return [];
  }

  const searchResults = _fuse.search(term);

  return searchResults.map(({ item, matches = [] }) =>
    matches.reduce((keyVal, { key, indices }) => {
      if (!key || !indices) {
        return keyVal;
      }

      // FIXME: this strategy is a bit hacky from a TypeScript types perspective
      let highlightedMatch: string = item as unknown as string;
      for (const keypart of key.split('.')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        highlightedMatch = highlightedMatch?.[keypart as any];
      }
      let offset = 0;

      indices.forEach(([start, end]) => {
        highlightedMatch = `${highlightedMatch.slice(
          0,
          start + offset,
        )}<strong>${highlightedMatch.slice(
          start + offset,
          end + offset + 1,
        )}</strong>${highlightedMatch.slice(end + offset + 1)}`;

        offset += 17;
      });

      return {
        ...keyVal,
        ...(key &&
          indices && {
            [key]: highlightedMatch,
          }),
      };
    }, item),
  );
};

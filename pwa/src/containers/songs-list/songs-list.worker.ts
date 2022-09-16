import Fuse from 'fuse.js';
import type { Song } from '../../models/song';

export interface ExtendedSong extends Song {
  formattedNumber: string;
}

let _fuse: Fuse<ExtendedSong>;

export const configureSearch = async (songs: ExtendedSong[]) => {
  if (_fuse) {
    _fuse.setCollection(songs);
  } else {
    _fuse = new Fuse(songs, {
      keys: ['formattedNumber', 'title', 'content'],
      includeMatches: true,
      ignoreLocation: true,
    });
  }
};

export const search = async (term: string): Promise<ExtendedSong[]> => {
  if (!_fuse) {
    return [];
  }

  const searchResults = _fuse.search(term);

  return searchResults.map(({ item, matches = [] }) =>
    matches.reduce((keyVal, { key, indices }) => {
      if (!key || !indices) {
        return keyVal;
      }

      let highlightedMatch = item[key as keyof typeof item] as string;
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

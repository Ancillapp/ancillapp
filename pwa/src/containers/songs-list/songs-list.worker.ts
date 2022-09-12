import Fuse from 'fuse.js';
import type { Song, SongSummary } from '../../models/song';

let _fuse: Fuse<Song | SongSummary>;

export const configureSearch = async (songs: (Song | SongSummary)[]) => {
  if (_fuse) {
    _fuse.setCollection(songs);
  } else {
    _fuse = new Fuse(songs, {
      keys: ['number', 'title', 'content'],
      includeMatches: true,
      ignoreLocation: true,
    });
  }
};

export const search = async (term: string): Promise<(Song | SongSummary)[]> => {
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

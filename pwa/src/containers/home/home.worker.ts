import { setupWorkerServer } from '@easy-worker/core';
import Fuse from 'fuse.js';

export interface SearchItem {
  title: string;
  preview: {
    type: 'html' | 'text';
    content: string;
  };
  description?: string;
  link: string;
  keywords?: string;
}

export interface HomeWorker {
  configureSearch(configuration: SearchItem[]): Promise<void>;
  search(term: string): Promise<SearchItem[]>;
}

let _fuse: Fuse<SearchItem>;

export const configureSearch: HomeWorker['configureSearch'] = async (
  configuration,
) => {
  if (_fuse) {
    _fuse.setCollection(configuration);
  } else {
    _fuse = new Fuse(configuration, {
      keys: ['keywords', 'title', 'description'],
      includeMatches: true,
      ignoreLocation: true,
    });
  }
};

export const search: HomeWorker['search'] = async (term) => {
  if (!_fuse) {
    return [];
  }

  const searchResults = _fuse.search(term, { limit: 10 });

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

setupWorkerServer<HomeWorker>({
  configureSearch,
  search,
});

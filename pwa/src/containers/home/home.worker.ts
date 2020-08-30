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

let _fuse: Fuse<SearchItem>;

export const configureSearch = async (configuration: SearchItem[]) => {
  _fuse = new Fuse(configuration, {
    keys: ['keywords', 'title', 'description'],
    includeMatches: true,
    ignoreLocation: true,
  });
};

export const search = async (term: string): Promise<SearchItem[]> => {
  if (!_fuse) {
    return [];
  }

  const searchResults = _fuse.search(term);

  return searchResults.slice(0, 20).map(({ item, matches = [] }) =>
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

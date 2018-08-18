const isChordLine = (line) => line.startsWith(':');

const parseFooterStartLine = function(state) {
  state.current.footer = true;
  return state;
};

const parseMetaLine = function(state, line) {
  const metaLine = line.startsWith('##') ? line.substring(2) : line;

  if (metaLine[0] !== ' ') { // The `##KEY` case as opposed to the `## comment` case
    const metaName = metaLine.split(' ')[0];
    state.meta[metaName] = (metaLine.startsWith(metaName) ? metaLine.substring(metaName.length) : metaLine).trim();
  }

  return state;
};

const parseFooterLine = function(state, line) {
  const parts = line.replace(/ /, '').split('=>');

  if (parts.length === 2) {
    const [chord, alts] = parts;
    state.alts[chord] = alts.split(',');
  }

  return state;
};

const addSection = function(state, sectionName) {
  // It's a new section if we don't already have it on the list
  const firstTime = !state.sections.includes(sectionName);

  state.sections.push(sectionName);
  const content = {
    section: sectionName,
    firstTime,
    lines: [],
  };

  state.content.push(content);

  if (firstTime) {
    state.chords[sectionName] = [];
  }

  state.current.lastLine = null; // We're in a new section, so forget last lyric/chord line
  return state;
};

const parseSectionLine = (state, line) => addSection(state, line.slice(1).trim());

const parseLyricChordLine = function(state, line) {
  const { lastLine } = state.current;
  const lastStateContent = state.content[state.content.length - 1];

  // If we're not in a section, create one called untitled
  if (!state.sections.length) {
    state = addSection(state, 'UNTITLED');
  }

  // If we have a chord line
  if (isChordLine(line)) {
    lastStateContent.lines.push({
      chords: line.slice(1).trim().split(' '),
      lyrics: '',
    });

    // If we have a lyric line
  } else {
    // If last line is a chord line, add lyrics to it
    if (lastLine && !lastLine.lyrics) {
      lastLine.lyrics = line;

      // Otherwise, we have a solitary line of lyrics
    } else {
      lastStateContent.lines.push({
        chords: [],
        lyrics: line,
      });
    }
  }
  state.current.lastLine = lastStateContent.lines[lastStateContent.lines.length - 1];
  return state;
};

// Given a parse state, parses a line of Markato and returns updated state
const parseLine = function(state, line) {
  // Remove extraneous whitespace
  line = line.trim().replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');

  if (!line) {
    return state;
  }

  if (line.startsWith('###')) {
    return parseFooterStartLine(state, line);
  }

  if (line.startsWith('##')) {
    return parseMetaLine(state, line);
  }

  if (line.startsWith('#')) {
    return parseSectionLine(state, line);
  }

  if (state.current.footer) {
    return parseFooterLine(state, line);
  }

  return parseLyricChordLine(state, line);
};

const interpretLyricChordLine = function(state, section, lineObj, lineNum) {
  const sectionName = section.section;
  let { lyrics, chords } = lineObj;
  const phrases = [];

  const addPhrase = (obj) =>
    phrases.push({
      lyric: '',
      chord: '',
      exception: false,
      wordExtension: false,
      ...obj,
    });

  // If this is a new section, add the chords to that section
  if (section.firstTime) {
    state.chords[sectionName].push(chords);
  }

  // Get the chords stored for the section
  const sectionChords = state.chords[sectionName][lineNum];

  const caretSplit = lyrics.split('^'); // Used to figure out phrases
  let chordIndex = 0; // Index in list of chords as we assemble phrases
  const exceptionIndices = []; // Chord indices that are exceptions in this section

  // If there is no above line of chords, use the section chords
  if (!chords.length) {
    chords = sectionChords != null ? sectionChords : [];

    // Otherwise, substitute * from chords where necessary
  } else {
    chords = chords.map((chord, index) => {
      // For *, get the chord at the same index from the chord list
      if (chord === '*') {
        return sectionChords[index];
      } else {
        exceptionIndices.push(index);
        return chord;
      }
    });
  }

  // If there are no lyrics, just add a line of chords
  if (!lyrics) {
    chords.forEach((chord, index) => addPhrase({
      chord,
      exception: exceptionIndices.includes(index),
    }));

    // Otherwise, add lyrics based on carets
  } else {
    caretSplit.forEach((phrase, index) => {
      // Special case first phrase
      if (index === 0) {
        if (phrase) {
          addPhrase({ lyric: caretSplit[0] });
        }
        return;
      }

      const lastPhrase = caretSplit[index - 1];

      // Get next chord
      const chord = chords[chordIndex];

      // 'foo ^ bar' case, we insert the chord with a blank lyric
      if ((phrase != null) && (phrase[0] === ' ')) {
        addPhrase({
          chord,
          exception: exceptionIndices.includes(chordIndex),
        });

        addPhrase({ lyric: phrase.trim() });
      } else {
        addPhrase({
          lyric: phrase.trim(),
          chord,
          exception: exceptionIndices.includes(chordIndex),
        });
      }

      // Check for foo^bar case (doesn't start with space and last phrase doesn't end with one)
      if (phrase && lastPhrase && (phrase[0] !== ' ') && (lastPhrase[lastPhrase.length - 1] !== ' ')) {
        phrases[phrases.length - 1].wordExtension = true;
      }

      return chordIndex += 1;
    });
  }

  return phrases;
};

// Given a parse state, interpret the lyric/chord lines
const interpretLyricSection = function(state, section) {
  section.lines = section.lines.map((...phrases) => interpretLyricChordLine(state, section, ...phrases));

  // If this is an empty section, retrieve the lyrics/chords from the first instance of that section
  if (!section.lines.length) {
    section.lines = state.content.find((state) => state.section === section.section).lines.concat();

    // None of the phrases are exceptions since we're copying them
    // We also have to clone the phrase objects so that we don't overwrite the other versions
    section.lines = section.lines.map((line) => line.map((phrase) => ({
      ...phrase,
      exception: false,
    })));
  }

  return section;
};

// Given a finished parse state, return a markato object
const markatoObjectFromState = function(s) {
  let chordId;
  let lineId;
  let lyricId;
  let phraseId;
  let { current, ...state } = s;

  // Add ids for sections, lines, and phrases
  let sectionId = (lineId = (phraseId = (lyricId = (chordId = 0))));
  state.content = state.content.map((section) => ({
    ...section,
    sectionId: section.sectionId + 1,
    lines: section.lines.map((l) => {
      const line = l.map((phrase) => ({
        ...phrase,
        phraseId: phrase.phraseId + 1,
        ...phrase.chord ? {
          chordId: phrase.chordId + 1,
        } : {},
        ...phrase.lyric ? {
          lyricId: phrase.lyricId + 1,
        } : {},
      }));
      line.lineId = l.lineId + 1;
      return line;
    }),
  }));

  state.count = {
    sections: sectionId,
    lines: lineId,
    phrases: phraseId,
    lyrics: lyricId,
    chords: chordId,
  };

  return state;
};

// Parses a string of Markato and returns a Markato object
const parseString = function(str) {
  const lines = str.split(/[\r\n]/);

  let parseState = {
    current: {
      footer: false, // Are we in the footer?
      lastLine: null,
    }, // Previous lyric/chord line in this section
    meta: {},
    alts: {},
    sections: [],
    chords: {},
    content: [],
  };

  // Run parser
  parseState = lines.reduce(parseLine, parseState);

  // Interpret lyric/chord lines
  parseState.content = parseState.content.map((...content) => interpretLyricSection(parseState, ...content));

  return markatoObjectFromState(parseState);
};

// In the ideally non-existent case that the parser throws an error, still return a Markato object
export function parse(str) {
  try {
    return parseString(str);
  } catch (err) {
    const errObject = parseString('#Error\nYour Markato input could not be parsed.');
    errObject.err = err;
    return errObject;
  }
}

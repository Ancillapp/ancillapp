import { PageViewElement } from '../../page-view-element';
import { html } from '@polymer/lit-element';
import { parse } from '../../utils/markato';
import template from './template';

class SongPage extends PageViewElement {
  static properties = {
    song: Number,
    _showChords: Boolean,
    _transposeDelta: Number,
  };

  static _chords = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static _modifiers = {
    'b': '♭',
    '#': '♯',
  };

  constructor() {
    super();
    this.loadResourceForLocale(`/assets/locales/songs/song/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender());
    this._showChords = localStorage.getItem('show-chords') === 'true';
    this._transposeDelta = 0;
  }

  _toggleChords() {
    this._showChords = !this._showChords;
    localStorage.setItem('show-chords', this._showChords);
  }

  _renderLyric(lyric) {
    return html`<div class="lyric">${lyric.trim() || ' '}</div>`;
  }

  _transposeChord(chord) {
    if (!this._transposeDelta) {
      return chord;
    }
    const index = SongPage._chords.indexOf(chord);
    let transposedChord = (index + this._transposeDelta) % SongPage._chords.length;
    while (transposedChord < 0) {
      transposedChord += SongPage._chords.length;
    }
    return SongPage._chords[transposedChord];
  }

  _renderChord(chord) {
    return this._showChords && chord ? html`
      <div class="chord">
        ${chord.replace(/[A-G][#b]?/, (c) =>
      this._transposeChord(c)).replace(/([#b])/, (_, modifier) => SongPage._modifiers[modifier])}
      </div>
    ` : '';
  }

  _renderPhrase(phrase) {
    const lyric = this._renderLyric(phrase.lyric);
    const chord = this._renderChord(phrase.chord);
    return (phrase.lyric || chord) ? html`
      <div class$="phrase ${phrase.wordExtension ? 'join' : ''} ${phrase.lyric ? '' : 'no-lyric'}">
        ${chord}${lyric}
      </div>
    ` : '';
  }

  _renderLine(line) {
    return html`
      <div>${line.map((phrase) => this._renderPhrase(phrase))}</div>
    `;
  }

  _markatoToHtml(markato) {
    return markato.content.map((section) => html`
      <div>
        <div class="section-header">${section.section}<hr></div>
        <div class="section">${section.lines.map((line) => this._renderLine(line))}</div>
      </div>
    `);
  }

  _render() {
    if (!this._songPromises) {
      this._songPromises = {};
      if (!this._songPromises[this.song]) {
        this._songPromises[this.song] =
          fetch(`/api/songs/${this.song}`)
            .then((res) => res.json())
            .then(({ data }) => {
              const parsedMarkato = parse(data.markato);
              return {
                ...data,
                parsedMarkato,
              };
            });
      }
    }
    this._song = this._songPromises[this.song].then((song) => ({
      ...song,
      html: this._markatoToHtml(song.parsedMarkato),
    }));
    return this::template();
  }
}

window.customElements.define('song-page', SongPage);

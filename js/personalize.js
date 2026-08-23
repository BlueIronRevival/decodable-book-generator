// ===== Story Personalisation =====
//
// Story text is written with tokens that get replaced with the student's name
// and pronouns, e.g.
//
//   "{Name} put on {their} hat. {They} {v:run} to the mat."
//     -> she/her : "Ana put on her hat. She runs to the mat."
//     -> they/them: "Ana put on their hat. They run to the mat."
//
// Token names use the they/them form as a mnemonic, so what you type looks like
// what it means. A capitalised token produces a capitalised word.
//
// Verb agreement is the reason for the {v:...}, {is}, {has}, {was} and {do}
// tokens: "they" takes a plural verb, so naive substitution would produce
// "They runs" and "They is".
const Personalize = {
  PRONOUN_SETS: {
    'he/him':    { they: 'he',   them: 'him',  their: 'his',   theirs: 'his',
                   themselves: 'himself',    plural: false },
    'she/her':   { they: 'she',  them: 'her',  their: 'her',   theirs: 'hers',
                   themselves: 'herself',    plural: false },
    'they/them': { they: 'they', them: 'them', their: 'their', theirs: 'theirs',
                   themselves: 'themselves', plural: true }
  },

  // Dual sets use the first pronoun for grammatical agreement, so the story
  // stays internally consistent.
  ALIASES: { 'he/they': 'he/him', 'she/they': 'she/her' },

  // Irregular third-person singular forms for {v:...}
  IRREGULAR_VERBS: { be: 'is', have: 'has', do: 'does', go: 'goes', say: 'says' },

  // Fixed verb tokens: [singular, plural]
  VERB_TOKENS: {
    is: ['is', 'are'],
    was: ['was', 'were'],
    has: ['has', 'have'],
    do: ['does', 'do'],
    goes: ['goes', 'go']
  },

  /**
   * Resolve the dropdown value to a pronoun set. Falls back to they/them when
   * the teacher leaves the field blank.
   */
  setFor(pronouns) {
    const key = this.ALIASES[pronouns] || pronouns;
    return this.PRONOUN_SETS[key] || this.PRONOUN_SETS['they/them'];
  },

  /**
   * Third-person singular of a base verb: run -> runs, push -> pushes,
   * carry -> carries, have -> has.
   */
  singularVerb(verb) {
    const lower = verb.toLowerCase();
    if (this.IRREGULAR_VERBS[lower]) return this.IRREGULAR_VERBS[lower];
    if (/(s|x|z|ch|sh|o)$/.test(lower)) return `${lower}es`;
    if (/[^aeiou]y$/.test(lower)) return `${lower.slice(0, -1)}ies`;
    return `${lower}s`;
  },

  capitalise(word) {
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  },

  /**
   * Replace tokens in `text`. Unknown tokens are left in place rather than
   * dropped, so a typo is visible on the page instead of silently vanishing.
   */
  apply(text, options) {
    const opts = options || {};
    const name = (opts.studentName || '').trim();
    const set = this.setFor(opts.pronouns);

    return String(text).replace(
      /\{([A-Za-z]+)(?::([A-Za-z][A-Za-z'-]*))?\}/g,
      (match, rawToken, verb) => {
        const token = rawToken.toLowerCase();
        const shouldCapitalise = rawToken[0] === rawToken[0].toUpperCase();
        let value = null;

        if (token === 'v') {
          if (!verb) return match;
          value = set.plural ? verb.toLowerCase() : this.singularVerb(verb);
        } else if (token === 'name') {
          value = name;
        } else if (Object.prototype.hasOwnProperty.call(set, token)) {
          value = set[token];
        } else if (this.VERB_TOKENS[token]) {
          value = this.VERB_TOKENS[token][set.plural ? 1 : 0];
        }

        if (value === null || value === undefined) return match;
        return shouldCapitalise ? this.capitalise(value) : value;
      }
    );
  },

  /**
   * Token names the editor advertises, for the legend and for validation.
   */
  knownTokens() {
    return ['name', 'they', 'them', 'their', 'theirs', 'themselves',
            'is', 'was', 'has', 'do', 'goes', 'v'];
  },

  // Tokens a teacher is likely to reach for, mapped to the canonical one. The
  // token names are the they/them forms, which is not the first guess for
  // someone writing a story about one child.
  SUGGESTIONS: {
    he: 'they', she: 'they', him: 'them', her: 'their', his: 'their',
    hers: 'theirs', himself: 'themselves', herself: 'themselves',
    student: 'name', child: 'name', firstname: 'name', are: 'is',
    were: 'was', have: 'has', does: 'do', go: 'goes'
  },

  /**
   * Any token in `text` that apply() would not replace, with a suggestion where
   * there is an obvious one. Used by the editor to catch typos before printing.
   */
  unknownTokens(text) {
    const known = this.knownTokens();
    const found = new Map();
    String(text).replace(/\{([A-Za-z]+)(?::([A-Za-z][A-Za-z'-]*))?\}/g, (m, raw) => {
      const lower = raw.toLowerCase();
      if (known.includes(lower)) return m;
      const suggestion = this.SUGGESTIONS[lower];
      found.set(m, suggestion ? `${m} — did you mean {${suggestion}}?` : m);
      return m;
    });
    return [...found.values()];
  }
};

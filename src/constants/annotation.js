// Shared annotation vocabulary.
// Keep this in sync with the LaTeX annotation guidelines appendix.

// Guideline versions the tool knows about. Newest first.
// Every annotation records the version it was made under (see guidelines §Versioning).
export const GUIDELINE_VERSIONS = ["1.0"];

export const DEFAULT_GUIDELINE_VERSION = GUIDELINE_VERSIONS[0];

// The six discourse roles.
export const LABEL_COLORS = {
  "Play-by-Play": "bg-blue-100",
  "Strategic Analysis": "bg-green-100",
  Banter: "bg-cyan-100",
  Storytelling: "bg-pink-100",
  Hype: "bg-yellow-100",
  Recap: "bg-purple-100",
  // "Contextual Info": removed because of similarity to Strategic Analysis.
  // "Custom": enable for future research.
  None: "bg-gray-50",
};

export const LABELS = Object.keys(LABEL_COLORS);

// Flags are recorded INDEPENDENTLY of the label: a flagged segment normally
// still carries a discourse role. At most one flag per segment.
export const FLAGS = [
  {
    value: "UNCERTAIN",
    short: "UNC",
    title: "Genuine difficulty deciding between labels",
  },
  {
    value: "ASR-ERROR",
    short: "ASR",
    title: "Transcription is wrong or garbled enough to affect the decision",
  },
  {
    value: "NON-CONTENT",
    short: "NON",
    title: "Filler, false start, or no annotatable content",
  },
  {
    value: "MULTI-FUNCTION",
    short: "MULTI",
    title: "Segment genuinely performs more than one discourse function",
  },
];

export const FLAG_VALUES = FLAGS.map((f) => f.value);

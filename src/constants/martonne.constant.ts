// * De Martonne aridity index: I = P / (T + 10)
export const MARTONNE_TEMP_OFFSET = 10;

export const MARTONNE_CLASSES = {
  arid: {
    max: 10,
    labelKey: "martonne.arid",
    tone: {
      bg: "var(--color-martonne-arid-bg)",
      border: "var(--color-martonne-arid-border)",
      text: "var(--color-martonne-arid-text)",
    },
  },
  semiArid: {
    min: 10,
    max: 20,
    labelKey: "martonne.semiArid",
    tone: {
      bg: "var(--color-martonne-semi-arid-bg)",
      border: "var(--color-martonne-semi-arid-border)",
      text: "var(--color-martonne-semi-arid-text)",
    },
  },
  mediterranean: {
    min: 20,
    max: 24,
    labelKey: "martonne.mediterranean",
    tone: {
      bg: "var(--color-martonne-mediterranean-bg)",
      border: "var(--color-martonne-mediterranean-border)",
      text: "var(--color-martonne-mediterranean-text)",
    },
  },
  semiHumid: {
    min: 24,
    max: 28,
    labelKey: "martonne.semiHumid",
    tone: {
      bg: "var(--color-martonne-semi-humid-bg)",
      border: "var(--color-martonne-semi-humid-border)",
      text: "var(--color-martonne-semi-humid-text)",
    },
  },
  humid: {
    min: 28,
    max: 35,
    labelKey: "martonne.humid",
    tone: {
      bg: "var(--color-martonne-humid-bg)",
      border: "var(--color-martonne-humid-border)",
      text: "var(--color-martonne-humid-text)",
    },
  },
  veryHumid: {
    min: 35,
    max: 55,
    labelKey: "martonne.veryHumid",
    tone: {
      bg: "var(--color-martonne-very-humid-bg)",
      border: "var(--color-martonne-very-humid-border)",
      text: "var(--color-martonne-very-humid-text)",
    },
  },
  extremelyHumid: {
    min: 55,
    labelKey: "martonne.extremelyHumid",
    tone: {
      bg: "var(--color-martonne-extremely-humid-bg)",
      border: "var(--color-martonne-extremely-humid-border)",
      text: "var(--color-martonne-extremely-humid-text)",
    },
  },
} as const;

export type TMartonnClass = keyof typeof MARTONNE_CLASSES;

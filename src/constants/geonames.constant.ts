export const FEATURE_CODE_LABELS: Record<string, Record<string, string>> = {
  PPL: { en: "City", uk: "Місто", es: "Ciudad" },
  PPLA: { en: "Regional capital", uk: "Обласний центр", es: "Capital regional" },
  PPLA2: { en: "District capital", uk: "Районний центр", es: "Capital de distrito" },
  PPLA3: { en: "County seat", uk: "Центр округу", es: "Cabecera de comarca" },
  PPLA4: { en: "Municipal seat", uk: "Муніципальний центр", es: "Centro municipal" },
  PPLA5: { en: "Local seat", uk: "Місцевий центр", es: "Centro local" },
  PPLC: { en: "Capital city", uk: "Столиця", es: "Capital" },
  PPLX: { en: "Neighborhood", uk: "Район міста", es: "Barrio" },
} as const;

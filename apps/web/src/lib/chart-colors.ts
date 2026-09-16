export const CATEGORICAL_LIGHT = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#008300",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
  "#eb6834",
];

export const CATEGORICAL_DARK = [
  "#3987e5",
  "#199e70",
  "#c98500",
  "#008300",
  "#9085e9",
  "#e66767",
  "#d55181",
  "#d95926",
];

// Matches Tailwind emerald-600 / red-600, kept consistent with the income/expense
// colors used in transaction-list-item.tsx and summary-cards.tsx's Delta.
export const INCOME_COLOR = { light: "#059669", dark: "#10b981" };
export const EXPENSE_COLOR = { light: "#dc2626", dark: "#ef4444" };

// Recharts axis/grid/label colors — matches the neutral-* scale used everywhere
// else in the app's DOM (Tailwind neutral-200/300/500/900), instead of the
// previous warm-grey hex that didn't match.
export const CHART_GRID_COLOR = "#e5e5e5";
export const CHART_AXIS_LINE_COLOR = "#d4d4d4";
export const CHART_AXIS_TEXT_COLOR = "#737373";
export const CHART_LABEL_TEXT_COLOR = "#171717";

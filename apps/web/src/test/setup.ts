import "@testing-library/jest-dom";

/** Hide React Router v7 future-flag warnings in test output (cosmetic). */
const __origWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = String(args?.[0] ?? "");
  if (msg.includes("React Router Future Flag Warning")) return;
  __origWarn(...args);
};

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia — ThemeContext reads it for the
// initial dark/light default.
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

// Recharts' ResponsiveContainer needs real layout dimensions, which jsdom
// doesn't provide. Stub a non-zero size so chart components render their
// children instead of silently rendering nothing.
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  value: 600,
});
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  value: 300,
});

// jsdom doesn't implement ResizeObserver, which Recharts' ResponsiveContainer
// relies on to detect its container size.
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

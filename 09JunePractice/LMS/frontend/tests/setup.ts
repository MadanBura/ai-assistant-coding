import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
  window.URL.revokeObjectURL = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
  HTMLAnchorElement.prototype.click = vi.fn();
}

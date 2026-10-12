import { describe, it, expect, vi } from 'vitest';
import { exportToCSV, sanitizeCSVCell } from '@/utils/formatters';

describe('CSV Export Security and Sanitization', () => {
  it('correctly escapes dangerous formula injection characters with single quote', () => {
    expect(sanitizeCSVCell('=SUM(A1:A10)')).toBe(`"'=SUM(A1:A10)"`);
    expect(sanitizeCSVCell('+27123456789')).toBe(`"'+27123456789"`);
    expect(sanitizeCSVCell('-50')).toBe(`"'-50"`);
    expect(sanitizeCSVCell('@insecure')).toBe(`"'@insecure"`);
    expect(sanitizeCSVCell('Normal Text')).toBe(`"Normal Text"`);
    expect(sanitizeCSVCell('He said "Hello"')).toBe(`"He said ""Hello"""`);
    expect(sanitizeCSVCell(null)).toBe('""');
    expect(sanitizeCSVCell(undefined)).toBe('""');
  });

  it('triggers download anchor for CSV export with sanitized rows', () => {
    global.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    global.URL.revokeObjectURL = vi.fn();

    const testRows = [
      { id: 1, title: '=cmd|/c calc!A0', author: '+27123456789', note: '@insecure' },
    ];

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = vi.fn();
      }
      return el;
    });

    exportToCSV('test_export', testRows, [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'note', label: 'Note' },
    ]);

    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});

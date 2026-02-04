import { describe, it, expect } from 'vitest';
import { simpleMarkdown } from '../src/lib/utils';

describe('simpleMarkdown', () => {
  it('escapes HTML before rendering markdown', () => {
    const input = '<script>alert(1)</script>\n**bold**';
    const output = simpleMarkdown(input);
    expect(output).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(output).toContain('<strong>bold</strong>');
  });
});

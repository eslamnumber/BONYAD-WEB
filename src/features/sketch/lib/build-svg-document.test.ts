import { describe, expect, it } from 'vitest';

import { buildSvgDocument } from './build-svg-document';

describe('buildSvgDocument', () => {
  it('embeds the SVG inside a scaling HTML document', () => {
    const doc = buildSvgDocument('<svg viewBox="0 0 10 10"><rect/></svg>');
    expect(doc).toContain('<!doctype html>');
    expect(doc).toContain('<svg viewBox="0 0 10 10"><rect/></svg>');
    expect(doc).toContain('max-width:100%');
  });

  it('strips script tags as defence-in-depth', () => {
    const doc = buildSvgDocument('<svg><script>alert(1)</script><rect/></svg>');
    expect(doc).not.toContain('alert(1)');
    expect(doc).toContain('<rect/>');
  });
});

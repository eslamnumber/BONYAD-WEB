import { describe, expect, it } from 'vitest';

import { isImageFile, partitionProjectFiles } from './project-files';

describe('isImageFile', () => {
  it('matches raster image extensions case-insensitively', () => {
    expect(isImageFile('photo.jpg')).toBe(true);
    expect(isImageFile('PHOTO.JPEG')).toBe(true);
    expect(isImageFile('a/b/site.PNG')).toBe(true);
    expect(isImageFile('scan.webp')).toBe(true);
    expect(isImageFile('clip.HEIC')).toBe(true);
  });

  it('ignores query strings and hashes when reading the extension', () => {
    expect(isImageFile('https://cdn/x/photo.png?v=2')).toBe(true);
    expect(isImageFile('photo.png#frag')).toBe(true);
  });

  it('returns false for documents and extensionless paths', () => {
    expect(isImageFile('contract.pdf')).toBe(false);
    expect(isImageFile('notes.docx')).toBe(false);
    expect(isImageFile('https://cdn/folder/file')).toBe(false);
    expect(isImageFile('')).toBe(false);
  });
});

describe('partitionProjectFiles', () => {
  it('splits images from documents and preserves order', () => {
    const { images, documents } = partitionProjectFiles(['a.jpg', 'spec.pdf', 'b.png', 'plan.dwg']);
    expect(images).toEqual(['a.jpg', 'b.png']);
    expect(documents).toEqual(['spec.pdf', 'plan.dwg']);
  });

  it('drops falsy entries and tolerates null/undefined', () => {
    expect(partitionProjectFiles(['a.jpg', '', undefined as never, 'x.pdf'])).toEqual({
      images: ['a.jpg'],
      documents: ['x.pdf'],
    });
    expect(partitionProjectFiles(null)).toEqual({ images: [], documents: [] });
    expect(partitionProjectFiles(undefined)).toEqual({ images: [], documents: [] });
  });
});

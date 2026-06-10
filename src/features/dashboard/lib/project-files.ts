/**
 * Split a project's `files` list (a flat array of paths/URLs from the project
 * detail GET) into image thumbnails vs. downloadable documents. The backend
 * returns no MIME metadata, so classification is by file extension only.
 */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif', 'bmp'];

/** True when the path's extension is a known raster image type (query/hash stripped). */
export function isImageFile(path: string): boolean {
  const ext = path.split(/[?#]/)[0]?.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext);
}

/** Partition `files` into `images` and `documents`, dropping falsy entries. */
export function partitionProjectFiles(files: readonly string[] | undefined | null): {
  images: string[];
  documents: string[];
} {
  const images: string[] = [];
  const documents: string[] = [];
  for (const path of files ?? []) {
    if (!path) continue;
    (isImageFile(path) ? images : documents).push(path);
  }
  return { images, documents };
}

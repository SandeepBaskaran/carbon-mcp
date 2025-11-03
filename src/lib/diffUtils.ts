// src/lib/diffUtils.ts
import { createPatch, applyPatch } from 'diff';

export function generateUnifiedDiff(
  oldContent: string,
  newContent: string,
  fileName: string = 'file'
): string {
  const patch = createPatch(
    fileName,
    oldContent,
    newContent,
    'original',
    'modified'
  );
  return patch;
}

export function applyPatchFromUnifiedDiff(
  originalContent: string,
  patchContent: string
): string {
  const result = applyPatch(originalContent, patchContent);
  if (result === false) {
    throw new Error('Failed to apply patch');
  }
  return result;
}


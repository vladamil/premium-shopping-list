import type { AppData } from '../domain/schemas';

/** "cartographer-backup-2026-10-29.json" — the date is the phone's own (local) date. */
export function backupFileName(date: Date): string {
  const year = date.getFullYear();
  // getMonth() counts from 0 (January = 0), so add 1.
  // padStart(2, '0') turns "3" into "03", so the names sort nicely.
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `cartographer-backup-${year}-${month}-${day}.json`;
}

/** Downloads all the app's data (lists + settings) as a .json file. */
export function downloadBackup(data: AppData) {
  // The same text we keep in localStorage. The 2 adds line breaks and
  // indents, so the file is readable if someone opens it.
  const text = JSON.stringify(data, null, 2);

  // A Blob is a "file in memory". createObjectURL gives it a temporary
  // address (blob:http://…) that a link can point to.
  const file = new Blob([text], { type: 'application/json' });
  const fileUrl = URL.createObjectURL(file);

  // A link with a `download` attribute saves the file instead of opening it.
  // It is never put on the page: we only "click" it from code.
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = backupFileName(new Date());
  link.click();

  // Free the memory: the download has already started.
  URL.revokeObjectURL(fileUrl);
}

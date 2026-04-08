import { safeJsonStringify } from './format';

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([safeJsonStringify(payload)], {
    type: 'application/json;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

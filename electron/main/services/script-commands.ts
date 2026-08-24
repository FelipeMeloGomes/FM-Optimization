export type InteractiveExtension = 'bat' | 'cmd' | 'ps1';

export function buildInteractiveWindowCommand(ext: InteractiveExtension, filePath: string): string {
  if (ext === 'ps1') {
    return `cmd /c start powershell -NoProfile -ExecutionPolicy Bypass -File "${filePath}"`;
  }
  return `cmd /c start cmd /k "${filePath}"`;
}

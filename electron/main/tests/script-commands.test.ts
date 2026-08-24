import { describe, expect, it } from 'vitest';
import { buildInteractiveWindowCommand } from '../services/script-commands';

describe('buildInteractiveWindowCommand', () => {
  it('opens bat scripts in a persistent cmd window', () => {
    const cmd = buildInteractiveWindowCommand('bat', 'C:\\Temp\\script.bat');
    expect(cmd).toBe('cmd /c start cmd /k "C:\\Temp\\script.bat"');
  });

  it('opens cmd scripts in a persistent cmd window', () => {
    const cmd = buildInteractiveWindowCommand('cmd', 'C:\\Temp\\script.cmd');
    expect(cmd).toBe('cmd /c start cmd /k "C:\\Temp\\script.cmd"');
  });

  it('opens ps1 scripts in a visible powershell window', () => {
    const cmd = buildInteractiveWindowCommand('ps1', 'C:\\Temp\\script.ps1');
    expect(cmd).toBe(
      'cmd /c start powershell -NoProfile -ExecutionPolicy Bypass -File "C:\\Temp\\script.ps1"'
    );
  });

  it('handles paths with spaces', () => {
    const cmd = buildInteractiveWindowCommand('ps1', 'C:\\My Temp\\my script.ps1');
    expect(cmd).toBe(
      'cmd /c start powershell -NoProfile -ExecutionPolicy Bypass -File "C:\\My Temp\\my script.ps1"'
    );
  });
});

export type CpuVendor = 'intel' | 'amd' | 'unknown';

export function detectCpuVendor(model: string): CpuVendor {
  const lower = model.toLowerCase();
  if (lower.includes('amd')) return 'amd';
  if (lower.includes('intel')) return 'intel';
  return 'unknown';
}

export function getCpuCategory(vendor: CpuVendor): string {
  switch (vendor) {
    case 'amd':
      return 'AMD';
    case 'intel':
      return 'Intel';
    default:
      return '';
  }
}

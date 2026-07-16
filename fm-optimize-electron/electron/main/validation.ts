import { z } from 'zod'

const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const ipv4Schema = z.string().regex(ipv4Regex, 'Invalid IPv4 address')

export const StringIdSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/)

export const ScriptIdSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/)

export const RestorePointNameSchema = z.string().min(1).max(200).regex(/^[^<>|*?"]*$/)

export const RestorePointSeqSchema = z.number().int().positive()

export const InterfaceIndexSchema = z.number().int().positive()

export const DnsAddressesSchema = z.array(ipv4Schema).max(4)

export const DnsProviderSchema = z.object({
  primary: ipv4Schema,
  secondary: ipv4Schema
})

export const BenchmarkProvidersSchema = z.array(DnsProviderSchema).min(1).max(20)

export const SecuritySettingsSchema = z.object({
  enableIpcValidation: z.boolean().default(true),
  enableDenyListBlock: z.boolean().default(false),
  enablePathValidation: z.boolean().default(true),
  enablePsSanitize: z.boolean().default(true)
})

export const SettingsSchema = z.object({
  theme: z.enum(['dark', 'light']).default('dark'),
  confirmOnExecute: z.boolean().default(true),
  autoRestorePoint: z.boolean().default(true),
  security: SecuritySettingsSchema
})

export const elevateAppSchema = z.object({
  scriptId: z.string().optional(),
  dnsInterfaceIndex: z.number().int().positive().optional(),
  dnsAddresses: z.array(ipv4Schema).max(4).optional()
})

export type ElevateAppInput = z.infer<typeof elevateAppSchema>

export const NetworkInfoSchema = z.object({
  interfaceName: z.string(),
  interfaceIndex: z.number().int().positive(),
  currentDns: z.array(ipv4Schema)
})

export const applyDnsSchema = z.object({
  interfaceIndex: InterfaceIndexSchema,
  addresses: DnsAddressesSchema
})

export const createRestorePointSchema = z.object({
  name: RestorePointNameSchema
})

export const deleteRestorePointSchema = z.object({
  seq: RestorePointSeqSchema
})

export const restoreSystemSchema = z.object({
  seq: RestorePointSeqSchema
})

export const executeScriptSchema = z.object({
  id: ScriptIdSchema
})

export const cancelExecutionSchema = z.object({
  id: ScriptIdSchema
})

export const getScriptContentSchema = z.object({
  id: ScriptIdSchema
})

export const extractScriptSchema = z.object({
  id: ScriptIdSchema
})

export const benchmarkDnsSchema = z.object({
  providers: BenchmarkProvidersSchema
})

export type StringId = z.infer<typeof StringIdSchema>
export type ScriptId = z.infer<typeof ScriptIdSchema>
export type RestorePointName = z.infer<typeof RestorePointNameSchema>
export type RestorePointSeq = z.infer<typeof RestorePointSeqSchema>
export type InterfaceIndex = z.infer<typeof InterfaceIndexSchema>
export type DnsAddresses = z.infer<typeof DnsAddressesSchema>
export type DnsProvider = z.infer<typeof DnsProviderSchema>
export type BenchmarkProviders = z.infer<typeof BenchmarkProvidersSchema>
export type Settings = z.infer<typeof SettingsSchema>
export type NetworkInfo = z.infer<typeof NetworkInfoSchema>
export type ApplyDnsInput = z.infer<typeof applyDnsSchema>
export type CreateRestorePointInput = z.infer<typeof createRestorePointSchema>
export type DeleteRestorePointInput = z.infer<typeof deleteRestorePointSchema>
export type RestoreSystemInput = z.infer<typeof restoreSystemSchema>
export type ExecuteScriptInput = z.infer<typeof executeScriptSchema>
export type CancelExecutionInput = z.infer<typeof cancelExecutionSchema>
export type GetScriptContentInput = z.infer<typeof getScriptContentSchema>
export type ExtractScriptInput = z.infer<typeof extractScriptSchema>
export type BenchmarkDnsInput = z.infer<typeof benchmarkDnsSchema>
export type ElevateAppInput = z.infer<typeof elevateAppSchema>

export const IpcSchemas: Record<string, z.ZodSchema> = {
  'get-system-info': z.undefined(),
  'get-scripts': z.undefined(),
  'get-script-content': getScriptContentSchema,
  'extract-script': extractScriptSchema,
  'execute-script': executeScriptSchema,
  'cancel-execution': cancelExecutionSchema,
  'get-restore-points': z.undefined(),
  'create-restore-point': createRestorePointSchema,
  'delete-restore-point': deleteRestorePointSchema,
  'is-admin': z.undefined(),
  'get-settings': z.undefined(),
  'save-settings': SettingsSchema,
  'get-data-file-path': z.undefined(),
  'get-app-version': z.undefined(),
  'is-packaged': z.undefined(),
  'get-execution-history': z.undefined(),
  'restore-system': restoreSystemSchema,
  'check-for-update': z.undefined(),
  'download-update': z.undefined(),
  'install-update': z.undefined(),
  'get-network-info': z.undefined(),
  'benchmark-dns': benchmarkDnsSchema,
  'apply-dns': applyDnsSchema,
  'elevate-app': elevateAppSchema,
  'window-minimize': z.undefined(),
  'window-maximize': z.undefined(),
  'window-close': z.undefined()
}

export function validateIpcInput<T>(channel: string, input: unknown): { success: true; data: T } | { success: false; error: string } {
  const schema = IpcSchemas[channel]
  if (!schema) {
    return { success: true, data: input as T }
  }
  const result = schema.safeParse(input)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    return { success: false, error: `Validação falhou para ${channel}: ${issues}` }
  }
  return { success: true, data: result.data as T }
}

export function auditIpcValidation(channel: string, success: boolean, error?: string): void {
  // Audit logging will be added when audit-logger is imported
  // This is a placeholder for the audit integration
  if (!success) {
    console.warn(`[IPC Validation Failed] ${channel}: ${error}`)
  }
}
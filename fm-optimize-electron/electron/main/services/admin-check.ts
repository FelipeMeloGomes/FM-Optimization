import { execSync } from 'child_process'
import { auditAdminCheck } from '../audit-logger'

let adminCache: { result: boolean; expires: number } | null = null
const CACHE_TTL = 30_000

export function isAdmin(): boolean {
  if (adminCache && Date.now() < adminCache.expires) {
    return adminCache.result
  }

  try {
    execSync('net session', { timeout: 3000 })
    adminCache = { result: true, expires: Date.now() + CACHE_TTL }
    auditAdminCheck(true, 'net session')
    return true
  } catch {
    try {
      const output = execSync('whoami /groups', { timeout: 3000, encoding: 'utf-8' })
      const result = output.includes('S-1-16-12288')
      adminCache = { result, expires: Date.now() + CACHE_TTL }
      auditAdminCheck(result, 'whoami /groups')
      return result
    } catch {
      adminCache = { result: false, expires: Date.now() + CACHE_TTL }
      auditAdminCheck(false, 'failed')
      return false
    }
  }
}

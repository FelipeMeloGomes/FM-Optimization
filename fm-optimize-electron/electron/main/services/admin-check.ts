import { execSync } from 'child_process'

export function isAdmin(): boolean {
  try {
    execSync('net session', { timeout: 3000 })
    return true
  } catch {
    try {
      const output = execSync('whoami /groups', { timeout: 3000, encoding: 'utf-8' })
      return output.includes('S-1-16-12288')
    } catch {
      return false
    }
  }
}

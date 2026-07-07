import { execSync } from 'child_process'

export function isAdmin(): boolean {
  try {
    execSync('net session', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}

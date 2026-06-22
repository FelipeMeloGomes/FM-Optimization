export function isAdmin(): boolean {
  try {
    const { execSync } = require('child_process')
    execSync('net session', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}

import CryptoJS from 'crypto-js'

/**
 * Simple crypto utility using crypto-js for date-based encryption/decryption
 */
export function useCrypto() {
  function getCurrentDateKey(): string {
    const now = new Date()
    return now.toISOString().split('T')[0] // Returns YYYY-MM-DD
  }

  function createDateKey(date?: string): string {
    const dateKey = date || getCurrentDateKey()
    // Create a consistent 32-character key from the date
    return CryptoJS.SHA256(dateKey).toString().substring(0, 32)
  }

  /**
   * Encrypt an ID with the current date
   */
  function encryptId(id: string, date?: string): string {
    const dateKey = createDateKey(date)
    // Add ID: prefix to verify proper decryption
    const prefixedId = `ID:${id}`
    const encrypted = CryptoJS.AES.encrypt(prefixedId, dateKey).toString()

    // Make URL-safe
    return encrypted
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * Decrypt an ID with the current (or specified) date
   */
  function decryptId(encryptedId: string, date?: string): string {
    try {
      const dateKey = createDateKey(date)

      let base64 = encryptedId
        .replace(/-/g, '+')
        .replace(/_/g, '/')

      // Add padding if necessary
      const padding = '='.repeat((4 - (base64.length % 4)) % 4)
      base64 += padding

      const decryptedBytes = CryptoJS.AES.decrypt(base64, dateKey)
      const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8)

      if (!decrypted) {
        throw new Error('Decryption failed: Empty result')
      }

      if (!decrypted.startsWith('ID:')) {
        throw new Error('Decryption failed: Invalid prefix or corrupted data')
      }

      return decrypted.substring(3)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to decrypt ID: ${message}`)
    }
  }

  /**
   * Try to decrypt with multiple date attempts (current date and previous days)
   */
  function decryptIdWithFallback(encryptedId: string, maxDaysBack: number = 1): string {
    const now = new Date()

    // Try current date first
    try {
      return decryptId(encryptedId)
    }
    catch {
      // Try previous dates
      for (let i = 1; i <= maxDaysBack; i++) {
        try {
          const pastDate = new Date(now)
          pastDate.setDate(now.getDate() - i)
          const dateKey = pastDate.toISOString().split('T')[0]
          return decryptId(encryptedId, dateKey)
        }
        catch {
          continue
        }
      }
    }

    throw new Error(`Failed to decrypt ID`)
  }

  return {
    getCurrentDateKey,
    createDateKey,
    encryptId,
    decryptId,
    decryptIdWithFallback,
  }
}

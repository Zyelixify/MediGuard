import CryptoJS from 'crypto-js'

/**
 * Simple crypto utility using crypto-js for date-based encryption/decryption
 */
export function useCrypto() {
  /**
   * Get the current date as a string in YYYY-MM-DD format
   */
  function getCurrentDateKey(): string {
    const now = new Date()
    return now.toISOString().split('T')[0] // Returns YYYY-MM-DD
  }

  /**
   * Create a hash-based encryption key from the date
   */
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
    const encrypted = CryptoJS.AES.encrypt(id, dateKey).toString()

    // Make URL-safe by replacing problematic characters
    return encrypted
      .replace(/=/g, '')
  }

  /**
   * Decrypt an ID with the current date (or specified date)
   */
  function decryptId(encryptedId: string, date?: string): string {
    try {
      const dateKey = createDateKey(date)

      // Add padding if necessary
      const padding = '='.repeat((4 - (encryptedId.length % 4)) % 4)
      encryptedId += padding

      const decryptedBytes = CryptoJS.AES.decrypt(encryptedId, dateKey)
      const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8)

      if (!decrypted) {
        throw new Error('Decryption failed')
      }

      return decrypted
    }
    catch {
      throw new Error('Failed to decrypt ID: Invalid format or wrong date')
    }
  }

  /**
   * Try to decrypt with multiple date attempts (current date and previous days)
   */
  function decryptIdWithFallback(encryptedId: string, maxDaysBack: number = 7): string {
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
          continue // Ignore errors, try next date
        }
      }
      throw new Error('Failed to decrypt ID: No valid date found within range')
    }
  }

  /**
   * Generate a simple hash for testing purposes
   */
  function simpleHash(input: string): string {
    return CryptoJS.SHA256(input).toString()
  }

  return {
    getCurrentDateKey,
    createDateKey,
    encryptId,
    decryptId,
    decryptIdWithFallback,
    simpleHash,
  }
}

/* eslint-disable no-console */
import QRCode from 'qrcode'

export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'development' && import.meta.server) {
    // Wait for Nuxt to finish its startup sequence
    setTimeout(async () => {
      try {
        const codespaceUrl = process.env.CODESPACE_NAME

        if (codespaceUrl) {
          const port = process.env.PORT || '3000'
          const url = `https://${codespaceUrl}-${port}.app.github.dev`

          const qrString = await QRCode.toString(url, {
            type: 'terminal',
            small: true,
            margin: 1
          })

          console.log('')
          console.log('🎯 GitHub Codespaces URL:')
          console.log('')
          console.log(qrString)
          console.log('')
          console.log(`📱 Scan to open on mobile: ${url}`)
          console.log('')
        }
      }
      catch (error) {
        console.error('❌ Failed to generate Codespaces QR code:', error)
      }
    }, 2000) // Wait 2 seconds after Nuxt startup
  }
})

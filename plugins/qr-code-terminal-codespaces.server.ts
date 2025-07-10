/* eslint-disable no-console */
import QRCode from 'qrcode'

let qrCodeShown = false

export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'development' && import.meta.server && !qrCodeShown) {
    qrCodeShown = true

    setTimeout(async () => {
      try {
        const codespaceUrl = process.env.CODESPACE_NAME

        if (codespaceUrl) {
          const port = process.env.PORT || '3000'
          const url = `https://${codespaceUrl}-${port}.app.github.dev`

          const qrString = await QRCode.toString(url, {
            type: 'utf8',
            margin: 2,
            errorCorrectionLevel: 'M'
          })

          console.log('')
          console.log('🎯 GitHub Codespaces Mobile QRCode:')
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
    }, 500)
  }
})

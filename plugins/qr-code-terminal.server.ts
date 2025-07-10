/* eslint-disable no-console */
import QRCode from 'qrcode'

export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'development' && import.meta.server) {
    process.nextTick(async () => {
      try {
        const codespaceUrl = process.env.CODESPACE_NAME
        const githubUser = process.env.GITHUB_USER

        if (codespaceUrl && githubUser) {
          const port = process.env.PORT || '3000'
          const url = `https://${codespaceUrl}-${port}.app.github.dev`

          const qrString = await QRCode.toString(url, {
            type: 'terminal',
            small: true,
            margin: 1
          })

          console.log('\n🎯 GitHub Codespaces Development Server')
          console.log('═'.repeat(50))
          console.log(`📱 Scan this QR code to open on your phone:`)
          console.log('')
          console.log(qrString)
          console.log('')
          console.log(`🔗 Direct URL: ${url}`)
          console.log('═'.repeat(50))
          console.log('')
        }
        else {
          // Fallback for local development
          const port = process.env.PORT || '3000'
          const localUrl = `http://localhost:${port}`

          const qrString = await QRCode.toString(localUrl, {
            type: 'terminal',
            small: true,
            margin: 1
          })

          console.log('\n🏠 Local Development Server')
          console.log('═'.repeat(50))
          console.log(`📱 Scan this QR code to open on your phone:`)
          console.log('')
          console.log(qrString)
          console.log('')
          console.log(`🔗 Direct URL: ${localUrl}`)
          console.log('💡 Note: Make sure your phone is on the same network')
          console.log('═'.repeat(50))
          console.log('')
        }
      }
      catch (error) {
        console.error('❌ Failed to generate QR code:', error)
      }
    })
  }
})

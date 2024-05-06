import { ipcMain } from 'electron'
import sharp from 'sharp'

ipcMain.on(
  'process-image',
  async (event, { image, aspectRatio, borderThickness, borderColor }) => {
    const { width: widthRatio, height: heightRatio } = aspectRatio
    const { r, g, b } = borderColor

    const imageBuffer = Buffer.from(image.split(',')[1], 'base64')
    const { width, height } = await sharp(imageBuffer).metadata()
    const targetWidth = Math.round((height * widthRatio) / heightRatio)
    const targetHeight = Math.round((width * heightRatio) / widthRatio)
    const yBorderSize = Math.max(0, targetHeight - height) + borderThickness
    const xBorderSize = Math.max(0, targetWidth - width) + borderThickness
    const processedImage = await sharp(imageBuffer)
      .extend({
        top: Math.floor(yBorderSize / 2),
        bottom: Math.ceil(yBorderSize / 2),
        left: Math.floor(xBorderSize / 2),
        right: Math.ceil(xBorderSize / 2),
        background: { r, g, b, alpha: 1 },
      })
      .toBuffer()

    event.reply(
      'image-processed',
      `data:image/png;base64,${processedImage.toString('base64')}`
    )
  }
)

import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'

ipcMain.on('save-image', async (event, { arrayBuffer, suggestedFileName }) => {
  const mainWindow = BrowserWindow.getFocusedWindow()
  if (mainWindow) {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: suggestedFileName,
        filters: [{ name: 'PNG Images', extensions: ['png'] }],
      })
      if (!result.canceled && result.filePath) {
        const buffer = Buffer.from(arrayBuffer)
        fs.writeFileSync(result.filePath, buffer)
        event.reply('image-saved', result.filePath)
      }
    } catch (err) {
      console.error('Failed to save image:', err)
    }
  }
})

// Web browser adapter — uses HTML file input and File System Access API with download fallback
import type { FileSystemAdapter } from './types'

export const webAdapter: FileSystemAdapter = {
  async openFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.drevo,.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) { resolve(null); return }
        resolve(await file.text())
      }
      input.click()
    })
  },

  async saveFile(_path, content) {
    // Try modern File System Access API first (Chrome/Edge)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle> })
          .showSaveFilePicker({
            suggestedName: 'family-tree.drevo',
            types: [{ description: 'Drevo Project', accept: { 'application/json': ['.drevo'] } }],
          })
        const writable = await handle.createWritable()
        await writable.write(content)
        await writable.close()
        return handle.name
      } catch {
        // User cancelled
        return null
      }
    }
    // Fallback: trigger download
    return this.saveFileAs(content, 'family-tree.drevo')
  },

  async saveFileAs(content, defaultName) {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultName
    a.click()
    URL.revokeObjectURL(url)
    return defaultName
  },
}

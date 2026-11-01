// Tauri desktop adapter — uses native OS file dialogs via Tauri plugin APIs
import type { FileSystemAdapter } from './types'

async function getTauriDialogModule() {
  return await import('@tauri-apps/plugin-dialog')
}

async function getTauriFsModule() {
  return await import('@tauri-apps/plugin-fs')
}

export const tauriAdapter: FileSystemAdapter = {
  async openFile() {
    const { open } = await getTauriDialogModule()
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Drevo Project', extensions: ['drevo', 'json'] }],
    })
    if (!selected || typeof selected !== 'string') return null

    const { readTextFile } = await getTauriFsModule()
    return await readTextFile(selected)
  },

  async saveFile(path, content) {
    if (!path) return this.saveFileAs(content, 'family-tree.drevo')
    const { writeTextFile } = await getTauriFsModule()
    await writeTextFile(path, content)
    return path
  },

  async saveFileAs(content, defaultName) {
    const { save } = await getTauriDialogModule()
    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Drevo Project', extensions: ['drevo'] }],
    })
    if (!path) return null
    const { writeTextFile } = await getTauriFsModule()
    await writeTextFile(path, content)
    return path
  },
}

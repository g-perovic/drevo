// Platform file-system adapter interface.
// Swapping the implementation here is all that's needed for a web-only build.

export interface FileSystemAdapter {
  openFile(): Promise<string | null>         // returns raw JSON string or null if cancelled
  saveFile(path: string | null, content: string): Promise<string | null>  // returns saved path or null
  saveFileAs(content: string, defaultName: string): Promise<string | null>
}

// Detect whether we're running inside Tauri
export const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

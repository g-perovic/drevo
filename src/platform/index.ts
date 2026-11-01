// The single import point for platform-aware file system access.
// To switch to web-only: change isTauri() to always return false, or
// set VITE_PLATFORM=web at build time.
import { isTauri, type FileSystemAdapter } from './types'
import { tauriAdapter } from './tauriAdapter'
import { webAdapter } from './webAdapter'

export const fileSystem: FileSystemAdapter = isTauri() ? tauriAdapter : webAdapter
export { isTauri }
export type { FileSystemAdapter }

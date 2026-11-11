import { toPng } from 'html-to-image'

/**
 * Captures the current family tree canvas and downloads it as a high-resolution PNG image.
 */
export async function exportTreeToPng(
  canvasElement: HTMLElement,
  title: string = 'family-tree',
): Promise<void> {
  const dataUrl = await toPng(canvasElement, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })

  const link = document.createElement('a')
  const safeTitle = (title || 'family-tree').toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  link.download = `${safeTitle}.png`
  link.href = dataUrl
  link.click()
}

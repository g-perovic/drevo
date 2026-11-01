import { jsPDF } from 'jspdf'
import { toPng } from 'html-to-image'

export type PageSize = 'a4' | 'a3' | 'letter' | 'poster'
export type Orientation = 'landscape' | 'portrait'

export interface PdfExportOptions {
  pageSize: PageSize
  orientation: Orientation
  title: string
  includeDate: boolean
}

// Page dimensions in mm
export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  a4:     { width: 297, height: 210 },
  a3:     { width: 420, height: 297 },
  letter: { width: 279.4, height: 215.9 },
  poster: { width: 841, height: 594 }, // A1
}

/**
 * Captures the React Flow canvas DOM element and exports a crisp, formatted PDF.
 */
export async function exportTreeToPdf(
  canvasElement: HTMLElement,
  options: PdfExportOptions,
): Promise<void> {
  const { pageSize, orientation, title, includeDate } = options

  // Get base page dimensions (default landscape)
  let { width, height } = PAGE_DIMENSIONS[pageSize]
  if (orientation === 'portrait') {
    const temp = width
    width = height
    height = temp
  }

  // Create jsPDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize === 'poster' ? 'a1' : pageSize,
  })

  // Margins
  const marginX = 15
  const marginTop = 25
  const marginBottom = 15
  const usableWidth = width - marginX * 2
  const usableHeight = height - marginTop - marginBottom

  // Header Title
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(title || 'Family Tree', marginX, 15)

  // Header Date
  if (includeDate) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(120, 120, 120)
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    pdf.text(dateStr, width - marginX, 15, { align: 'right' })
  }

  // Capture canvas viewport image (2x pixel ratio for high DPI crispness)
  const dataUrl = await toPng(canvasElement, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  })

  // Load image to get intrinsic dimensions
  const img = new Image()
  img.src = dataUrl
  await new Promise((resolve) => {
    img.onload = resolve
  })

  // Calculate best fit aspect ratio inside usable area
  const imgAspect = img.width / img.height
  const areaAspect = usableWidth / usableHeight

  let renderWidth = usableWidth
  let renderHeight = usableHeight

  if (imgAspect > areaAspect) {
    // Image is wider than printable area
    renderHeight = usableWidth / imgAspect
  } else {
    // Image is taller than printable area
    renderWidth = usableHeight * imgAspect
  }

  // Center image in usable area
  const posX = marginX + (usableWidth - renderWidth) / 2
  const posY = marginTop + (usableHeight - renderHeight) / 2

  pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight)

  // Footer branding
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  pdf.setTextColor(160, 160, 160)
  pdf.text('Created with Drevo', marginX, height - 7)

  // Trigger download
  const safeTitle = (title || 'family-tree').toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  pdf.save(`${safeTitle}.pdf`)
}

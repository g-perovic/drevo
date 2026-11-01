import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FileText, Download, Loader2 } from 'lucide-react'
import { exportTreeToPdf, type PageSize, type Orientation } from '@/utils/pdfExport'

interface ExportPdfModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTitle: string
}

export function ExportPdfModal({
  isOpen,
  onClose,
  defaultTitle,
}: ExportPdfModalProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(defaultTitle || 'Family Tree')
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [includeDate, setIncludeDate] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    // Find React Flow viewport DOM element
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement
    if (!viewport) return

    setIsExporting(true)
    try {
      await exportTreeToPdf(viewport, {
        pageSize,
        orientation,
        title,
        includeDate,
      })
      onClose()
    } catch (err) {
      console.error('PDF Export failed:', err)
      alert(t('errors.exportError'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-tree-600" />
            <h3 className="font-bold text-gray-900">{t('export.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('export.treeTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-tree-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('export.pageSize')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['a4', 'a3', 'letter', 'poster'] as PageSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPageSize(size)}
                  className={`py-2 text-xs font-medium uppercase rounded-xl border transition-all ${
                    pageSize === size
                      ? 'border-tree-600 bg-tree-50 text-tree-700 font-bold shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('export.orientation')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  orientation === 'landscape'
                    ? 'border-tree-600 bg-tree-50 text-tree-700 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t('export.orientationLandscape')}
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  orientation === 'portrait'
                    ? 'border-tree-600 bg-tree-50 text-tree-700 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t('export.orientationPortrait')}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={includeDate}
                onChange={(e) => setIncludeDate(e.target.checked)}
                className="w-4 h-4 text-tree-600 rounded border-gray-300 focus:ring-tree-500"
              />
              <span className="text-sm text-gray-700 font-medium">
                {t('export.includeDate')}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2 bg-tree-600 hover:bg-tree-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{t('export.exportButton')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

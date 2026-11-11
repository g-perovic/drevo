import { useTranslation } from 'react-i18next'
import { X, Keyboard } from 'lucide-react'

interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  const shortcutList = [
    { key: 'Ctrl + S', desc: t('shortcuts.save') },
    { key: 'Ctrl + Z', desc: t('shortcuts.undo') },
    { key: 'Ctrl + Y', desc: t('shortcuts.redo') },
    { key: '+ / -', desc: `${t('tree.zoomIn')} / ${t('tree.zoomOut')}` },
    { key: '0', desc: t('shortcuts.fitToScreen') },
    { key: 'Esc', desc: t('actions.close') },
    { key: '?', desc: t('shortcuts.title') },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-tree-600" />
            <h3 className="font-bold text-gray-900 text-sm">{t('shortcuts.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {shortcutList.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-none"
            >
              <span className="text-gray-600 font-medium">{item.desc}</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-md font-mono text-[11px] shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-tree-600 hover:bg-tree-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            {t('actions.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

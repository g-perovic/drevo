import { useTranslation } from 'react-i18next'
import { TreePine } from 'lucide-react'

export default function App() {
  const { t, i18n } = useTranslation()

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'sl', label: 'Slovenščina' },
    { code: 'debug', label: '🐛 Debug' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <TreePine className="text-tree-600 w-16 h-16" />
        <h1 className="text-4xl font-bold text-gray-900">{t('app.name')}</h1>
        <p className="text-gray-500 text-lg">{t('app.tagline')}</p>
      </div>

      <div className="flex gap-2 mt-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              i18n.language === lang.code
                ? 'bg-tree-600 text-white border-tree-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-tree-400'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">{t('app.milestone', { milestone: '1 — Project Setup' })}</p>
    </div>
  )
}

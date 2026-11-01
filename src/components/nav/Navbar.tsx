import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TreePine,
  UserPlus,
  Undo2,
  Redo2,
  LayoutGrid,
  Search,
  Download,
  FilePlus,
  FolderOpen,
  Save,
  Languages,
  ChevronDown,
} from 'lucide-react'
import { useTreeStore, useUndoRedo } from '@/store/treeStore'
import { getDisplayName } from '@/types/models'

interface NavbarProps {
  onAddPerson: () => void
  onSelectPerson: (id: string) => void
  onExportPdf: () => void
  onSave: () => void
  onSaveAs: () => void
  onOpen: () => void
  onNew: () => void
  onAutoLayout: () => void
}

export function Navbar({
  onAddPerson,
  onSelectPerson,
  onExportPdf,
  onSave,
  onSaveAs,
  onOpen,
  onNew,
  onAutoLayout,
}: NavbarProps) {
  const { t, i18n } = useTranslation()
  const project = useTreeStore((state) => state.project)
  const isDirty = useTreeStore((state) => state.isDirty)
  const updateMeta = useTreeStore((state) => state.updateMeta)
  const { undo, redo, canUndo, canRedo } = useUndoRedo()

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const matchingPersons = project.persons.filter((p) => {
    if (!searchQuery.trim()) return false
    const name = getDisplayName(p).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'sl', label: 'Slovenščina' },
    { code: 'debug', label: '🐛 Debug' },
  ]

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand + File Menu + Project Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-tree-600 font-bold text-lg">
          <TreePine className="w-6 h-6" />
          <span className="tracking-tight text-gray-900">{t('app.name')}</span>
        </div>

        {/* File Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <span>File</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showFileMenu && (
            <div
              className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 text-xs"
              onClick={() => setShowFileMenu(false)}
            >
              <button
                onClick={onNew}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
              >
                <FilePlus className="w-4 h-4 text-gray-400" />
                {t('nav.newProject')}
              </button>
              <button
                onClick={onOpen}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
              >
                <FolderOpen className="w-4 h-4 text-gray-400" />
                {t('nav.openProject')}
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={onSave}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2.5">
                  <Save className="w-4 h-4 text-gray-400" />
                  {t('nav.save')}
                </span>
                {isDirty && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              </button>
              <button
                onClick={onSaveAs}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
              >
                <Save className="w-4 h-4 text-gray-400" />
                {t('nav.saveAs')}
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={onExportPdf}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 text-tree-600" />
                {t('nav.exportPdf')}
              </button>
            </div>
          )}
        </div>

        {/* Editable Project Title */}
        <input
          type="text"
          value={project.meta.title}
          onChange={(e) => updateMeta({ title: e.target.value })}
          className="text-sm font-medium text-gray-700 hover:text-gray-900 border border-transparent hover:border-gray-200 focus:border-tree-500 focus:bg-white rounded px-2 py-1 transition-all max-w-[200px] truncate"
          title="Click to rename project"
        />
      </div>

      {/* Center: Search Bar (Job 3.4) */}
      <div ref={searchRef} className="relative w-72">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchResults(true)
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder={t('tree.search')}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-tree-500 focus:bg-white transition-all"
          />
        </div>

        {showSearchResults && matchingPersons.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 z-50">
            {matchingPersons.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPerson(p.id)
                  setShowSearchResults(false)
                  setSearchQuery('')
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="font-medium text-gray-800">{getDisplayName(p)}</span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {p.birthDate ? new Date(p.birthDate).getFullYear() : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions, Undo/Redo & Language */}
      <div className="flex items-center gap-2">
        {/* Undo & Redo */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => undo()}
            disabled={!canUndo}
            title={t('actions.undo') + ' (Ctrl+Z)'}
            className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white rounded transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo}
            title={t('actions.redo') + ' (Ctrl+Y)'}
            className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white rounded transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          title={t('tree.autoLayout')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden sm:inline">{t('tree.autoLayout')}</span>
        </button>

        {/* Add Person */}
        <button
          onClick={onAddPerson}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-tree-600 hover:bg-tree-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{t('tree.addPerson')}</span>
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            title={t('nav.language')}
          >
            <Languages className="w-4 h-4" />
          </button>

          {showLangMenu && (
            <div
              className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 text-xs"
              onClick={() => setShowLangMenu(false)}
            >
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => i18n.changeLanguage(l.code)}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-gray-50 ${
                    i18n.language === l.code ? 'font-bold text-tree-600' : 'text-gray-700'
                  }`}
                >
                  <span>{l.label}</span>
                  {i18n.language === l.code && <span className="text-tree-600">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

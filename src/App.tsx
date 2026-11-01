import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/nav/Navbar'
import { TreeCanvas } from '@/components/canvas/TreeCanvas'
import { ProfileDrawer } from '@/components/drawer/ProfileDrawer'
import { ExportPdfModal } from '@/components/export/ExportPdfModal'
import { useTreeStore, useUndoRedo } from '@/store/treeStore'
import { handleQuickAdd, type QuickAddType } from '@/utils/relations'
import { fileSystem } from '@/platform'
import { TreeProjectSchema } from '@/types/models'
import { SAMPLE_FAMILY_TREE } from '@/data/sampleTree'

export default function App() {
  const { t } = useTranslation()
  const project = useTreeStore((state) => state.project)
  const currentFilePath = useTreeStore((state) => state.currentFilePath)
  const isDirty = useTreeStore((state) => state.isDirty)
  const addPerson = useTreeStore((state) => state.addPerson)
  const loadProject = useTreeStore((state) => state.loadProject)
  const markSaved = useTreeStore((state) => state.markSaved)
  const newProject = useTreeStore((state) => state.newProject)
  const updateMeta = useTreeStore((state) => state.updateMeta)
  const { undo, redo } = useUndoRedo()

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [showPdfModal, setShowPdfModal] = useState(false)

  // Quick add relative handler
  const onQuickAdd = useCallback(
    (type: QuickAddType, personId: string) => {
      const newId = handleQuickAdd(type, personId)
      if (newId) {
        setSelectedPersonId(newId)
      }
    },
    [],
  )

  // Add root person
  const handleAddPerson = useCallback(() => {
    const id = addPerson({
      firstName: 'New Person',
    })
    setSelectedPersonId(id)
  }, [addPerson])

  // File Operations (Job 4.1)
  const handleSave = useCallback(async () => {
    const jsonContent = JSON.stringify(project, null, 2)
    const savedPath = await fileSystem.saveFile(currentFilePath, jsonContent)
    if (savedPath) {
      markSaved(savedPath)
    }
  }, [project, currentFilePath, markSaved])

  const handleSaveAs = useCallback(async () => {
    const jsonContent = JSON.stringify(project, null, 2)
    const defaultName = `${(project.meta.title || 'family-tree').toLowerCase().replace(/\s+/g, '-')}.drevo`
    const savedPath = await fileSystem.saveFileAs(jsonContent, defaultName)
    if (savedPath) {
      markSaved(savedPath)
    }
  }, [project, markSaved])

  const handleOpen = useCallback(async () => {
    if (isDirty) {
      if (!window.confirm(t('dialogs.unsavedChanges'))) return
    }

    const content = await fileSystem.openFile()
    if (!content) return

    try {
      const parsed = JSON.parse(content)
      const validProject = TreeProjectSchema.parse(parsed)
      loadProject(validProject)
      setSelectedPersonId(null)
    } catch (err) {
      console.error('Failed to parse project file:', err)
      alert(t('errors.invalidFile'))
    }
  }, [isDirty, loadProject, t])

  const handleNew = useCallback(() => {
    if (isDirty) {
      if (!window.confirm(t('dialogs.newProjectMessage'))) return
    }
    newProject()
    setSelectedPersonId(null)
  }, [isDirty, newProject, t])

  const handleLoadSample = useCallback(() => {
    if (isDirty) {
      if (!window.confirm(t('dialogs.unsavedChanges'))) return
    }
    loadProject(SAMPLE_FAMILY_TREE)
    setSelectedPersonId(null)
  }, [isDirty, loadProject, t])

  // Trigger auto-layout reset by updating layout setting timestamp
  const handleAutoLayout = useCallback(() => {
    updateMeta({ updatedAt: new Date().toISOString() })
  }, [updateMeta])

  // Keyboard Shortcuts (Job 5.2)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)

      // Ctrl+S / Cmd+S -> Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }

      // Ctrl+Z / Cmd+Z -> Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isInput) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Y / Cmd+Shift+Z -> Redo
      if (
        ((e.ctrlKey && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) &&
        !isInput
      ) {
        e.preventDefault()
        redo()
      }

      // Escape -> Deselect person
      if (e.key === 'Escape') {
        setSelectedPersonId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, undo, redo])

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Top Navigation */}
      <Navbar
        onAddPerson={handleAddPerson}
        onSelectPerson={setSelectedPersonId}
        onExportPdf={() => setShowPdfModal(true)}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onOpen={handleOpen}
        onNew={handleNew}
        onAutoLayout={handleAutoLayout}
        onLoadSample={handleLoadSample}
      />

      {/* Main Interactive Tree Canvas */}
      <main className="flex-1 relative overflow-hidden flex">
        <TreeCanvas
          selectedPersonId={selectedPersonId}
          onSelectPerson={setSelectedPersonId}
          onQuickAdd={onQuickAdd}
        />

        {/* Member Profile Drawer */}
        <ProfileDrawer
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      </main>

      {/* PDF Export Modal */}
      <ExportPdfModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        defaultTitle={project.meta.title}
      />
    </div>
  )
}

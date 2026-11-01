import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import { nanoid } from 'nanoid'
import type { TreeProject, Person, Union, PersonInput, ProjectMeta } from '@/types/models'
import { createEmptyProject, TreeProjectSchema } from '@/types/models'

// ─── State shape ─────────────────────────────────────────────────────────────

interface TreeState {
  project: TreeProject
  currentFilePath: string | null
  isDirty: boolean   // unsaved changes flag
}

// ─── Action shape ────────────────────────────────────────────────────────────

interface TreeActions {
  // Project lifecycle
  newProject: (title?: string) => void
  loadProject: (project: TreeProject, filePath?: string) => void
  markSaved: (filePath: string) => void
  updateMeta: (meta: Partial<ProjectMeta>) => void

  // Person CRUD
  addPerson: (input: Partial<PersonInput>) => string      // returns new person id
  updatePerson: (id: string, patch: Partial<PersonInput>) => void
  deletePerson: (id: string) => void

  // Union (couple) CRUD
  addUnion: (partnerIds: [string, string]) => string      // returns new union id
  updateUnion: (id: string, patch: Partial<Omit<Union, 'id'>>) => void
  deleteUnion: (id: string) => void
  addChildToUnion: (unionId: string, childId: string) => void
  removeChildFromUnion: (unionId: string, childId: string) => void

  // Canvas position
  updatePersonPosition: (id: string, x: number, y: number) => void
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: TreeState = {
  project: createEmptyProject(),
  currentFilePath: null,
  isDirty: false,
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTreeStore = create<TreeState & TreeActions>()(
  temporal(
    immer((set) => ({
      ...initialState,

      // ── Project lifecycle ──────────────────────────────────────────────────

      newProject: (title) =>
        set((state) => {
          state.project = createEmptyProject(title)
          state.currentFilePath = null
          state.isDirty = false
        }),

      loadProject: (project, filePath) =>
        set((state) => {
          state.project = TreeProjectSchema.parse(project)
          state.currentFilePath = filePath ?? null
          state.isDirty = false
        }),

      markSaved: (filePath) =>
        set((state) => {
          state.currentFilePath = filePath
          state.isDirty = false
          state.project.meta.updatedAt = new Date().toISOString()
        }),

      updateMeta: (meta) =>
        set((state) => {
          Object.assign(state.project.meta, meta)
          state.isDirty = true
        }),

      // ── Person CRUD ───────────────────────────────────────────────────────

      addPerson: (input) => {
        const id = `p_${nanoid(8)}`
        set((state) => {
          state.project.persons.push({
            id,
            firstName: input.firstName ?? 'New Person',
            isDeceased: false,
            position: input.position ?? { x: 0, y: 0 },
            ...input,
          } as Person)
          state.isDirty = true
        })
        return id
      },

      updatePerson: (id, patch) =>
        set((state) => {
          const idx = state.project.persons.findIndex((p) => p.id === id)
          if (idx === -1) return
          Object.assign(state.project.persons[idx], patch)
          state.isDirty = true
        }),

      deletePerson: (id) =>
        set((state) => {
          // Remove person
          state.project.persons = state.project.persons.filter((p) => p.id !== id)

          // Clean up unions: remove person from partnerships and children lists
          state.project.unions = state.project.unions
            .map((u) => ({
              ...u,
              childrenIds: u.childrenIds.filter((cid) => cid !== id),
            }))
            // Remove unions where the deleted person was a partner
            .filter((u) => !u.partnerIds.includes(id))

          state.isDirty = true
        }),

      // ── Union CRUD ────────────────────────────────────────────────────────

      addUnion: (partnerIds) => {
        const id = `u_${nanoid(8)}`
        set((state) => {
          state.project.unions.push({
            id,
            partnerIds,
            childrenIds: [],
            status: 'married',
          })
          state.isDirty = true
        })
        return id
      },

      updateUnion: (id, patch) =>
        set((state) => {
          const idx = state.project.unions.findIndex((u) => u.id === id)
          if (idx === -1) return
          Object.assign(state.project.unions[idx], patch)
          state.isDirty = true
        }),

      deleteUnion: (id) =>
        set((state) => {
          state.project.unions = state.project.unions.filter((u) => u.id !== id)
          state.isDirty = true
        }),

      addChildToUnion: (unionId, childId) =>
        set((state) => {
          const union = state.project.unions.find((u) => u.id === unionId)
          if (!union || union.childrenIds.includes(childId)) return
          union.childrenIds.push(childId)
          state.isDirty = true
        }),

      removeChildFromUnion: (unionId, childId) =>
        set((state) => {
          const union = state.project.unions.find((u) => u.id === unionId)
          if (!union) return
          union.childrenIds = union.childrenIds.filter((id) => id !== childId)
          state.isDirty = true
        }),

      // ── Canvas positions ──────────────────────────────────────────────────

      updatePersonPosition: (id, x, y) =>
        set((state) => {
          const person = state.project.persons.find((p) => p.id === id)
          if (!person) return
          person.position = { x, y }
          state.isDirty = true
        }),
    })),
    {
      // Only track meaningful changes in undo history (not position drags)
      partialize: (state) => ({
        project: state.project,
      }),
      limit: 50,   // max 50 undo steps
    },
  ),
)

// ─── Undo / Redo convenience hooks ───────────────────────────────────────────

export const useUndoRedo = () => {
  const { undo, redo, pastStates, futureStates } = useTreeStore.temporal.getState()
  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  }
}

import { describe, it, expect, beforeEach } from 'vitest'
import { useTreeStore } from '@/store/treeStore'
import { handleQuickAdd } from '@/utils/relations'

describe('handleQuickAdd', () => {
  beforeEach(() => {
    useTreeStore.getState().newProject('Relation Tests')
  })

  it('adds spouse and creates union', () => {
    const rootId = useTreeStore.getState().addPerson({ firstName: 'Janez', gender: 'male' })
    const spouseId = handleQuickAdd('spouse', rootId)

    const state = useTreeStore.getState().project
    expect(state.persons).toHaveLength(2)
    expect(state.unions).toHaveLength(1)
    expect(state.unions[0].partnerIds).toEqual([rootId, spouseId])
    const spouse = state.persons.find((p) => p.id === spouseId)
    expect(spouse?.gender).toBe('female')
  })

  it('adds child and links to parent union', () => {
    const rootId = useTreeStore.getState().addPerson({ firstName: 'Janez', lastName: 'Novak' })
    const childId = handleQuickAdd('child', rootId)

    const state = useTreeStore.getState().project
    // Should have created partner + child = 3 persons
    expect(state.persons).toHaveLength(3)
    expect(state.unions[0].childrenIds).toContain(childId)
  })

  it('adds parents for a person without parents', () => {
    const childId = useTreeStore.getState().addPerson({ firstName: 'Child' })
    handleQuickAdd('parent', childId)

    const state = useTreeStore.getState().project
    // Child + Father + Mother = 3 persons
    expect(state.persons).toHaveLength(3)
    expect(state.unions).toHaveLength(1)
    expect(state.unions[0].childrenIds).toContain(childId)
  })

  it('adds sibling and connects to same parent union', () => {
    const rootId = useTreeStore.getState().addPerson({ firstName: 'Firstborn' })
    const siblingId = handleQuickAdd('sibling', rootId)

    const state = useTreeStore.getState().project
    const union = state.unions[0]
    expect(union.childrenIds).toContain(rootId)
    expect(union.childrenIds).toContain(siblingId)
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { useTreeStore } from '@/store/treeStore'

describe('useTreeStore', () => {
  beforeEach(() => {
    useTreeStore.getState().newProject('Test Tree')
  })

  it('initializes with empty project', () => {
    const { project, isDirty, currentFilePath } = useTreeStore.getState()
    expect(project.meta.title).toBe('Test Tree')
    expect(project.persons).toHaveLength(0)
    expect(project.unions).toHaveLength(0)
    expect(isDirty).toBe(false)
    expect(currentFilePath).toBeNull()
  })

  it('adds a person and sets isDirty to true', () => {
    const id = useTreeStore.getState().addPerson({
      firstName: 'Ana',
      lastName: 'Novak',
    })

    const { project, isDirty } = useTreeStore.getState()
    expect(project.persons).toHaveLength(1)
    expect(project.persons[0].id).toBe(id)
    expect(project.persons[0].firstName).toBe('Ana')
    expect(project.persons[0].lastName).toBe('Novak')
    expect(isDirty).toBe(true)
  })

  it('updates an existing person', () => {
    const id = useTreeStore.getState().addPerson({ firstName: 'Janez' })
    useTreeStore.getState().updatePerson(id, { lastName: 'Novak', isDeceased: true })

    const person = useTreeStore.getState().project.persons.find((p) => p.id === id)
    expect(person?.lastName).toBe('Novak')
    expect(person?.isDeceased).toBe(true)
  })

  it('deletes a person and cascades cleanup in unions', () => {
    const p1 = useTreeStore.getState().addPerson({ firstName: 'Parent 1' })
    const p2 = useTreeStore.getState().addPerson({ firstName: 'Parent 2' })
    const child = useTreeStore.getState().addPerson({ firstName: 'Child' })

    const u1 = useTreeStore.getState().addUnion([p1, p2])
    useTreeStore.getState().addChildToUnion(u1, child)

    let unions = useTreeStore.getState().project.unions
    expect(unions[0].childrenIds).toContain(child)

    // Deleting child should remove child from union's childrenIds
    useTreeStore.getState().deletePerson(child)
    unions = useTreeStore.getState().project.unions
    expect(unions[0].childrenIds).not.toContain(child)

    // Deleting parent 1 should remove the union entirely
    useTreeStore.getState().deletePerson(p1)
    unions = useTreeStore.getState().project.unions
    expect(unions).toHaveLength(0)
  })

  it('adds and updates unions', () => {
    const p1 = useTreeStore.getState().addPerson({ firstName: 'P1' })
    const p2 = useTreeStore.getState().addPerson({ firstName: 'P2' })
    const uId = useTreeStore.getState().addUnion([p1, p2])

    useTreeStore.getState().updateUnion(uId, { status: 'partner' })
    const union = useTreeStore.getState().project.unions.find((u) => u.id === uId)
    expect(union?.status).toBe('partner')
  })

  it('tracks undo and redo history for tree mutations', () => {
    useTreeStore.getState().addPerson({ firstName: 'First Person' })
    expect(useTreeStore.getState().project.persons).toHaveLength(1)

    // Undo
    useTreeStore.temporal.getState().undo()
    expect(useTreeStore.getState().project.persons).toHaveLength(0)

    // Redo
    useTreeStore.temporal.getState().redo()
    expect(useTreeStore.getState().project.persons).toHaveLength(1)
    expect(useTreeStore.getState().project.persons[0].firstName).toBe('First Person')
  })

  it('updates person positions without breaking data', () => {
    const id = useTreeStore.getState().addPerson({ firstName: 'Mover' })
    useTreeStore.getState().updatePersonPosition(id, 250, 400)

    const person = useTreeStore.getState().project.persons.find((p) => p.id === id)
    expect(person?.position).toEqual({ x: 250, y: 400 })
  })
})

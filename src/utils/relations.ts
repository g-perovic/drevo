import { useTreeStore } from '@/store/treeStore'

export type QuickAddType = 'parent' | 'child' | 'spouse' | 'sibling'

/**
 * Handles adding a relative to a target person, creating or updating
 * the appropriate unions and relationship linkages.
 */
export function handleQuickAdd(type: QuickAddType, targetPersonId: string): string {
  const store = useTreeStore.getState()
  const targetPerson = store.project.persons.find((p) => p.id === targetPersonId)
  if (!targetPerson) return ''

  switch (type) {
    case 'spouse': {
      const spouseGender = targetPerson.gender === 'male' ? 'female' : targetPerson.gender === 'female' ? 'male' : undefined
      const spouseId = store.addPerson({
        firstName: 'New Spouse',
        gender: spouseGender,
      })
      store.addUnion([targetPersonId, spouseId])
      return spouseId
    }

    case 'child': {
      // Find existing union involving target person, or create one
      let union = useTreeStore.getState().project.unions.find((u) => u.partnerIds.includes(targetPersonId))
      let unionId = union?.id

      if (!unionId) {
        const otherParentId = store.addPerson({
          firstName: 'Partner',
          gender: targetPerson.gender === 'male' ? 'female' : 'male',
        })
        unionId = store.addUnion([targetPersonId, otherParentId])
      }

      const childId = store.addPerson({
        firstName: 'New Child',
        lastName: targetPerson.lastName,
      })

      store.addChildToUnion(unionId, childId)
      return childId
    }

    case 'parent': {
      // Find union where target person is a child
      const parentUnion = useTreeStore.getState().project.unions.find((u) => u.childrenIds.includes(targetPersonId))
      if (parentUnion) {
        const existingParentId = parentUnion.partnerIds[0]
        const parentId = store.addPerson({
          firstName: 'New Parent',
          lastName: targetPerson.lastName,
        })
        store.updateUnion(parentUnion.id, {
          partnerIds: [existingParentId, parentId],
        })
        return parentId
      } else {
        const parent1 = store.addPerson({
          firstName: 'Father',
          lastName: targetPerson.lastName,
          gender: 'male',
        })
        const parent2 = store.addPerson({
          firstName: 'Mother',
          gender: 'female',
        })
        const uId = store.addUnion([parent1, parent2])
        store.addChildToUnion(uId, targetPersonId)
        return parent1
      }
    }

    case 'sibling': {
      let parentUnion = useTreeStore.getState().project.unions.find((u) => u.childrenIds.includes(targetPersonId))
      let uId = parentUnion?.id

      if (!uId) {
        const p1 = store.addPerson({ firstName: 'Father', lastName: targetPerson.lastName, gender: 'male' })
        const p2 = store.addPerson({ firstName: 'Mother', gender: 'female' })
        uId = store.addUnion([p1, p2])
        store.addChildToUnion(uId, targetPersonId)
      }

      const siblingId = store.addPerson({
        firstName: 'New Sibling',
        lastName: targetPerson.lastName,
      })

      store.addChildToUnion(uId, siblingId)
      return siblingId
    }
  }
}

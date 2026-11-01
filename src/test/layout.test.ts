import { describe, it, expect } from 'vitest'
import { buildTreeLayout } from '@/utils/layout'
import { createEmptyProject, type Person, type Union } from '@/types/models'

describe('buildTreeLayout', () => {
  it('handles empty tree', () => {
    const project = createEmptyProject()
    const { nodes, edges } = buildTreeLayout(project)
    expect(nodes).toHaveLength(0)
    expect(edges).toHaveLength(0)
  })

  it('lays out a single person node', () => {
    const project = createEmptyProject()
    project.persons.push({
      id: 'p_01',
      firstName: 'Ana',
      position: { x: 0, y: 0 },
      isDeceased: false,
    } as Person)

    const { nodes, edges } = buildTreeLayout(project)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].id).toBe('p_01')
    expect(nodes[0].type).toBe('person')
    expect(edges).toHaveLength(0)
  })

  it('lays out couple and child with union node and edges', () => {
    const project = createEmptyProject()
    const p1: Person = {
      id: 'p_01',
      firstName: 'Father',
      isDeceased: false,
      position: { x: 0, y: 0 },
    }
    const p2: Person = {
      id: 'p_02',
      firstName: 'Mother',
      isDeceased: false,
      position: { x: 0, y: 0 },
    }
    const child: Person = {
      id: 'p_03',
      firstName: 'Child',
      isDeceased: false,
      position: { x: 0, y: 0 },
    }

    const union: Union = {
      id: 'u_01',
      partnerIds: ['p_01', 'p_02'],
      childrenIds: ['p_03'],
      status: 'married',
    }

    project.persons = [p1, p2, child]
    project.unions = [union]

    const { nodes, edges } = buildTreeLayout(project)

    // 3 person nodes + 1 union node = 4 nodes
    expect(nodes).toHaveLength(4)
    expect(nodes.some((n) => n.id === 'union_u_01')).toBe(true)

    // 2 partner edges + 1 child edge = 3 edges
    expect(edges).toHaveLength(3)

    // Child node y coordinate should be below parents
    const parentNode = nodes.find((n) => n.id === 'p_01')!
    const childNode = nodes.find((n) => n.id === 'p_03')!
    expect(childNode.position.y).toBeGreaterThan(parentNode.position.y)
  })
})

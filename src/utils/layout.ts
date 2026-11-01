import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'
import type { TreeProject, Person, Union } from '@/types/models'

export const NODE_WIDTH = 220
export const NODE_HEIGHT = 90
export const UNION_SIZE = 16

export interface TreeGraph {
  nodes: Node[]
  edges: Edge[]
  generationMap: Record<string, number>
}

/**
 * Computes generational depth (1, 2, 3...) for all persons in the tree.
 * Roots (persons without parents) start at Generation 1.
 * Partners are aligned to share the same generation.
 */
export function computeGenerations(persons: Person[], unions: Union[]): Record<string, number> {
  const genMap: Record<string, number> = {}

  // Map each child to their parent union
  const parentMap: Record<string, string[]> = {}
  for (const union of unions) {
    for (const childId of union.childrenIds) {
      if (!parentMap[childId]) parentMap[childId] = []
      parentMap[childId].push(...union.partnerIds)
    }
  }

  // True roots: persons with no recorded parents AND not married to someone who has parents
  // First, initialize all persons
  for (const p of persons) {
    genMap[p.id] = 1
  }

  // Iteratively relax generations until convergence (DAG longest path)
  let changed = true
  let iterations = 0
  const maxIterations = 50

  while (changed && iterations < maxIterations) {
    changed = false
    iterations++

    for (const union of unions) {
      // Find the maximum generation among partners
      const maxPartnerGen = Math.max(
        ...union.partnerIds.map((pid) => genMap[pid] ?? 1),
      )

      // Align both partners to this maximum generation
      for (const pid of union.partnerIds) {
        if (genMap[pid] !== maxPartnerGen) {
          genMap[pid] = maxPartnerGen
          changed = true
        }
      }

      // Children must be at least maxPartnerGen + 1
      const childGen = maxPartnerGen + 1
      for (const cid of union.childrenIds) {
        if ((genMap[cid] ?? 1) < childGen) {
          genMap[cid] = childGen
          changed = true
        }
      }
    }
  }

  return genMap
}

/**
 * Transforms a Drevo TreeProject into React Flow nodes and edges,
 * and calculates auto-layout positions using a Dagre hierarchical graph.
 */
export function buildTreeLayout(project: TreeProject): TreeGraph {
  const { persons, unions, settings } = project
  const isManual = settings.layout === 'manual'

  const generationMap = computeGenerations(persons, unions)

  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: 'TB',       // Top-to-Bottom generational flow
    nodesep: 60,         // Horizontal separation between nodes on same rank
    ranksep: 90,         // Vertical separation between generations
    marginx: 40,
    marginy: 40,
  })
  g.setDefaultEdgeLabel(() => ({}))

  const nodes: Node[] = []
  const edges: Edge[] = []

  // 1. Add Person nodes
  for (const person of persons) {
    g.setNode(person.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  // 2. Add Union nodes & edges
  for (const union of unions) {
    const unionNodeId = `union_${union.id}`
    g.setNode(unionNodeId, { width: UNION_SIZE, height: UNION_SIZE })

    // Edges from partners to union
    for (const partnerId of union.partnerIds) {
      if (persons.some((p) => p.id === partnerId)) {
        g.setEdge(partnerId, unionNodeId)

        // Show marriage year badge if present on first partner edge
        const marriageYear = union.marriageDate
          ? new Date(union.marriageDate).getFullYear()
          : undefined

        edges.push({
          id: `e_${partnerId}_${unionNodeId}`,
          source: partnerId,
          target: unionNodeId,
          type: 'straight',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          label: partnerId === union.partnerIds[0] && marriageYear ? `💍 ${marriageYear}` : undefined,
          labelStyle: { fill: '#64748b', fontSize: 10, fontWeight: 600 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 },
        })
      }
    }

    // Sort children chronologically by birth date (left to right)
    const sortedChildrenIds = [...union.childrenIds].sort((aId, bId) => {
      const pA = persons.find((p) => p.id === aId)
      const pB = persons.find((p) => p.id === bId)
      const dateA = pA?.birthDate ?? '9999-99-99'
      const dateB = pB?.birthDate ?? '9999-99-99'
      return dateA.localeCompare(dateB)
    })

    // Edges from union to sorted children
    for (const childId of sortedChildrenIds) {
      if (persons.some((p) => p.id === childId)) {
        g.setEdge(unionNodeId, childId)
        edges.push({
          id: `e_${unionNodeId}_${childId}`,
          source: unionNodeId,
          target: childId,
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 2 },
        })
      }
    }
  }

  // Calculate Dagre layout positions
  dagre.layout(g)

  // Map calculated coordinates back to React Flow nodes
  for (const person of persons) {
    const dagreNode = g.node(person.id)
    const position = isManual && (person.position.x !== 0 || person.position.y !== 0)
      ? person.position
      : {
          x: dagreNode ? dagreNode.x - NODE_WIDTH / 2 : 0,
          y: dagreNode ? dagreNode.y - NODE_HEIGHT / 2 : 0,
        }

    nodes.push({
      id: person.id,
      type: 'person',
      position,
      data: {
        person,
        generation: generationMap[person.id] ?? 1,
      },
    })
  }

  for (const union of unions) {
    const unionNodeId = `union_${union.id}`
    const dagreNode = g.node(unionNodeId)
    const position = {
      x: dagreNode ? dagreNode.x - UNION_SIZE / 2 : 0,
      y: dagreNode ? dagreNode.y - UNION_SIZE / 2 : 0,
    }

    nodes.push({
      id: unionNodeId,
      type: 'union',
      position,
      data: { union },
    })
  }

  return { nodes, edges, generationMap }
}

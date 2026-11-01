import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'
import type { TreeProject } from '@/types/models'

export const NODE_WIDTH = 220
export const NODE_HEIGHT = 90
export const UNION_SIZE = 16

export interface TreeGraph {
  nodes: Node[]
  edges: Edge[]
}

/**
 * Transforms a Drevo TreeProject into React Flow nodes and edges,
 * and calculates auto-layout positions using a Dagre hierarchical graph.
 */
export function buildTreeLayout(project: TreeProject): TreeGraph {
  const { persons, unions, settings } = project

  // If in manual mode and persons have non-zero positions, preserve them
  const isManual = settings.layout === 'manual'

  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: 'TB',       // Top-to-Bottom generational flow
    nodesep: 50,         // Horizontal separation between nodes on same rank
    ranksep: 80,         // Vertical separation between generations
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
        edges.push({
          id: `e_${partnerId}_${unionNodeId}`,
          source: partnerId,
          target: unionNodeId,
          type: 'straight',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          animated: false,
        })
      }
    }

    // Edges from union to children
    for (const childId of union.childrenIds) {
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
      data: { person },
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

  return { nodes, edges }
}

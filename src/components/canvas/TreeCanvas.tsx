import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTranslation } from 'react-i18next'
import { UserPlus, TreePine } from 'lucide-react'
import { useTreeStore } from '@/store/treeStore'
import { buildTreeLayout } from '@/utils/layout'
import { PersonNode } from './PersonNode'
import { UnionNode } from './UnionNode'

const nodeTypes = {
  person: PersonNode,
  union: UnionNode,
}

interface TreeCanvasProps {
  selectedPersonId: string | null
  onSelectPerson: (id: string | null) => void
  onQuickAdd: (type: 'parent' | 'child' | 'spouse' | 'sibling', personId: string) => void
}

function TreeCanvasInner({
  selectedPersonId,
  onSelectPerson,
  onQuickAdd,
}: TreeCanvasProps) {
  const { t } = useTranslation()
  const project = useTreeStore((state) => state.project)
  const addPerson = useTreeStore((state) => state.addPerson)
  const updatePersonPosition = useTreeStore((state) => state.updatePersonPosition)
  const { fitView } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Recalculate layout whenever project persons or unions change
  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = buildTreeLayout(project)

    // Inject selection and action handlers into person node data
    const enhancedNodes = layoutNodes.map((node) => {
      if (node.type === 'person') {
        return {
          ...node,
          data: {
            ...node.data,
            isSelected: node.id === selectedPersonId,
            onSelect: onSelectPerson,
            onQuickAdd,
          },
        }
      }
      return node
    })

    setNodes(enhancedNodes)
    setEdges(layoutEdges)
  }, [project, selectedPersonId, onSelectPerson, onQuickAdd, setNodes, setEdges])

  // Fit view on first load / when nodes change significantly
  useEffect(() => {
    if (project.persons.length > 0) {
      const timer = setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50)
      return () => clearTimeout(timer)
    }
  }, [project.persons.length, fitView])

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      if (node.type === 'person') {
        updatePersonPosition(node.id, Math.round(node.position.x), Math.round(node.position.y))
      }
    },
    [updatePersonPosition],
  )

  const handleAddFirstPerson = useCallback(() => {
    const id = addPerson({
      firstName: 'New Person',
      position: { x: 0, y: 0 },
    })
    onSelectPerson(id)
  }, [addPerson, onSelectPerson])

  // Empty state if tree has no people
  if (project.persons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/60 p-6">
        <div className="w-16 h-16 rounded-2xl bg-tree-100 border border-tree-200 flex items-center justify-center text-tree-600 mb-4 shadow-sm">
          <TreePine className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {project.meta.title || t('app.name')}
        </h2>
        <p className="text-gray-500 text-sm max-w-sm text-center mb-6">
          {t('tree.emptyState')}
        </p>
        <button
          onClick={handleAddFirstPerson}
          className="flex items-center gap-2 px-5 py-2.5 bg-tree-600 hover:bg-tree-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all"
        >
          <UserPlus className="w-4 h-4" />
          {t('tree.emptyStateAction')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full w-full relative bg-slate-50/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={() => onSelectPerson(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        <Controls
          showInteractive={false}
          className="!bg-white !border !border-gray-200 !shadow-md !rounded-xl overflow-hidden"
        />
        <MiniMap
          nodeColor={(node) => (node.type === 'person' ? '#22c55e' : '#94a3b8')}
          className="!bg-white/80 !border !border-gray-200 !rounded-xl !shadow-md"
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  )
}

export function TreeCanvas(props: TreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <TreeCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

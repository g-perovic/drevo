import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

export const UnionNode = memo(function UnionNode() {
  return (
    <div className="relative w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-sm flex items-center justify-center">
      {/* Top handle (from parents) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-500 !border-white opacity-0"
      />
      {/* Left handle (from partner 1) */}
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-500 !border-white opacity-0"
      />
      {/* Right handle (from partner 2) */}
      <Handle
        type="target"
        id="right"
        position={Position.Right}
        className="!w-2 !h-2 !bg-slate-500 !border-white opacity-0"
      />
      {/* Bottom handle (to children) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-500 !border-white opacity-0"
      />
    </div>
  )
})

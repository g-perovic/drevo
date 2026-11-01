import { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { User, Plus, Heart, Baby, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Person } from '@/types/models'
import { formatLifespan, getDisplayName } from '@/types/models'

export interface PersonNodeData {
  person: Person
  isSelected?: boolean
  onSelect?: (personId: string) => void
  onQuickAdd?: (type: 'parent' | 'child' | 'spouse' | 'sibling', personId: string) => void
}

export const PersonNode = memo(function PersonNode({
  data,
}: {
  data: PersonNodeData
}) {
  const { t } = useTranslation()
  const { person, isSelected, onSelect, onQuickAdd } = data
  const [showActions, setShowActions] = useState(false)

  if (!person) return null

  const genderColor =
    person.gender === 'male'
      ? 'border-blue-400 bg-blue-50/40 text-blue-700'
      : person.gender === 'female'
        ? 'border-rose-400 bg-rose-50/40 text-rose-700'
        : 'border-emerald-400 bg-emerald-50/40 text-emerald-700'

  const borderClass = isSelected
    ? 'ring-2 ring-tree-500 ring-offset-2 border-tree-500 shadow-md'
    : 'border-gray-200 hover:border-gray-300 shadow-sm'

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onSelect?.(person.id)}
      className={`relative w-[220px] rounded-xl bg-white border ${borderClass} p-3 cursor-pointer transition-all duration-150 select-none`}
    >
      {/* Top Handle: connects from parents */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
      />
      {/* Left/Right Handles: connects to spouse */}
      <Handle
        type="source"
        id="left"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-300 !border-white opacity-0"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!w-2 !h-2 !bg-slate-300 !border-white opacity-0"
      />
      {/* Bottom Handle: connects to children */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"
      />

      {/* Card Content */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 overflow-hidden ${genderColor}`}
        >
          {person.photoUrl ? (
            <img
              src={person.photoUrl}
              alt={getDisplayName(person)}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 opacity-70" />
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {getDisplayName(person) || t('person.unknown')}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            {formatLifespan(person)}
          </div>
          {person.birthPlace && (
            <div className="text-[11px] text-gray-400 truncate">
              📍 {person.birthPlace}
            </div>
          )}
        </div>
      </div>

      {/* Contextual Quick-Add Action Bar (Milestone 3 / Job 3.1) */}
      {showActions && onQuickAdd && (
        <div
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title={t('tree.addParent')}
            onClick={() => onQuickAdd('parent', person.id)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-tree-600 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
          <button
            title={t('tree.addSpouse')}
            onClick={() => onQuickAdd('spouse', person.id)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-rose-500 transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
          <button
            title={t('tree.addChild')}
            onClick={() => onQuickAdd('child', person.id)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-500 transition-colors"
          >
            <Baby className="w-3.5 h-3.5" />
          </button>
          <button
            title={t('tree.addSibling')}
            onClick={() => onQuickAdd('sibling', person.id)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-amber-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
})

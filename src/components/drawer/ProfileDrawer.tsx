import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Trash2, Calendar, MapPin, FileText, User } from 'lucide-react'
import { useTreeStore } from '@/store/treeStore'
import type { Gender } from '@/types/models'

interface ProfileDrawerProps {
  personId: string | null
  onClose: () => void
}

export function ProfileDrawer({ personId, onClose }: ProfileDrawerProps) {
  const { t } = useTranslation()
  const person = useTreeStore((state) =>
    state.project.persons.find((p) => p.id === personId),
  )
  const updatePerson = useTreeStore((state) => state.updatePerson)
  const deletePerson = useTreeStore((state) => state.deletePerson)

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [maidenName, setMaidenName] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [birthDate, setBirthDate] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [deathDate, setDeathDate] = useState('')
  const [deathPlace, setDeathPlace] = useState('')
  const [isDeceased, setIsDeceased] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (person) {
      setFirstName(person.firstName ?? '')
      setMiddleName(person.middleName ?? '')
      setLastName(person.lastName ?? '')
      setMaidenName(person.maidenName ?? '')
      setGender(person.gender ?? '')
      setBirthDate(person.birthDate ?? '')
      setBirthPlace(person.birthPlace ?? '')
      setDeathDate(person.deathDate ?? '')
      setDeathPlace(person.deathPlace ?? '')
      setIsDeceased(person.isDeceased ?? false)
      setNotes(person.notes ?? '')
    }
  }, [person])

  if (!person || !personId) return null

  const handleSave = () => {
    updatePerson(personId, {
      firstName: firstName.trim() || 'Person',
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      maidenName: maidenName.trim() || undefined,
      gender: (gender as Gender) || undefined,
      birthDate: birthDate || undefined,
      birthPlace: birthPlace.trim() || undefined,
      deathDate: isDeceased ? deathDate || undefined : undefined,
      deathPlace: isDeceased ? deathPlace.trim() || undefined : undefined,
      isDeceased,
      notes: notes.trim() || undefined,
    })
  }

  const handleDelete = () => {
    if (window.confirm(t('dialogs.deletePersonMessage', { name: person.firstName }))) {
      deletePerson(personId)
      onClose()
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-tree-600" />
          <h3 className="font-semibold text-gray-900">{t('actions.edit')}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Name Fields */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('person.firstName')} *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('person.middleName')}
            </label>
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              onBlur={handleSave}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('person.lastName')}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={handleSave}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
            />
          </div>
        </div>

        {gender === 'female' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('person.maidenName')}
            </label>
            <input
              type="text"
              value={maidenName}
              onChange={(e) => setMaidenName(e.target.value)}
              onBlur={handleSave}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
            />
          </div>
        )}

        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('person.gender')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'other'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGender(g)
                  updatePerson(personId, { gender: g })
                }}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium capitalize transition-colors ${
                  gender === g
                    ? 'bg-tree-50 border-tree-500 text-tree-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t(`person.gender${g.charAt(0).toUpperCase() + g.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Birth Details */}
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {t('person.birthDate')}
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value)
              updatePerson(personId, { birthDate: e.target.value || undefined })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {t('person.birthPlace')}
          </label>
          <input
            type="text"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            onBlur={handleSave}
            placeholder="Ljubljana, Slovenia"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
          />
        </div>

        {/* Deceased Toggle */}
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDeceased}
              onChange={(e) => {
                setIsDeceased(e.target.checked)
                updatePerson(personId, { isDeceased: e.target.checked })
              }}
              className="w-4 h-4 text-tree-600 rounded border-gray-300 focus:ring-tree-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {t('person.isDeceased')}
            </span>
          </label>
        </div>

        {isDeceased && (
          <div className="space-y-3 pl-6 border-l-2 border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('person.deathDate')}
              </label>
              <input
                type="date"
                value={deathDate}
                onChange={(e) => {
                  setDeathDate(e.target.value)
                  updatePerson(personId, { deathDate: e.target.value || undefined })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('person.deathPlace')}
              </label>
              <input
                type="text"
                value={deathPlace}
                onChange={(e) => setDeathPlace(e.target.value)}
                onBlur={handleSave}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
              />
            </div>
          </div>
        )}

        {/* Notes / Bio */}
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            {t('person.notes')}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tree-500"
          />
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {t('actions.delete')}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-tree-600 hover:bg-tree-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          {t('actions.close')}
        </button>
      </div>
    </div>
  )
}

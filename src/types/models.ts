import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const GenderSchema = z.enum(['male', 'female', 'other'])
export type Gender = z.infer<typeof GenderSchema>

export const RelationshipStatusSchema = z.enum([
  'married',
  'partner',
  'separated',
  'divorced',
])
export type RelationshipStatus = z.infer<typeof RelationshipStatusSchema>

// ─── Person ───────────────────────────────────────────────────────────────────

export const PersonSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  maidenName: z.string().optional(),
  gender: GenderSchema.optional(),
  birthDate: z.string().optional(),   // ISO 8601 date string: YYYY-MM-DD
  birthPlace: z.string().optional(),
  deathDate: z.string().optional(),
  deathPlace: z.string().optional(),
  isDeceased: z.boolean().default(false),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
  // Canvas position (in auto-layout mode, computed; in manual mode, user-defined)
  position: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
})

export type Person = z.infer<typeof PersonSchema>
export type PersonInput = z.input<typeof PersonSchema>

// ─── Union (couple / partnership) ─────────────────────────────────────────────

export const UnionSchema = z.object({
  id: z.string().min(1),
  partnerIds: z.tuple([z.string(), z.string()]),   // exactly 2 partners
  childrenIds: z.array(z.string()).default([]),
  status: RelationshipStatusSchema.default('married'),
  marriageDate: z.string().optional(),
  marriagePlace: z.string().optional(),
})

export type Union = z.infer<typeof UnionSchema>

// ─── Project metadata ─────────────────────────────────────────────────────────

export const ProjectMetaSchema = z.object({
  title: z.string().default('My Family Tree'),
  author: z.string().optional(),
  createdAt: z.string(),   // ISO 8601 datetime
  updatedAt: z.string(),
})

export type ProjectMeta = z.infer<typeof ProjectMetaSchema>

// ─── Project settings ─────────────────────────────────────────────────────────

export const ProjectSettingsSchema = z.object({
  layout: z.enum(['hierarchical', 'manual']).default('hierarchical'),
  snapToGrid: z.boolean().default(false),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
})

export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>

// ─── Full project file (.drevo) ───────────────────────────────────────────────

export const DREVO_VERSION = '1.0.0'

export const TreeProjectSchema = z.object({
  version: z.string().default(DREVO_VERSION),
  meta: ProjectMetaSchema,
  settings: ProjectSettingsSchema.default({}),
  persons: z.array(PersonSchema).default([]),
  unions: z.array(UnionSchema).default([]),
})

export type TreeProject = z.infer<typeof TreeProjectSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function createEmptyProject(title = 'My Family Tree'): TreeProject {
  const now = new Date().toISOString()
  return TreeProjectSchema.parse({
    version: DREVO_VERSION,
    meta: { title, createdAt: now, updatedAt: now },
    settings: {},
    persons: [],
    unions: [],
  })
}

export function formatLifespan(person: Person): string {
  const birth = person.birthDate
    ? new Date(person.birthDate).getFullYear().toString()
    : '?'
  const death = person.isDeceased
    ? person.deathDate
      ? new Date(person.deathDate).getFullYear().toString()
      : '†'
    : 'present'
  return `${birth} – ${death}`
}

export function getDisplayName(person: Person): string {
  return [person.firstName, person.lastName].filter(Boolean).join(' ')
}

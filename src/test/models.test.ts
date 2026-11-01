import { describe, it, expect } from 'vitest'
import {
  PersonSchema,
  UnionSchema,
  TreeProjectSchema,
  createEmptyProject,
  formatLifespan,
  getDisplayName,
} from '@/types/models'

describe('PersonSchema', () => {
  it('parses a valid person', () => {
    const result = PersonSchema.safeParse({
      id: 'p_01',
      firstName: 'Ana',
      lastName: 'Novak',
      isDeceased: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a person with empty firstName', () => {
    const result = PersonSchema.safeParse({ id: 'p_01', firstName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a person with no id', () => {
    const result = PersonSchema.safeParse({ firstName: 'Ana' })
    expect(result.success).toBe(false)
  })

  it('defaults isDeceased to false', () => {
    const result = PersonSchema.parse({ id: 'p_01', firstName: 'Ana' })
    expect(result.isDeceased).toBe(false)
  })

  it('defaults position to {x:0, y:0}', () => {
    const result = PersonSchema.parse({ id: 'p_01', firstName: 'Ana' })
    expect(result.position).toEqual({ x: 0, y: 0 })
  })
})

describe('UnionSchema', () => {
  it('parses a valid union', () => {
    const result = UnionSchema.safeParse({
      id: 'u_01',
      partnerIds: ['p_01', 'p_02'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a union with only one partner', () => {
    const result = UnionSchema.safeParse({ id: 'u_01', partnerIds: ['p_01'] })
    expect(result.success).toBe(false)
  })

  it('defaults childrenIds to empty array', () => {
    const result = UnionSchema.parse({ id: 'u_01', partnerIds: ['p_01', 'p_02'] })
    expect(result.childrenIds).toEqual([])
  })

  it('defaults status to married', () => {
    const result = UnionSchema.parse({ id: 'u_01', partnerIds: ['p_01', 'p_02'] })
    expect(result.status).toBe('married')
  })
})

describe('TreeProjectSchema', () => {
  it('creates a valid empty project', () => {
    const project = createEmptyProject('Test Tree')
    const result = TreeProjectSchema.safeParse(project)
    expect(result.success).toBe(true)
    expect(result.data?.meta.title).toBe('Test Tree')
  })

  it('defaults to version 1.0.0', () => {
    const project = createEmptyProject()
    expect(project.version).toBe('1.0.0')
  })
})

describe('Helper functions', () => {
  it('formatLifespan shows year range for deceased person', () => {
    const person = PersonSchema.parse({
      id: 'p_01',
      firstName: 'Janez',
      birthDate: '1920-03-15',
      deathDate: '1995-07-22',
      isDeceased: true,
    })
    expect(formatLifespan(person)).toBe('1920 – 1995')
  })

  it('formatLifespan shows present for living person', () => {
    const person = PersonSchema.parse({
      id: 'p_01',
      firstName: 'Ana',
      birthDate: '1980-01-01',
      isDeceased: false,
    })
    expect(formatLifespan(person)).toBe('1980 – present')
  })

  it('formatLifespan shows ? for unknown birth date', () => {
    const person = PersonSchema.parse({ id: 'p_01', firstName: 'Unknown' })
    expect(formatLifespan(person)).toContain('?')
  })

  it('getDisplayName concatenates first and last name', () => {
    const person = PersonSchema.parse({ id: 'p_01', firstName: 'Ana', lastName: 'Novak' })
    expect(getDisplayName(person)).toBe('Ana Novak')
  })

  it('getDisplayName works without last name', () => {
    const person = PersonSchema.parse({ id: 'p_01', firstName: 'Ana' })
    expect(getDisplayName(person)).toBe('Ana')
  })
})

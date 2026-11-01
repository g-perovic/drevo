import type { TreeProject } from '@/types/models'
import { DREVO_VERSION } from '@/types/models'

export const SAMPLE_FAMILY_TREE: TreeProject = {
  version: DREVO_VERSION,
  meta: {
    title: 'Novak Family Heritage',
    author: 'Ana Novak',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  settings: {
    layout: 'hierarchical',
    snapToGrid: false,
    theme: 'light',
  },
  persons: [
    // Generation 1: Grandparents
    {
      id: 'p_gf1',
      firstName: 'Jože',
      lastName: 'Novak',
      gender: 'male',
      birthDate: '1930-04-12',
      birthPlace: 'Ljubljana',
      deathDate: '2010-09-18',
      deathPlace: 'Ljubljana',
      isDeceased: true,
      notes: 'Grandfather on father side. Master carpenter.',
      position: { x: 0, y: 0 },
    },
    {
      id: 'p_gm1',
      firstName: 'Marija',
      lastName: 'Novak',
      maidenName: 'Kranjc',
      gender: 'female',
      birthDate: '1935-08-25',
      birthPlace: 'Kranj',
      isDeceased: false,
      notes: 'Grandmother. Loved gardening and baking potica.',
      position: { x: 0, y: 0 },
    },
    // Generation 2: Parents
    {
      id: 'p_f',
      firstName: 'Janez',
      lastName: 'Novak',
      gender: 'male',
      birthDate: '1962-02-14',
      birthPlace: 'Ljubljana',
      isDeceased: false,
      notes: 'Father. Architect and outdoor enthusiast.',
      position: { x: 0, y: 0 },
    },
    {
      id: 'p_m',
      firstName: 'Mojca',
      lastName: 'Novak',
      maidenName: 'Zupan',
      gender: 'female',
      birthDate: '1965-11-03',
      birthPlace: 'Maribor',
      isDeceased: false,
      notes: 'Mother. Pediatrician and pianist.',
      position: { x: 0, y: 0 },
    },
    // Generation 3: Children
    {
      id: 'p_c1',
      firstName: 'Ana',
      lastName: 'Novak',
      gender: 'female',
      birthDate: '1992-06-21',
      birthPlace: 'Ljubljana',
      isDeceased: false,
      notes: 'Software engineer and family historian.',
      position: { x: 0, y: 0 },
    },
    {
      id: 'p_c2',
      firstName: 'Luka',
      lastName: 'Novak',
      gender: 'male',
      birthDate: '1996-12-10',
      birthPlace: 'Ljubljana',
      isDeceased: false,
      notes: 'Biologist and alpinist.',
      position: { x: 0, y: 0 },
    },
  ],
  unions: [
    // Grandparents union
    {
      id: 'u_grandparents',
      partnerIds: ['p_gf1', 'p_gm1'],
      childrenIds: ['p_f'],
      status: 'married',
      marriageDate: '1958-07-15',
      marriagePlace: 'Ljubljana',
    },
    // Parents union
    {
      id: 'u_parents',
      partnerIds: ['p_f', 'p_m'],
      childrenIds: ['p_c1', 'p_c2'],
      status: 'married',
      marriageDate: '1990-09-22',
      marriagePlace: 'Bled',
    },
  ],
}

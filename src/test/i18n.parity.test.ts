import { describe, it, expect } from 'vitest'
import en from '@/locales/en.json'
import sl from '@/locales/sl.json'
import debug from '@/locales/debug.json'

// Recursively collect all keys from a nested object
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      return collectKeys(value as Record<string, unknown>, fullKey)
    }
    return [fullKey]
  })
}

const enKeys = collectKeys(en as unknown as Record<string, unknown>)
const slKeys = collectKeys(sl as unknown as Record<string, unknown>)
const debugKeys = collectKeys(debug as unknown as Record<string, unknown>)

describe('i18n Translation Parity', () => {
  it('Slovenian (sl) has no missing keys compared to English (en)', () => {
    const missing = enKeys.filter((k) => !slKeys.includes(k))
    expect(
      missing,
      `Missing Slovenian translations:\n${missing.join('\n')}`,
    ).toHaveLength(0)
  })

  it('Slovenian (sl) has no extra keys not present in English (en)', () => {
    const extra = slKeys.filter((k) => !enKeys.includes(k))
    expect(
      extra,
      `Extra keys in Slovenian not in English:\n${extra.join('\n')}`,
    ).toHaveLength(0)
  })

  it('Debug locale has no missing keys compared to English (en)', () => {
    const missing = enKeys.filter((k) => !debugKeys.includes(k))
    expect(
      missing,
      `Missing debug translations:\n${missing.join('\n')}`,
    ).toHaveLength(0)
  })

  it('All English keys have non-empty string values', () => {
    const flat = (obj: Record<string, unknown>, prefix = ''): Record<string, string> =>
      Object.entries(obj).reduce(
        (acc, [k, v]) => {
          const fullKey = prefix ? `${prefix}.${k}` : k
          if (typeof v === 'object' && v !== null)
            return { ...acc, ...flat(v as Record<string, unknown>, fullKey) }
          acc[fullKey] = v as string
          return acc
        },
        {} as Record<string, string>,
      )

    const flatEn = flat(en as unknown as Record<string, unknown>)
    const emptyKeys = Object.entries(flatEn)
      .filter(([, v]) => !v || v.trim() === '')
      .map(([k]) => k)

    expect(
      emptyKeys,
      `English keys with empty values:\n${emptyKeys.join('\n')}`,
    ).toHaveLength(0)
  })
})

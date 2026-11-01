import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import sl from './locales/sl.json'
import debug from './locales/debug.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en:    { translation: en },
      sl:    { translation: sl },
      debug: { translation: debug },
    },
    lng: localStorage.getItem('drevo-lang') ?? 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // In debug mode, surface any missing keys visibly
    missingKeyHandler: (lngs, _ns, key) => {
      if (lngs.includes('debug')) {
        console.warn(`[i18n] MISSING KEY: ${key}`)
      }
    },
    parseMissingKeyHandler: (key) => `⚠️ MISSING: ${key} ⚠️`,
  })

// Persist language choice
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('drevo-lang', lng)
})

export default i18n

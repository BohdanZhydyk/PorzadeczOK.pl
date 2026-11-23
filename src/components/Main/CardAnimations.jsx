import { appFiles } from '../../AppVar'

const cleanerMud01 = `${appFiles}/animations/cleaner_mud_01.webp`
const cleanerMud02 = `${appFiles}/animations/cleaner_mud_02.webp`
const cleanerMud03 = `${appFiles}/animations/cleaner_mud_03.webp`
const cleanerMud04 = `${appFiles}/animations/cleaner_mud_04.webp`

/**
 * Rejestr animacji sprzątania WebP na kafelkach (Card).
 * Zero ręcznie wpisywanych czasów — wymiary, klatki i czas trwania
 * odczytywane są automatycznie z samego pliku WebP przez webpDecoder.
 */
export const CARD_ANIMATIONS = [
  {
    id: 'cleaner_mud_01',
    src: cleanerMud01,
    alt: 'PorządeczOK sprzątanie 01',
    messages: {
      cleaning: {
        pl: 'Ups, plama! Sprzątamy... 🧹',
        en: 'Oops, a stain! Cleaning... 🧹',
      },
      done: {
        pl: 'OK, teraz jest czysto! ✨',
        en: 'OK, now it’s clean! ✨',
      },
    },
  },
  {
    id: 'cleaner_mud_02',
    src: cleanerMud02,
    alt: 'PorządeczOK sprzątanie 02',
    messages: {
      cleaning: {
        pl: 'Kolejne zabrudzenie? Zaraz ogarniemy! 🧽',
        en: 'Another mess? We got this! 🧽',
      },
      done: {
        pl: 'OK, lśni jak nowe! ✨',
        en: 'OK, shining like new! ✨',
      },
    },
  },
  {
    id: 'cleaner_mud_03',
    src: cleanerMud03,
    alt: 'PorządeczOK dziewczyna z mopem i wiadrem',
    messages: {
      cleaning: {
        pl: 'Mop w ruch i po plamie! 🪣',
        en: 'Mop in motion, stain is gone! 🪣',
      },
      done: {
        pl: 'OK, podłoga lśni! ✨',
        en: 'OK, floor is sparkling! ✨',
      },
    },
  },
  {
    id: 'cleaner_mud_04',
    src: cleanerMud04,
    alt: 'PorządeczOK dziewczyna z miotłą i psikawką',
    messages: {
      cleaning: {
        pl: 'Miotła, psikawka i do dzieła! 🧹',
        en: 'Broom, spray and let’s go! 🧹',
      },
      done: {
        pl: 'OK, wszystko posprzątane! ✨',
        en: 'OK, all cleaned up! ✨',
      },
    },
  },
]

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18n = i18next.createInstance();

type ResourceModule = { default: Record<string, string> };

const modules = import.meta.glob('../locales/**/*.json');

type LoaderMap = Record<string, Record<string, () => Promise<ResourceModule>>>;
const loaders: LoaderMap = {};

for (const [path, loader] of Object.entries(modules)) {
  const match = path.match(/\.\.\/locales\/([a-z-]+)\/(.+)\.json$/);
  if (!match) continue;
  const lang = match[1];
  const ns = match[2];
  if (!loaders[lang]) loaders[lang] = {};
  loaders[lang][ns] = loader as () => Promise<ResourceModule>;
}

const fallbackLng = 'tr';
const supportedLngs = Object.keys(loaders);
const initialLng = localStorage.getItem('i18nextLng') || fallbackLng;

async function loadLanguage(lang: string): Promise<void> {
  const langLoaders = loaders[lang] || {};
  const entries = Object.entries(langLoaders);
  await Promise.all(
    entries.map(async ([ns, loader]) => {
      const mod = await loader();
      i18n.addResourceBundle(lang, ns, mod.default, true, true);
    })
  );
}

const initPromise = (async () => {
  const namespaces = Object.keys(loaders[fallbackLng] || {});
  const defaultNS = namespaces.includes('common') ? 'common' : namespaces[0] ?? 'translation';
  await i18n.use(initReactI18next).init({
    lng: initialLng,
    fallbackLng,
    supportedLngs,
    ns: namespaces.length > 0 ? namespaces : [defaultNS],
    defaultNS,
    resources: {},
    interpolation: { escapeValue: false },
  });
  await loadLanguage(fallbackLng);
  if (initialLng !== fallbackLng) {
    await loadLanguage(initialLng);
  }
})();

i18n.on('languageChanged', async (lng) => {
  await loadLanguage(lng);
});

export async function ensureI18nReady(): Promise<void> {
  await initPromise;
}

export default i18n;

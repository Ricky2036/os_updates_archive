import { sitePath } from './archive';

export type OfficialArchiveVersion = '15' | '16' | 'originos6' | 'hyperos1' | 'hyperos2' | 'hyperos3' | 'hyperos4';
export type OfficialArchiveViewport = 'mobile' | 'pad' | 'desktop';
export type ColorOSSection = 'monthly' | OfficialArchiveVersion;

const productionBase = 'https://pub-677d8b9c16d84df684f908214461d60a.r2.dev/v2026-07-30';
export const officialArchiveBase = (
  import.meta.env.PUBLIC_OFFICIAL_ARCHIVE_BASE_URL || productionBase
).replace(/\/$/, '');

export const officialArchiveMeta: Record<OfficialArchiveVersion, {
  title: string;
  label: string;
  folder: string;
  route: string;
  entries: Record<OfficialArchiveViewport, string>;
}> = {
  '15': {
    title: 'ColorOS 15 官方网站存档',
    label: 'ColorOS 15',
    folder: 'coloros15',
    route: sitePath('coloros/15/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'mobile.html' },
  },
  '16': {
    title: 'ColorOS 16 官方网站存档',
    label: 'ColorOS 16',
    folder: 'coloros16',
    route: sitePath('coloros/16/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
  },
  'originos6': {
    title: 'OriginOS 6 官方网站存档',
    label: 'OriginOS 6',
    folder: 'originos6',
    route: sitePath('originos/6/'),
    entries: { desktop: 'originos.html', pad: 'originos.html', mobile: 'originos.html' },
  },
  'hyperos1': {
    title: 'Xiaomi HyperOS 1 官方网站存档',
    label: 'HyperOS 1',
    folder: 'hyperos1',
    route: sitePath('hyperos/1/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'mobile.html' },
  },
  'hyperos2': {
    title: 'Xiaomi HyperOS 2 官方网站存档',
    label: 'HyperOS 2',
    folder: 'hyperos2',
    route: sitePath('hyperos/2/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'mobile.html' },
  },
  'hyperos3': {
    title: 'Xiaomi HyperOS 3 官方网站存档',
    label: 'HyperOS 3',
    folder: 'hyperos3',
    route: sitePath('hyperos/3/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'mobile.html' },
  },
  'hyperos4': {
    title: 'Xiaomi HyperOS 4 官方网站存档',
    label: 'HyperOS 4',
    folder: 'hyperos4',
    route: sitePath('hyperos/4/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'mobile.html' },
  },
};

export function officialArchiveUrl(version: OfficialArchiveVersion, viewport: OfficialArchiveViewport) {
  const entry = officialArchiveMeta[version].entries[viewport];
  if (version === '15' || version === '16') {
    return `${officialArchiveBase}/${officialArchiveMeta[version].folder}/${entry}`;
  } else if (version === 'originos6') {
    return sitePath(`official_archives/www.vivo.com.cn/${entry}`);
  } else if (version === 'hyperos1') {
    return sitePath(`official_archives/os1.hyperos.mi.com/${entry}`);
  } else if (version === 'hyperos2') {
    return sitePath(`official_archives/os2.hyperos.mi.com/${entry}`);
  } else if (version === 'hyperos3') {
    return sitePath(`official_archives/os3.hyperos.mi.com/${entry}`);
  } else if (version === 'hyperos4') {
    return sitePath(`official_archives/hyperos.mi.com/${entry}`);
  }
  return '';
}

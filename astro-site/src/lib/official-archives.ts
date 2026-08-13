import { sitePath } from './archive';

export type OfficialArchiveVersion = '15' | '16' | 'originos6';
export type OfficialArchiveViewport = 'mobile' | 'pad' | 'desktop';
export type ColorOSSection = 'monthly' | OfficialArchiveVersion;

const productionBase = 'https://official.osarchive.com/v2026-07-30';
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
    // Puppeteer saved desktop as index.html and mobile as mobile.html
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
};

export function officialArchiveUrl(version: OfficialArchiveVersion, viewport: OfficialArchiveViewport) {
  // Use the local self-hosted static files in the public directory
  if (version === '16') {
    return sitePath(`official_archives/www.coloros.com/version/coloros16/${officialArchiveMeta[version].entries[viewport]}`);
  } else if (version === '15') {
    // Return the native HTML path saved by Puppeteer
    return sitePath(`official_archives/www.coloros.com/version/coloros15/${officialArchiveMeta[version].entries[viewport]}`);
  } else if (version === 'originos6') {
    return sitePath(`official_archives/www.vivo.com.cn/${officialArchiveMeta[version].entries[viewport]}`);
  }
  return '';
}

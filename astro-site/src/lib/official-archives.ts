import { sitePath } from './archive';

export type OfficialArchiveVersion = '15' | '16' | '17' | 'insight17' | 'originos6' | 'originos7' | 'hyperos1' | 'hyperos2' | 'hyperos3' | 'hyperos4' | 'magicos10' | 'magicos11' | 'magicos11insight' | 'hyperos4insight' | 'harmonyos7' | 'harmonyos7insight' | 'originos7insight' | 'ios27insight' | 'ios27' | 'appleintelligence';
export type OfficialArchiveViewport = 'mobile' | 'pad' | 'desktop';
export type ColorOSSection = 'monthly' | OfficialArchiveVersion;

const productionBase = 'https://pub-677d8b9c16d84df684f908214461d60a.r2.dev/v2026-07-30';
export const officialArchiveBase = (
  import.meta.env.PUBLIC_OFFICIAL_ARCHIVE_BASE_URL || productionBase
).replace(/\/$/, '');
export const magicOSArchiveBase = (
  import.meta.env.PUBLIC_MAGICOS_ARCHIVE_BASE_URL || ''
).replace(/\/$/, '');
export const archiveMirrorBase = (
  import.meta.env.PUBLIC_ARCHIVE_MIRROR_BASE_URL || ''
).replace(/\/$/, '');

function archiveMirrorUrl(path: string) {
  return archiveMirrorBase
    ? `${archiveMirrorBase}/${path.replace(/^\//, '')}`
    : sitePath(path);
}

export const officialArchiveMeta: Record<OfficialArchiveVersion, {
  title: string;
  label: string;
  folder: string;
  route: string;
  entries: Record<OfficialArchiveViewport, string>;
  /** 可选：覆盖详情页的 meta description（默认按「官方网站离线存档」生成） */
  description?: string;
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
  '17': {
    title: 'ColorOS 17 官方网站存档',
    label: 'ColorOS 17',
    folder: 'coloros17',
    route: sitePath('coloros/17/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'mobile.html' },
  },
  insight17: {
    title: 'ColorOS 17 深度洞察报告',
    label: 'ColorOS 17深度洞察',
    folder: 'coloros17-insight',
    route: sitePath('coloros/insight17/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'ColorOS 17 深度洞察报告：亮点拆解、两代能力对照、舆情反馈与完整视频素材。',
  },
  'originos6': {
    title: 'OriginOS 6 官方网站存档',
    label: 'OriginOS 6',
    folder: 'originos6',
    route: sitePath('originos/6/'),
    entries: { desktop: 'originos.html', pad: 'originos.html', mobile: 'originos.html' },
  },
  'originos7': {
    title: 'OriginOS 7 官方网站存档',
    label: 'OriginOS 7',
    folder: 'originos7',
    route: sitePath('originos/7/'),
    entries: { desktop: 'originos7.html', pad: 'originos7.html', mobile: 'originos7_mobile.html' },
  },
  'originos7insight': {
    title: 'OriginOS 7 深度洞察报告',
    label: 'OriginOS 7深度洞察',
    folder: 'originos7-insight',
    route: sitePath('originos/insight7/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'OriginOS 7 深度洞察报告：亮点拆解、两代能力对照、舆情反馈与完整视频素材。',
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
  'magicos10': {
    title: '荣耀MagicOS 10 官方网站存档',
    label: 'MagicOS 10',
    folder: 'magicos10',
    route: sitePath('magicos/10/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
  },
  'magicos11': {
    title: '荣耀MagicOS 11 官方网站存档',
    label: 'MagicOS 11',
    folder: 'magicos11',
    route: sitePath('magicos/11/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
  },
  'magicos11insight': {
    title: '荣耀MagicOS 11 深度洞察报告',
    label: 'MagicOS 11深度洞察',
    folder: 'magicos11-insight',
    route: sitePath('magicos/insight11/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'MagicOS 11 深度洞察报告：亮点拆解、两代能力对照、UP 主测评与舆情反馈，支持中英文切换。',
  },
  'hyperos4insight': {
    title: 'Xiaomi HyperOS 4 深度洞察报告',
    label: 'HyperOS 4深度洞察',
    folder: 'hyperos4-insight',
    route: sitePath('hyperos/insight4/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'HyperOS 4 深度洞察报告：从设计、流畅、AI、隐私四条主线拆解，附两代能力对照与测评舆情，支持中英文切换。',
  },
  'harmonyos7': {
    title: 'HarmonyOS 7 官方网站存档',
    label: 'HarmonyOS 7',
    folder: 'harmonyos7',
    route: sitePath('harmonyos/7/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
  },
  'harmonyos7insight': {
    title: 'HarmonyOS 7 深度洞察报告',
    label: 'HarmonyOS 7深度洞察',
    folder: 'harmonyos7-insight',
    route: sitePath('harmonyos/insight7/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'HarmonyOS 7 深度洞察报告：设计、智能、安全、流畅四条主线的亮点拆解，两代能力对照与 UP 主测评舆情，支持中英文切换。',
  },
  'ios27insight': {
    title: 'iOS 27 深度洞察报告',
    label: 'iOS 27深度洞察',
    folder: 'ios27-insight',
    route: sitePath('ios/insight27/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'iOS 27 深度洞察报告：设计语言回调、折叠屏新形态交互、Siri AI 独立入口与生态探索，两代能力对照与 UP 主测评舆情。',
  },
  'ios27': {
    title: 'iOS 27 官方网站存档',
    label: 'iOS 27',
    folder: 'os',
    route: sitePath('ios/27/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'iOS 27 官方网站离线存档：涵盖全新设计语言、新形态交互与各主要系统功能。',
  },
  'appleintelligence': {
    title: 'Apple 智能 官方网站存档',
    label: 'Apple 智能',
    folder: 'apple-intelligence',
    route: sitePath('ios/apple-intelligence/'),
    entries: { desktop: 'index.html', pad: 'index.html', mobile: 'index.html' },
    description: 'Apple 智能官方网站离线存档：深入了解跨设备个人智能体验与功能。',
  },
};

export function officialArchiveUrl(version: OfficialArchiveVersion, viewport: OfficialArchiveViewport) {
  const entry = officialArchiveMeta[version].entries[viewport];
  if (version === '15' || version === '16') {
    return `${officialArchiveBase}/${officialArchiveMeta[version].folder}/${entry}`;
  } else if (version === '17') {
    return archiveMirrorUrl(`official_archives/www.coloros.com/version/coloros17/${entry}`);
  } else if (version === 'insight17') {
    return archiveMirrorUrl(`official_archives/coloros17-insight/${entry}`);
  } else if (version === 'originos6') {
    return archiveMirrorUrl(`official_archives/www.vivo.com.cn/${entry}`);
  } else if (version === 'originos7') {
    return archiveMirrorUrl(`official_archives/www.vivo.com.cn/${entry}`);
  } else if (version === 'originos7insight') {
    return archiveMirrorUrl(`official_archives/originos7-insight/${entry}`);
  } else if (version === 'hyperos1') {
    return archiveMirrorUrl(`official_archives/os1.hyperos.mi.com/${entry}`);
  } else if (version === 'hyperos2') {
    return archiveMirrorUrl(`official_archives/os2.hyperos.mi.com/${entry}`);
  } else if (version === 'hyperos3') {
    return archiveMirrorUrl(`official_archives/os3.hyperos.mi.com/${entry}`);
  } else if (version === 'hyperos4') {
    return archiveMirrorUrl(`official_archives/hyperos.mi.com/${entry}`);
  } else if (version === 'magicos10') {
    if (magicOSArchiveBase) {
      return `${magicOSArchiveBase}/magicos10/${entry}`;
    }
    return archiveMirrorUrl(`official_archives/www.honor.com/cn/magic-os-10/${entry}`);
  } else if (version === 'magicos11') {
    if (magicOSArchiveBase) {
      return `${magicOSArchiveBase}/${entry}`;
    }
    return archiveMirrorUrl(`official_archives/www.honor.com/cn/magic-os/${entry}`);
  } else if (version === 'magicos11insight') {
    return archiveMirrorUrl(`official_archives/magicos11-insight/${entry}`);
  } else if (version === 'hyperos4insight') {
    return archiveMirrorUrl(`official_archives/hyperos4-insight/${entry}`);
  } else if (version === 'harmonyos7') {
    return archiveMirrorUrl(`official_archives/consumer.huawei.com/cn/harmonyos-7/${entry}`);
  } else if (version === 'harmonyos7insight') {
    return archiveMirrorUrl(`official_archives/harmonyos7-insight/${entry}`);
  } else if (version === 'ios27insight') {
    return archiveMirrorUrl(`official_archives/ios27-insight/${entry}`);
  } else if (version === 'ios27') {
    return sitePath(`official_archives/www.apple.com.cn/os/${entry}`);
  } else if (version === 'appleintelligence') {
    return sitePath(`official_archives/www.apple.com.cn/apple-intelligence/${entry}`);
  }
  return '';
}

import { getCollection, type CollectionEntry } from 'astro:content';

export type MonthlyDigest = CollectionEntry<'monthlyDigests'>;

let digestPromise: Promise<Map<string, MonthlyDigest>> | undefined;

export async function getMonthlyDigestMap() {
  digestPromise ??= getCollection('monthlyDigests').then((entries) => new Map(entries.map((entry) => [entry.data.articleId, entry])));
  return digestPromise;
}

export async function getMonthlyDigest(articleId: string) {
  return (await getMonthlyDigestMap()).get(articleId);
}

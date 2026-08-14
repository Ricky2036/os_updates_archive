import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const responsiveImage = z.object({
  src: z.string(),
  srcset: z.string(),
  avifSrcset: z.string().optional(),
  width: z.number().int().min(0),
  height: z.number().int().min(0),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/articles' }),
  schema: z.object({
    articleId: z.string(),
    order: z.number().int().min(0),
    title: z.string(),
    brand: z.enum(['coloros', 'originos', 'hyperos']),
    year: z.number().int(),
    publishedAt: z.string(),
    slug: z.string(),
    kind: z.enum(['gallery', 'interactive', 'microsite']),
    legacyPath: z.string(),
    html: z.string().default(''),
    compatPath: z.string().optional(),
    cover: responsiveImage.extend({
      alt: z.string(),
      dominantColor: z.string(),
      focalPoint: z.string(),
    }).optional(),
    media: z.array(z.object({
      id: z.string(),
      kind: z.enum(['image', 'animated-image', 'video']),
      src: z.string().optional(),
      poster: z.string().optional(),
      width: z.number().int().nonnegative().optional(),
      height: z.number().int().nonnegative().optional(),
      bytes: z.number().int().nonnegative().optional(),
      status: z.enum(['ready', 'missing']),
    })).default([]),
    experience: z.object({
      slug: z.string(),
      title: z.string(),
      ready: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
      entryPath: z.string(),
    }).optional(),
  }),
});

const digestMedia = z.object({
  id: z.string(),
  kind: z.enum(['image', 'animated-image', 'video']),
  src: z.string(),
  thumbnail: z.string(),
  avifSrc: z.string().optional(),
  avifThumbnail: z.string().optional(),
  poster: z.string().optional(),
  alt: z.string(),
  evidenceId: z.string(),
  width: z.number().int().min(0).optional(),
  height: z.number().int().min(0).optional(),
});

const monthlyDigests = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/monthly-digests' }),
  schema: z.object({
    schemaVersion: z.literal(3),
    contentReviewVersion: z.literal(4),
    mediaReviewVersion: z.literal(4),
    articleId: z.string(),
    reviewStatus: z.enum(['draft', 'verified']),
    sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
    highlights: z.array(z.object({
      id: z.string(),
      module: z.string(),
      moduleSource: z.enum(['explicit-heading', 'explicit-inline', 'inferred']),
      title: z.string(),
      description: z.string(),
      mediaStatus: z.enum(['available', 'not-provided']),
      media: z.array(digestMedia),
      evidenceIds: z.array(z.string()).min(1),
      sourceItemIds: z.array(z.string()).min(1),
    })),
    updates: z.array(z.object({
      id: z.string(),
      module: z.string(),
      moduleSource: z.enum(['explicit-heading', 'explicit-inline', 'inferred']),
      type: z.enum(['新增', '优化', '修复', '调整', '适配', '其他', '未标注']),
      typeSource: z.enum(['explicit', 'inferred']),
      sourceText: z.string(),
      description: z.string(),
      evidenceIds: z.array(z.string()).min(1),
      sourceItemIds: z.array(z.string()).min(1),
    })),
    sourceItems: z.array(z.object({
      id: z.string(),
      classification: z.enum(['highlight', 'update', 'excluded']),
      source: z.string(),
      sourceIndex: z.number().int().nonnegative(),
      sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
      blockIds: z.array(z.string()).min(1),
      text: z.string(),
      correctedText: z.string().optional(),
      targetIds: z.array(z.string()),
      exclusionReason: z.enum(['demo-text', 'device-plan', 'disclaimer', 'duplicate', 'decoration']).optional(),
    })),
    evidence: z.array(z.object({
      id: z.string(),
      kind: z.enum(['image-region', 'html-text', 'html-media']),
      role: z.enum(['body-text', 'demo-region', 'update-list', 'excluded']),
      source: z.string(),
      sourceIndex: z.number().int().nonnegative(),
      sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
      blockIds: z.array(z.string()).default([]),
      region: z.object({
        x: z.number().int().nonnegative(),
        y: z.number().int().nonnegative(),
        width: z.number().int().min(0),
        height: z.number().int().min(0),
      }).optional(),
      selector: z.string().optional(),
      note: z.string().optional(),
    })),
    audit: z.object({
      highlightReviewVersion: z.literal(4),
      updateReviewVersion: z.literal(4),
      review: z.object({
        content: z.literal('verified'),
        modules: z.literal('verified'),
        media: z.literal('verified'),
        page: z.literal('verified'),
      }),
      expectedHighlightCount: z.number().int().min(0),
      sourceItemCount: z.number().int().nonnegative(),
      includedItemCount: z.number().int().nonnegative(),
      excludedItemCount: z.number().int().nonnegative(),
      highlightCount: z.number().int().nonnegative(),
      updateCount: z.number().int().nonnegative(),
      mediaCount: z.number().int().nonnegative(),
      mappedItemCount: z.number().int().nonnegative(),
      coverageRate: z.literal(1),
      quantityHint: z.number().int().min(0).optional(),
    }),
  }),
});

export const collections = { articles, monthlyDigests };

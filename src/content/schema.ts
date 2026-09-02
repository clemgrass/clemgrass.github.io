import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';

export const STATUSES = [
  'prototype',
  'in-development',
  'demo',
  'released',
  'thesis',
] as const;

export const ROLES = ['solo', 'pair', 'team', 'consultant'] as const;

export const LINK_KINDS = ['itch', 'external', 'none'] as const;

/** Clips live in `public/`, so their frontmatter path is a site-absolute URL. */
export function publicFileExists(path: string): boolean {
  return existsSync(join(process.cwd(), 'public', path.replace(/^\//, '')));
}

interface SchemaDeps {
  image: () => z.ZodTypeAny;
  fileExists?: (path: string) => boolean;
}

export function makeGameSchema({ image, fileExists = publicFileExists }: SchemaDeps) {
  return z
    .object({
      title: z.string().min(1),
      year: z.number().int().min(2000).max(2100),
      status: z.enum(STATUSES),
      role: z.enum(ROLES),
      contribution: z.string().min(1),
      teamSize: z.number().int().min(1).optional(),
      context: z.string().min(1),
      engine: z.string().min(1),
      tech: z.array(z.string()).min(1),
      link: z.object({
        kind: z.enum(LINK_KINDS),
        url: z.url().nullable().default(null),
        label: z.string().nullable().default(null),
      }),
      media: z
        .object({
          cover: image().optional(),
          clip: z.string().nullable().default(null),
        })
        .default({ clip: null }),
      featured: z.boolean().default(false),
      order: z.number().int().min(1),
      detail: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.link.kind !== 'none' && !data.link.url) {
        ctx.addIssue({
          code: 'custom',
          path: ['link', 'url'],
          message: `link.url is required when link.kind is "${data.link.kind}"`,
        });
      }

      if (data.link.kind === 'none' && data.link.url) {
        ctx.addIssue({
          code: 'custom',
          path: ['link', 'url'],
          message: 'link.url must be null when link.kind is "none"',
        });
      }

      if (data.link.kind === 'external' && !data.link.label) {
        ctx.addIssue({
          code: 'custom',
          path: ['link', 'label'],
          message:
            'link.label is required for external links so the button can name the destination',
        });
      }

      if ((data.role === 'team' || data.role === 'pair') && (data.teamSize ?? 0) < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['teamSize'],
          message: `teamSize of at least 2 is required when role is "${data.role}"`,
        });
      }

      if (data.media.clip && !fileExists(data.media.clip)) {
        ctx.addIssue({
          code: 'custom',
          path: ['media', 'clip'],
          message: `clip file not found in public/: ${data.media.clip}`,
        });
      }
    });
}

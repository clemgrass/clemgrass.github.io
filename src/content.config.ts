import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { makeGameSchema } from './content/schema';

const games = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/games',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) => makeGameSchema({ image }),
});

export const collections = { games };

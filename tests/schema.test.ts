import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { makeGameSchema } from '../src/content/schema';

// `image()` only exists inside Astro's build. A string stub is enough here:
// the tests never assert on image processing, only on the cross-field rules.
const schema = makeGameSchema({
  image: () => z.string(),
  fileExists: (path: string) => path === '/games/sonar/clip.webm',
});

function valid(overrides: Record<string, unknown> = {}) {
  return {
    title: 'SONAR',
    status: 'in-development',
    role: 'solo',
    contribution: 'Built the whole thing.',
    context: 'Personal project',
    engine: 'Godot 4',
    tech: ['C#'],
    link: { kind: 'none', url: null, label: null },
    media: { clip: null },
    order: 1,
    ...overrides,
  };
}

describe('game schema', () => {
  it('accepts a minimal valid entry', () => {
    expect(schema.safeParse(valid()).success).toBe(true);
  });

  it('rejects a status outside the enum', () => {
    const result = schema.safeParse(valid({ status: 'abandoned' }));
    expect(result.success).toBe(false);
  });

  it('requires a url when the link kind is itch', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'itch', url: null, label: null } })
    );
    expect(result.success).toBe(false);
  });

  it('accepts an itch link that has a url', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'itch', url: 'https://clemgrass.itch.io/sonar', label: null } })
    );
    expect(result.success).toBe(true);
  });

  it('rejects a url when the link kind is none', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'none', url: 'https://example.com', label: null } })
    );
    expect(result.success).toBe(false);
  });

  it('requires a label when the link kind is external', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'external', url: 'https://farolazo.com', label: null } })
    );
    expect(result.success).toBe(false);
  });

  it('accepts an external link that has a label', () => {
    const result = schema.safeParse(
      valid({
        link: { kind: 'external', url: 'https://farolazo.com', label: 'Visit farolazo.com' },
      })
    );
    expect(result.success).toBe(true);
  });

  it('requires teamSize of at least 2 when the role is team', () => {
    const result = schema.safeParse(valid({ role: 'team' }));
    expect(result.success).toBe(false);
  });

  it('accepts a team role with a teamSize', () => {
    const result = schema.safeParse(valid({ role: 'team', teamSize: 4 }));
    expect(result.success).toBe(true);
  });

  it('rejects a clip that does not exist on disk', () => {
    const result = schema.safeParse(
      valid({ media: { clip: '/games/ghost/clip.webm' } })
    );
    expect(result.success).toBe(false);
  });

  it('accepts a clip that exists on disk', () => {
    const result = schema.safeParse(
      valid({ media: { clip: '/games/sonar/clip.webm' } })
    );
    expect(result.success).toBe(true);
  });
});

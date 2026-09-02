import { describe, expect, it } from 'vitest';
import { assertUniqueOrder } from '../src/content/order';

describe('assertUniqueOrder', () => {
  it('passes when every order value is unique', () => {
    expect(() =>
      assertUniqueOrder([
        { id: 'sonar', order: 1 },
        { id: 'farolazo', order: 2 },
      ])
    ).not.toThrow();
  });

  it('throws naming both entries that collide', () => {
    expect(() =>
      assertUniqueOrder([
        { id: 'sonar', order: 1 },
        { id: 'farolazo', order: 1 },
      ])
    ).toThrow(/sonar.*farolazo|farolazo.*sonar/);
  });
});

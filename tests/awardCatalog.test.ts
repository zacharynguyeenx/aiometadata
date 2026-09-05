import { describe, expect, it } from 'vitest';
import { AWARD_RULES, extractAwardIds } from '../addon/lib/awardRules';

describe('award catalog extraction', () => {
  it('selects winners, applies historical category filters, and deduplicates IDs', () => {
    const snapshot = {
      '2024': {
        'Golden Globe': {
          'Best Motion Picture - Drama': { winner: ['tt100', 'tt100'], nominee: ['tt200'] },
          'Best Director - Motion Picture': { winner: ['tt300'] },
          'Best TV Series': { winner: ['tt400'] },
        },
      },
    };

    expect(extractAwardIds(snapshot, AWARD_RULES[1])).toEqual(['tt100']);
    expect(extractAwardIds(snapshot, AWARD_RULES[2])).toEqual(['tt300']);
  });

  it('matches Cannes by award heading and only accepts IMDb title IDs', () => {
    const snapshot = {
      '2024': {
        "Palme d'Or": {
          "Palme d'Or": { winner: ['tt500', 'nm123'] },
        },
      },
    };

    expect(extractAwardIds(snapshot, AWARD_RULES[0])).toEqual(['tt500']);
  });
});

import { describe, expect, it } from 'vitest';
import { isUnratedCertification, malRatingToCertification, passesAgeRating } from '../addon/utils/ageRating';

describe('age rating rules', () => {
  it('maps MAL rating descriptions to MPAA certifications', () => {
    expect(malRatingToCertification('PG-13 - Teens 13 or older')).toBe('PG-13');
    expect(malRatingToCertification('unknown')).toBeNull();
  });

  it('allows or rejects unrated content according to configuration', () => {
    expect(isUnratedCertification('NR')).toBe(true);
    expect(passesAgeRating('NR', 'movie', 'PG', true)).toBe(true);
    expect(passesAgeRating('NR', 'movie', 'PG', false)).toBe(false);
  });

  it('accepts a title at the configured cap and rejects a stricter title', () => {
    expect(passesAgeRating('PG-13', 'movie', 'PG-13')).toBe(true);
    expect(passesAgeRating('R', 'movie', 'PG-13')).toBe(false);
  });
});

export type AwardRuleId =
  | 'cannes-golden-palm'
  | 'golden-globes-best-picture'
  | 'golden-globes-best-director'
  | 'oscars-best-picture'
  | 'oscars-best-director';

export interface AwardRule {
  id: AwardRuleId;
  name: string;
  eventId: string;
  awardFilter?: string[];
  categoryFilter?: string[];
}

export const AWARD_RULES: AwardRule[] = [
  { id: 'cannes-golden-palm', name: 'Cannes Golden Palm Winners', eventId: 'ev0000147', awardFilter: ["palme d'or"] },
  { id: 'golden-globes-best-picture', name: 'Golden Globes Best Picture Winners', eventId: 'ev0000292', categoryFilter: [
    'best animated feature film', 'best animated film', 'best foreign film', 'best foreign language film',
    'best foreign-language foreign film', 'best motion picture - animated', 'best motion picture - comedy',
    'best motion picture - comedy or musical', 'best motion picture - drama', 'best motion picture - foreign language',
    'best motion picture - musical', 'best motion picture - musical or comedy', 'best motion picture, musical or comedy',
    'best motion picture - non-english language', 'best picture',
  ] },
  { id: 'golden-globes-best-director', name: 'Golden Globes Best Director Winners', eventId: 'ev0000292', categoryFilter: ['best director', 'best director - motion picture'] },
  { id: 'oscars-best-picture', name: 'Oscars Best Picture Winners', eventId: 'ev0000003', categoryFilter: [
    'best motion picture of the year', 'best picture', 'best picture, production', 'best picture, unique and artistic production',
  ] },
  { id: 'oscars-best-director', name: 'Oscars Best Director Winners', eventId: 'ev0000003', categoryFilter: [
    'best achievement in directing', 'best director', 'best director, comedy picture', 'best director, dramatic picture',
  ] },
];

export function extractAwardIds(snapshot: any, rule: AwardRule): string[] {
  const ids = new Set<string>();
  for (const year of Object.values(snapshot || {}) as any[]) {
    for (const [awardName, award] of Object.entries(year || {}) as [string, any][]) {
      if (rule.awardFilter && !rule.awardFilter.includes(awardName.toLowerCase())) continue;
      for (const [categoryName, category] of Object.entries(award || {}) as [string, any][]) {
        if (rule.categoryFilter && !rule.categoryFilter.includes(categoryName.toLowerCase())) continue;
        for (const id of (category?.winner || []) as unknown[]) {
          if (typeof id === 'string' && /^tt\d+$/.test(id)) ids.add(id);
        }
      }
    }
  }
  return [...ids];
}

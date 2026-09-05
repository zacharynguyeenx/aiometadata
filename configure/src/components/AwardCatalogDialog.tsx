import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { CatalogConfig } from '@/contexts/config';

export const AWARD_RULES = [
  ['cannes-golden-palm', 'Cannes Golden Palm Winners'],
  ['golden-globes-best-picture', 'Golden Globes Best Picture Winners'],
  ['golden-globes-best-director', 'Golden Globes Best Director Winners'],
  ['oscars-best-picture', 'Oscars Best Picture Winners'],
  ['oscars-best-director', 'Oscars Best Director Winners'],
] as const;

export function awardCatalogName(ruleIds: string[]) {
  const names = AWARD_RULES.filter(([id]) => ruleIds.includes(id)).map(([, name]) => name.replace(' Winners', ''));
  return names.length === 1 ? `${names[0]} Winners` : 'Award Winners';
}

function nextName(catalogs: CatalogConfig[], base: string) {
  const names = new Set(catalogs.map(c => c.name));
  if (!names.has(base)) return base;
  let suffix = 2;
  while (names.has(`${base} (${suffix})`)) suffix += 1;
  return `${base} (${suffix})`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  catalogs: CatalogConfig[];
  setCatalogs: (updater: (catalogs: CatalogConfig[]) => CatalogConfig[]) => void;
  editingCatalog?: CatalogConfig;
}

export function AwardCatalogDialog({ isOpen, onClose, catalogs, setCatalogs, editingCatalog }: Props) {
  const initialRules = editingCatalog?.metadata?.awardRuleIds || [];
  const [ruleIds, setRuleIds] = useState<string[]>(initialRules);
  const [name, setName] = useState(editingCatalog?.name || awardCatalogName(initialRules));

  const openChanged = (open: boolean) => {
    if (open) {
      setRuleIds(editingCatalog?.metadata?.awardRuleIds || []);
      setName(editingCatalog?.name || awardCatalogName(editingCatalog?.metadata?.awardRuleIds || []));
    } else onClose();
  };

  const save = () => {
    if (ruleIds.length === 0 || !name.trim()) return;
    if (editingCatalog) {
      setCatalogs(current => current.map(c => c.instanceId === editingCatalog.instanceId && c.id === editingCatalog.id
        ? { ...c, name: name.trim(), metadata: { ...c.metadata, awardRuleIds: ruleIds } }
        : c));
    } else {
      const baseName = name.trim() || awardCatalogName(ruleIds);
      setCatalogs(current => [...current, {
        id: `awards.imdb.${crypto.randomUUID()}`,
        instanceId: crypto.randomUUID(),
        name: nextName(current, baseName),
        type: 'movie',
        source: 'awards',
        enabled: true,
        showInHome: true,
        metadata: { awardRuleIds: ruleIds },
      }]);
    }
    onClose();
  };

  return <Dialog open={isOpen} onOpenChange={openChanged}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Awards</DialogTitle>
        <DialogDescription>Select one or more winner-only movie award rules.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="award-catalog-name">Catalog name</Label>
          <Input id="award-catalog-name" value={name} onChange={event => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          {AWARD_RULES.map(([id, label]) => <label key={id} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <span className="text-sm">{label}</span>
            <Switch checked={ruleIds.includes(id)} onCheckedChange={checked => setRuleIds(current => checked ? [...current, id] : current.filter(value => value !== id))} />
          </label>)}
        </div>
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={!name.trim() || ruleIds.length === 0}>Save</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

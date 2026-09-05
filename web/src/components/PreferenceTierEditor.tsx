import React from 'react';

export interface PreferenceTier {
  attributeName: string;
  attributeValue: string;
  tier: 'MUST_HAVE' | 'PREFERRED' | 'FLEXIBLE' | 'DEAL_BREAKER';
}

interface Props {
  attributeName: string;
  label: string;
  options: string[];
  preferences: PreferenceTier[];
  onChange: (prefs: PreferenceTier[]) => void;
}

export const PreferenceTierEditor: React.FC<Props> = ({ attributeName, label, options, preferences, onChange }) => {
  const currentPref = preferences.find(p => p.attributeName === attributeName) || { attributeName, attributeValue: '', tier: 'FLEXIBLE' as const };

  const handleChangeValue = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newPrefs = preferences.filter(p => p.attributeName !== attributeName);
    if (val) {
      newPrefs.push({ ...currentPref, attributeValue: val });
    }
    onChange(newPrefs);
  };

  const handleChangeTier = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!currentPref.attributeValue) return;
    const newPrefs = preferences.filter(p => p.attributeName !== attributeName);
    newPrefs.push({ ...currentPref, tier: e.target.value as any });
    onChange(newPrefs);
  };

  return (
    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
      <h5 style={{ color: '#E2E8F0', margin: '0 0 12px 0' }}>{label}</h5>
      <div style={{ display: 'flex', gap: '10px' }}>
        <select 
          value={currentPref.attributeValue} 
          onChange={handleChangeValue}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF' }}
        >
          <option value="">Any</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select 
          value={currentPref.tier} 
          onChange={handleChangeTier}
          disabled={!currentPref.attributeValue}
          style={{ width: '130px', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', opacity: currentPref.attributeValue ? 1 : 0.5 }}
        >
          <option value="MUST_HAVE">Must Have</option>
          <option value="PREFERRED">Preferred</option>
          <option value="FLEXIBLE">Flexible</option>
          <option value="DEAL_BREAKER">Deal Breaker</option>
        </select>
      </div>
    </div>
  );
};

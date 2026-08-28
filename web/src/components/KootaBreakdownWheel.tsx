import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, ChevronRight } from 'lucide-react';

interface KootaItem {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  significance: string;
}

const defaultKootas: KootaItem[] = [
  { name: 'Varna', score: 1, maxScore: 1, description: 'Spiritual ego & work archetype harmony', significance: 'Matches intrinsic motivation and life goals.' },
  { name: 'Vashya', score: 2, maxScore: 2, description: 'Mutual magnetic attraction & control balance', significance: 'Ensures natural affection without domination.' },
  { name: 'Tara', score: 3, maxScore: 3, description: 'Birth star destiny & health resonance', significance: 'Fosters longevity, luck, and emotional safety.' },
  { name: 'Yoni', score: 4, maxScore: 4, description: 'Instinctual intimacy & biological affinity', significance: 'Harmonizes physical passion and companionship.' },
  { name: 'Maitri', score: 5, maxScore: 5, description: 'Planetary lord friendship & mental bond', significance: 'Deep intellectual synergy and effortless communication.' },
  { name: 'Gana', score: 6, maxScore: 6, description: 'Temperament alignment (Deva/Manushya/Rakshasa)', significance: 'Balances daily routine habits and nature.' },
  { name: 'Bhakoot', score: 7, maxScore: 7, description: 'Moon Rashi placement & family prosperity', significance: 'Brings financial growth, joy, and emotional warmth.' },
  { name: 'Nadi', score: 8, maxScore: 8, description: 'Genetic vitality & physiological energy balance', significance: 'Primary determinant of long-term health and lineage.' }
];

export const KootaBreakdownWheel: React.FC<{ totalScore?: number }> = ({ totalScore = 28 }) => {
  const [selectedKoota, setSelectedKoota] = useState<KootaItem | null>(defaultKootas[7]); // Default Nadi

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(30, 24, 54, 0.9) 0%, rgba(42, 14, 26, 0.9) 100%)',
        border: '1px solid var(--border-glow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-cosmic)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
            Interactive 8-Koota Breakdown 🌌
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Tap any Koota to inspect astrological synergy
          </span>
        </div>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber-light)',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}
        >
          {totalScore} / 36 Gunas
        </div>
      </div>

      {/* 8-Koota Interactive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {defaultKootas.map((koota, idx) => {
          const isSelected = selectedKoota?.name === koota.name;
          return (
            <div
              key={idx}
              onClick={() => setSelectedKoota(koota)}
              style={{
                padding: '10px 6px',
                borderRadius: '14px',
                background: isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: isSelected ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-color)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {koota.name}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isSelected ? 'var(--accent-amber-light)' : 'var(--text-primary)', marginTop: '2px' }}>
                {koota.score}/{koota.maxScore}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Koota Detail Card */}
      {selectedKoota && (
        <div
          style={{
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              ✨ {selectedKoota.name} Koota ({selectedKoota.score} of {selectedKoota.maxScore} Points)
            </span>
            <span style={{ fontSize: '0.7rem', color: '#4ADE80', fontWeight: 700 }}>Optimal Match</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {selectedKoota.description}
          </p>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Info size={14} color="var(--accent-indigo)" />
            <span>{selectedKoota.significance}</span>
          </div>
        </div>
      )}
    </div>
  );
};

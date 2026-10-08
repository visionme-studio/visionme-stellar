import React from 'react';

export interface Pocket {
  id: string;
  name: string;
  balance?: number;
  currency?: string;
  description?: string;
  createdAt?: string;
}

export interface PocketCardProps {
  pocket: Pocket;
  onClick?: (pocket: Pocket) => void;
}

function formatBalance(balance?: number, currency?: string): string {
  const amount = typeof balance === 'number' ? balance : 0;
  const code = currency ?? 'USD';
  try {
    return new Intl.NumberFormat('undefined', {
      style: 'currency',
      currency: code,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
}

export const PocketCard: React.FC<PocketCardProps> = ({ pocket, onClick }) => {
  const interactive = typeof onClick === 'function';
  return (
    <div
      onClick={interactive ? () => onClick?.(pocket) : undefined}
      onKeyDown={
        interactive
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.(pocket);
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem 1.25rem',
        border: '1px solid rgba(127, 127, 127, 0.25)',
        borderRadius: '0.75rem',
        background: 'var(--card-background, transparent)',
        cursor: interactive ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
        <strong style={{ fontSize: '1rem' }}>{pocket.name}</strong>
        <span style={{ fontWeight: 600 }}>
          {formatBalance(pocket.balance, pocket.currency)}
        </span>
      </div>
      {pocket.description ? (
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>{pocket.description}</p>
      ) : null}
    </div>
  );
};

export default PocketCard;

// EmptyState.tsx
import React from 'react';

const EmptyState: React.FC = () => (
  <div
    style={{
      padding: '64px 24px',
      textAlign: 'center',
      color: 'var(--ink-faded)',
    }}
  >
    <div className="ts-label" style={{ marginBottom: 6 }}>No entries yet</div>
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 26,
        color: 'var(--ink-soft)',
      }}
    >
      The ledger awaits its first scribble.
    </div>
  </div>
);

export default EmptyState;

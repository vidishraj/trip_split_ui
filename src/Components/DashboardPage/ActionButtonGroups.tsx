import React from 'react';
import { useTravel } from '../../Contexts/TravelContext';

interface ActionButtonGroupsProps {
  isMobile: boolean;
  userCount: number;
  active: 'expenses' | 'balances';
  onToggleExpenses: () => void;
  onToggleBalances: () => void;
  onOpenNameList: () => void;
  onOpenCurrencyDialog: () => void;
  onOpenExpenseDialog: () => void;
  onOpenUserDialog: () => void;
  onOpenNotes: () => void;
  onOpenCalculator: () => void;
}

const Pill: React.FC<{
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  emphasis?: 'ink' | 'stamp' | 'plain';
}> = ({ active, onClick, children, emphasis = 'plain' }) => {
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    padding: '9px 14px',
    border: '1px solid var(--ink)',
    background: 'transparent',
    color: 'var(--ink)',
    cursor: 'pointer',
    transition: 'all 100ms ease',
    whiteSpace: 'nowrap',
  };
  let s = base;
  if (active) s = { ...s, background: 'var(--ink)', color: 'var(--paper)' };
  else if (emphasis === 'ink') s = { ...s, background: 'var(--ink)', color: 'var(--paper)' };
  else if (emphasis === 'stamp')
    s = { ...s, borderColor: 'var(--stamp)', color: 'var(--stamp)' };

  return (
    <button
      type="button"
      onClick={onClick}
      style={s}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background =
            emphasis === 'stamp' ? 'var(--stamp)' : 'var(--ink)';
          (e.currentTarget as HTMLElement).style.color = 'var(--paper)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background =
            emphasis === 'ink' ? 'var(--ink)' : 'transparent';
          (e.currentTarget as HTMLElement).style.color =
            emphasis === 'ink'
              ? 'var(--paper)'
              : emphasis === 'stamp'
                ? 'var(--stamp)'
                : 'var(--ink)';
        }
      }}
    >
      {children}
    </button>
  );
};

const ActionButtonGroups: React.FC<ActionButtonGroupsProps> = ({
  isMobile,
  userCount,
  active,
  onToggleExpenses,
  onToggleBalances,
  onOpenNameList,
  onOpenCurrencyDialog,
  onOpenExpenseDialog,
  onOpenUserDialog,
  onOpenNotes,
  onOpenCalculator,
}) => {
  const travelCtx = useTravel();
  const tripId = travelCtx.state.chosenTrip?.tripIdShared;

  const copyTripId = async () => {
    if (!tripId) return;
    try {
      await navigator.clipboard.writeText(tripId);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Row 1: section switch */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          border: '1px solid var(--ink)',
          padding: 0,
          width: 'fit-content',
        }}
      >
        <Pill active={active === 'expenses'} onClick={onToggleExpenses}>
          The Ledger
        </Pill>
        <Pill active={active === 'balances'} onClick={onToggleBalances}>
          Settlement
        </Pill>
      </div>

      {/* Row 2: utilities — wraps on mobile */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Pill onClick={onOpenNameList}>
          {userCount.toString().padStart(2, '0')} · Members
        </Pill>
        <Pill onClick={onOpenCurrencyDialog}>FX rates</Pill>
        <Pill onClick={onOpenNotes}>Notes</Pill>
        <Pill onClick={onOpenCalculator}>Calculator</Pill>
        <Pill onClick={onOpenUserDialog} emphasis="stamp">
          Pending requests
        </Pill>
        {tripId && (
          <Pill onClick={copyTripId}>
            ⎘ {isMobile ? 'ID' : `ID ${tripId}`}
          </Pill>
        )}
      </div>

      {/* Row 3: primary write actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Pill onClick={onOpenExpenseDialog} emphasis="ink">
          + Record expense
        </Pill>
      </div>
    </div>
  );
};

export default ActionButtonGroups;

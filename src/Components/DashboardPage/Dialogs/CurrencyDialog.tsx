import React, { useContext } from 'react';
import { Dialog } from '@mui/material';
import { CurrencyContext } from '../../../Contexts/CurrencyContext';
import { useTravel } from '../../../Contexts/TravelContext';
import { currencies } from '../../../Assets/currencyData';
import { Perf, Stamp } from '../../Design/Atoms';

const CurrencyDialog: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { state } = useContext(CurrencyContext);
  const travelCtx = useTravel();

  const renderBody = () => {
    if (state.loading) {
      return (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--ink-faded)' }}>
          <div className="ts-label">Loading rates…</div>
        </div>
      );
    }
    if (state.error) {
      return (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--stamp)' }}>
          <div className="ts-label">Error</div>
          <div style={{ marginTop: 8 }}>{state.error}</div>
        </div>
      );
    }
    return (travelCtx.state.chosenTrip?.currencies || []).map(
      (name: string, index: number) => {
        const matched = currencies?.find((item) => item.label === name);
        if (!matched) return null;
        const rate = (1 / state.currencies?.inr[matched.abr]).toFixed(2) || 'N/A';
        return (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr auto',
              alignItems: 'center',
              gap: 14,
              padding: '14px 4px',
              borderBottom: '1px dashed var(--rule-soft)',
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: 'var(--ink)',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {matched.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 18,
                  lineHeight: 1.1,
                }}
              >
                {name}
              </div>
              <div className="ts-label" style={{ marginTop: 2 }}>
                {matched.abr.toUpperCase()}
              </div>
            </div>
            <div className="ts-num" style={{ fontSize: 17, fontWeight: 600 }}>
              ₹{rate}
            </div>
          </div>
        );
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '28px 30px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <div>
            <div className="ts-eyebrow">Bureau de change</div>
            <h2
              className="ts-display"
              style={{
                margin: '6px 0 0',
                fontSize: 28,
                fontVariationSettings: '"SOFT" 30, "opsz" 144',
              }}
            >
              Today's rates.
            </h2>
            <div className="ts-mono" style={{ fontSize: 11, color: 'var(--ink-faded)', marginTop: 4, letterSpacing: '0.16em' }}>
              Rates as of {new Date().toUTCString().slice(5, 16)} · per 1 unit → INR
            </div>
          </div>
          <Stamp text="₹" date="LIVE" tone="ledger" size={70} rotate={-8} />
        </div>

        <Perf style={{ margin: '14px 0 6px' }} />

        <div style={{ maxHeight: 380, overflowY: 'auto' }}>{renderBody()}</div>

        <Perf style={{ marginTop: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="ts-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </Dialog>
  );
};

export default CurrencyDialog;

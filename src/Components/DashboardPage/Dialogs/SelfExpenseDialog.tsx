import React, { useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import { useTravel } from '../../../Contexts/TravelContext';
import { formatNumber } from '../../../Contexts/CurrencyContext';
import { fetchIndividualSpending } from '../../../Api/Api';
import { Perf, Stamp } from '../../Design/Atoms';

interface SelfExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const SelfExpenseDialog: React.FC<SelfExpenseDialogProps> = ({ open, onClose }) => {
  const { indiBalance, users, chosenTrip } = useTravel().state;
  const [spending, setSpending] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getUserName = (userId: number) => {
    const u = users.find((user) => user.userId === userId);
    return u ? u.userName : 'Unknown';
  };

  useEffect(() => {
    if (open && chosenTrip?.tripIdShared) {
      setLoading(true);
      fetchIndividualSpending(chosenTrip.tripIdShared)
        .then((response) => setSpending(response.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, chosenTrip?.tripIdShared]);

  const spendingData = spending?.Message?.individualSpending || {};
  const total = spending?.Message?.totalTripCost ?? 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '28px 30px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <div>
            <div className="ts-eyebrow">Itemised contributions</div>
            <h2
              className="ts-display"
              style={{ margin: '6px 0 0', fontSize: 28, fontVariationSettings: '"SOFT" 30, "opsz" 144' }}
            >
              What each bearer paid.
            </h2>
          </div>
          <Stamp text="Audit" date="·" tone="gold" size={72} rotate={-7} />
        </div>

        <Perf style={{ margin: '10px 0' }} />

        {/* Actual money spent */}
        <div className="ts-label" style={{ marginBottom: 8 }}>
          Money disbursed · out of pocket
        </div>

        {loading && (
          <div className="ts-mono" style={{ fontSize: 12, color: 'var(--ink-faded)', padding: '12px 0' }}>
            Tallying receipts…
          </div>
        )}

        <div>
          {Object.entries(spendingData).map(([userId, amount]) => (
            <div
              key={userId}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 14,
                alignItems: 'center',
                padding: '10px 4px',
                borderBottom: '1px dashed var(--rule-soft)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 500,
                }}
              >
                {getUserName(Number(userId))}
              </div>
              <div className="ts-num" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ledger)' }}>
                ₹{formatNumber(Number(amount))}
              </div>
            </div>
          ))}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              padding: '12px 8px',
              background: 'var(--ink)',
              color: 'var(--paper)',
              marginTop: 6,
            }}
          >
            <div className="ts-mono" style={{ letterSpacing: '0.2em', fontSize: 11, textTransform: 'uppercase' }}>
              Total trip cost
            </div>
            <div className="ts-num" style={{ fontSize: 19, fontWeight: 700 }}>
              ₹{formatNumber(total)}
            </div>
          </div>
        </div>

        <Perf style={{ margin: '18px 0 12px' }} />

        {/* Net balances */}
        <div className="ts-label" style={{ marginBottom: 8 }}>
          Net balance · per bearer
        </div>
        <div className="ts-mono" style={{ fontSize: 11, color: 'var(--ink-faded)', marginBottom: 12, letterSpacing: '0.04em' }}>
          Positive ⇒ owed money. Negative ⇒ owes money. (Personal spend in brackets.)
        </div>

        <div>
          {indiBalance &&
            indiBalance['expense'] &&
            Object.keys(indiBalance['expense']).map((userId: string) => {
              const net = indiBalance['expense'][userId];
              const personal =
                (indiBalance['selfExpense'] && indiBalance['selfExpense'][userId]) || 0;
              return (
                <div
                  key={userId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 14,
                    alignItems: 'baseline',
                    padding: '10px 4px',
                    borderBottom: '1px dashed var(--rule-soft)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 17,
                      fontWeight: 500,
                    }}
                  >
                    {getUserName(Number(userId))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <div
                      className="ts-num"
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: net >= 0 ? 'var(--ledger)' : 'var(--stamp)',
                      }}
                    >
                      {net >= 0 ? '+' : '−'}₹{formatNumber(Math.abs(net))}
                    </div>
                    <div className="ts-mono" style={{ fontSize: 11, color: 'var(--ink-faded)' }}>
                      (₹{formatNumber(personal)})
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="ts-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </Dialog>
  );
};

export default SelfExpenseDialog;

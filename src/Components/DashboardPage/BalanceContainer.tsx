// BalanceContainer.tsx — Customs declaration / settlement view
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTravel } from '../../Contexts/TravelContext';
import { formatNumber } from '../../Contexts/CurrencyContext';
import SelfExpenseDialog from './Dialogs/SelfExpenseDialog';
import { Perf, Stamp } from '../Design/Atoms';

const BalanceContainer: React.FC = () => {
  const travelCtx = useTravel();
  const userBalances = travelCtx.state.balances || [];
  const [selfExpenseDialog, setSelfExpenseDialog] = useState(false);

  const total = travelCtx.state.indiBalance?.total ?? 0;
  const positive = total >= 0;

  const getUserName = (userId: number) => {
    const u = travelCtx.state.users.find((user) => user.userId === userId);
    return u ? u.userName : 'Unknown';
  };

  return (
    <motion.div
      key="balance"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="ts-paper"
      style={{ padding: 0, position: 'relative', overflow: 'hidden' }}
    >
      {/* Heading band */}
      <div
        style={{
          padding: '20px 24px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="ts-eyebrow">Folio III</div>
          <h3
            className="ts-display"
            style={{
              margin: '6px 0 0',
              fontSize: 28,
              fontVariationSettings: '"SOFT" 30, "opsz" 144',
            }}
          >
            Customs declaration.
          </h3>
          <div
            className="ts-mono"
            style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-faded)', letterSpacing: '0.18em' }}
          >
            Settlement plan · minimum transactions
          </div>
        </div>

        <Stamp
          text={positive ? 'Credit' : 'Debit'}
          date="·"
          tone={positive ? 'ledger' : 'stamp'}
          size={84}
          rotate={6}
        />
      </div>

      {/* Total summary block */}
      <div
        style={{
          background: 'var(--paper-deep)',
          borderTop: '1px solid var(--rule-soft)',
          borderBottom: '1px solid var(--rule-soft)',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="ts-label">Total declared</div>
          <div
            className="ts-num"
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: positive ? 'var(--ledger)' : 'var(--stamp)',
              marginTop: 4,
            }}
          >
            {positive ? '+' : '−'}₹{formatNumber(Math.abs(total))}
          </div>
        </div>

        <button
          className="ts-btn ts-btn-ink"
          onClick={() => setSelfExpenseDialog(true)}
        >
          Itemised contributions ↗
        </button>
      </div>

      {/* Transactions */}
      <div style={{ padding: '8px 0 12px' }}>
        {userBalances && userBalances.length > 0 ? (
          userBalances.map((balance: any, index: number) => {
            const sender = getUserName(balance.from);
            const receiver = getUserName(balance.to);
            return (
              <motion.div
                key={`${balance.from}-${balance.to}-${index}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{
                  padding: '14px 24px',
                  borderBottom: '1px dashed var(--rule-soft)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: 18,
                  alignItems: 'center',
                }}
              >
                {/* Debtor */}
                <div>
                  <div className="ts-label">From · debtor</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      fontWeight: 500,
                      marginTop: 2,
                      color: 'var(--ink)',
                    }}
                  >
                    {sender}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'center', minWidth: 200 }}>
                  <Perf style={{ width: 80, margin: '0 auto 8px' }} />
                  <div
                    className="ts-num"
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: 'var(--stamp)',
                    }}
                  >
                    ₹{formatNumber(balance.amount)}
                  </div>
                  <Perf style={{ width: 80, margin: '8px auto 0' }} />
                </div>

                {/* Creditor */}
                <div style={{ textAlign: 'right' }}>
                  <div className="ts-label">To · creditor</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      fontWeight: 500,
                      marginTop: 2,
                      color: 'var(--ledger)',
                    }}
                  >
                    {receiver}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div style={{ padding: '54px 24px', textAlign: 'center' }}>
            <div className="ts-label" style={{ marginBottom: 6 }}>
              All accounts square
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 26,
                color: 'var(--ink-soft)',
              }}
            >
              No debts to declare.
            </div>
          </div>
        )}
      </div>

      <SelfExpenseDialog
        open={selfExpenseDialog}
        onClose={() => setSelfExpenseDialog(false)}
      />
    </motion.div>
  );
};

export default BalanceContainer;

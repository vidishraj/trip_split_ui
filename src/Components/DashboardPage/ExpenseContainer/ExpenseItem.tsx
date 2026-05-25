// ExpenseItem.tsx — Ledger row
import React, { useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useTravel } from '../../../Contexts/TravelContext';
import { useMessage } from '../../../Contexts/NotifContext';
import ConfirmationDialog from '../../ConfirmationDialog';
import { deleteExpense } from '../../../Api/Api';
import { formatNumber } from '../../../Contexts/CurrencyContext';

interface ExpenseProps {
  expense: any;
}

const ExpenseItem: React.FC<ExpenseProps> = ({ expense }) => {
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [open, setOpen] = useState(false);

  const formattedDate = new Date(expense.date).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
  });
  const dayOfWeek = new Date(expense.date).toLocaleDateString(undefined, { weekday: 'short' });

  const getUserName = (userId: number) => {
    const u = travelCtx.state.users.find((user: any) => user.userId === userId);
    return u ? u.userName : 'Unknown';
  };

  const handleEdit = () => {
    travelCtx.dispatch({ type: 'SET_SELECTED_EXPENSE', payload: expense });
    travelCtx.dispatch({ type: 'SET_EXPENSE_DIALOG_STATE', payload: true });
  };

  const handleDelete = () => {
    setConfirmDialog(false);
    deleteExpense(true, expense.expenseId, expense.tripId)
      .then(() => {
        setPayload({ type: 'success', message: 'Entry struck off the ledger.' });
        travelCtx.state.refreshData();
      })
      .catch(() => setPayload({ type: 'error', message: 'Could not delete entry.' }));
  };

  const splitBetween = expense.splitBetween || {};

  return (
    <>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '64px 1fr auto' : '92px 1fr auto',
          gap: isMobile ? 12 : 18,
          alignItems: 'baseline',
          padding: isMobile ? '12px 12px' : '14px 16px',
          borderBottom: '1px dashed var(--rule-soft)',
          cursor: 'pointer',
          background: open ? 'var(--paper-deep)' : 'transparent',
          transition: 'background-color 100ms ease',
        }}
        onMouseEnter={(e) => {
          if (!open) (e.currentTarget as HTMLElement).style.background = 'rgba(20,17,13,0.035)';
        }}
        onMouseLeave={(e) => {
          if (!open) (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        <div>
          {!isMobile && (
            <div
              className="ts-mono"
              style={{
                fontSize: 12,
                color: 'var(--ink-faded)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {dayOfWeek}
            </div>
          )}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? 16 : 22,
              lineHeight: 1,
              marginTop: 2,
              fontVariationSettings: '"SOFT" 30, "opsz" 144',
            }}
          >
            {formattedDate}
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: isMobile ? 16 : 19,
              lineHeight: 1.2,
              fontVariationSettings: '"SOFT" 30, "opsz" 144',
              overflowWrap: 'anywhere',
            }}
          >
            {expense.expenseDesc}
            {expense.selfExpense && (
              <span
                className="ts-mono"
                style={{
                  marginLeft: 8,
                  fontSize: 9,
                  padding: '2px 6px',
                  color: 'var(--gold)',
                  border: '1px solid var(--gold)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap',
                }}
              >
                Personal
              </span>
            )}
          </div>
          <div className="ts-label" style={{ marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Paid · {getUserName(expense.paidBy)}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            className="ts-num"
            style={{ fontSize: isMobile ? 16 : 19, fontWeight: 600, color: 'var(--ink)' }}
          >
            ₹{formatNumber(expense.amount)}
          </div>
          <div className="ts-label" style={{ marginTop: 4 }}>
            {Object.keys(splitBetween).length} part{Object.keys(splitBetween).length === 1 ? '' : 's'} {open ? '↑' : '↓'}
          </div>
        </div>
      </div>

      {open && (
        <div
          style={{
            background: 'var(--paper-deep)',
            padding: '14px 18px 18px',
            borderBottom: '1px dashed var(--rule-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="ts-label" style={{ marginBottom: 8 }}>
                Apportionment
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.keys(splitBetween).map((userId: string) => {
                  const v = splitBetween[userId];
                  const owesAmount = v >= 0 ? -1 * (expense.amount - v) : v;
                  return (
                    <div
                      key={userId}
                      style={{
                        border: '1px solid var(--rule-soft)',
                        padding: '6px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 14,
                          lineHeight: 1.1,
                        }}
                      >
                        {getUserName(parseInt(userId))}
                      </div>
                      <div
                        className="ts-num"
                        style={{
                          fontSize: 14,
                          color: owesAmount < 0 ? 'var(--stamp)' : 'var(--ledger)',
                          marginTop: 2,
                        }}
                      >
                        {owesAmount < 0 ? '−' : '+'}₹{formatNumber(Math.abs(owesAmount))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
              <button
                className="ts-btn"
                style={{ padding: '6px 12px', fontSize: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                Amend
              </button>
              <button
                className="ts-btn ts-btn-stamp"
                style={{ padding: '6px 12px', fontSize: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDialog(true);
                }}
              >
                Strike off
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={confirmDialog}
        message="Strike this entry from the ledger? This cannot be undone."
        onSubmit={handleDelete}
        onCancel={() => setConfirmDialog(false)}
      />
    </>
  );
};

export default ExpenseItem;

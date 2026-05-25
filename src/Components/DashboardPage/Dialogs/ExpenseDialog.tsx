import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Calculate } from '@mui/icons-material';
import { insertExpense, updateExpense } from '../../../Api/Api';
import { useTravel } from '../../../Contexts/TravelContext';
import { AmountSplitDialog } from './AmountSplitDialog';
import { CurrencyContext } from '../../../Contexts/CurrencyContext';
import { currencies } from '../../../Assets/currencyData';
import { useMessage } from '../../../Contexts/NotifContext';
import Calculator from '../../Calculator/Calculator';
import { Perf, Stamp } from '../../Design/Atoms';

interface ExpenseDialogProps {
  editMode?: boolean;
  editData?: any;
  onClose: () => void;
}

interface FormState {
  date: string;
  description: string;
  currencyAmounts: { [key: string]: number };
  paidBy: { userId?: number; userName: string };
  selfExpense: boolean;
  userDivision?: Array<{ userId: any; userName: string; amount: number }>;
}

interface SplitItem {
  userId: number;
  userName: string;
  [key: string]: any;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ onClose, editMode, editData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const { state: currencyState } = useContext(CurrencyContext);
  const [calcState, setCalcState] = useState(false);
  const [amountSetter, setAmountSetter] = useState(false);

  const [formState, setFormState] = useState<FormState>(() => ({
    date:
      editMode && editData
        ? new Date(editData.date).toISOString().substr(0, 10)
        : new Date().toISOString().substr(0, 10),
    description: editMode && editData ? editData.expenseDesc : '',
    currencyAmounts: {},
    paidBy:
      editMode && editData
        ? {
            userId: editData.paidBy,
            userName:
              travelCtx.state.users.find((user) => user.userId === editData.paidBy)?.userName ||
              '',
          }
        : { userId: undefined, userName: '' },
    selfExpense: editMode && editData ? editData.selfExpense : false,
    userDivision: undefined,
  }));

  const enabledCurrency = useMemo(() => 'inr', []);

  useEffect(() => {
    const chosenTrip = travelCtx.state.chosenTrip;
    if (!chosenTrip?.currencies || chosenTrip.currencies.length === 0) return;
    const init: { [key: string]: number } = {};
    chosenTrip.currencies.forEach((cur: string) => {
      const abr = currencies.find((c) => c.label === cur)?.abr;
      if (abr) {
        init[abr] =
          editMode && editData
            ? round(editData.amount * currencyState.currencies['inr'][abr], 1)
            : 0;
      }
    });

    if (editMode && editData) {
      const userDiv = Object.keys(editData.splitBetween).map((userId) => {
        const userIdInt = parseInt(userId);
        const isPayer = userIdInt === editData.paidBy;
        return {
          userId: userIdInt,
          userName: '',
          amount: isPayer
            ? editData.amount - editData.splitBetween[userIdInt]
            : -1 * editData.splitBetween[userIdInt],
        };
      });
      setFormState((prev) => ({
        ...prev,
        description: editData.expenseDesc,
        date: new Date(editData.date).toISOString().substr(0, 10),
        paidBy: {
          userId: editData.paidBy,
          userName:
            travelCtx.state.users.find((user) => user.userId === editData.paidBy)?.userName || '',
        },
        selfExpense: editData.selfExpense,
        currencyAmounts: init,
        userDivision: userDiv,
      }));
    } else {
      setFormState((prev) => ({ ...prev, currencyAmounts: init }));
    }
  }, [travelCtx.state.chosenTrip, travelCtx.state.users, editMode, editData, currencyState.currencies]);

  const handleCurrencyAmountChange = useCallback(
    (currency: string, amount: number) => {
      const abr = currencies.find((c) => c.label === currency)?.abr;
      if (!abr) return;
      const valInRs = round(amount / currencyState.currencies['inr'][abr], 1);
      const newAmounts = Object.keys(formState.currencyAmounts).reduce((acc, key) => {
        acc[key] = round(valInRs * currencyState.currencies['inr'][key], 1);
        return acc;
      }, {} as { [key: string]: number });
      setFormState((prev) => ({ ...prev, currencyAmounts: newAmounts }));
    },
    [formState.currencyAmounts, currencyState.currencies],
  );

  const handleSubmit = useCallback(() => {
    const payload = {
      tripId: travelCtx?.state?.chosenTrip?.tripIdShared,
      date: formState.date,
      description: formState.description,
      amount: formState.currencyAmounts[enabledCurrency],
      paidBy: formState.paidBy.userId,
      splitbw: formState.userDivision?.map((item) => ({
        userId: item.userId,
        amount: item.amount,
      })),
      selfExpense: formState.selfExpense,
    };
    const apiCall = editMode
      ? () => updateExpense(editData.expenseId, payload)
      : () => insertExpense(payload);

    apiCall()
      .then((response) => {
        if (response.data.Message) {
          setPayload({
            type: 'success',
            message: `Entry ${editMode ? 'amended' : 'recorded'}.`,
          });
          travelCtx.state.refreshData();
          onClose();
        } else {
          setPayload({ type: 'error', message: 'Could not save entry.' });
        }
      })
      .catch(() => setPayload({ type: 'error', message: 'Could not save entry.' }));
  }, [formState, editMode, editData?.expenseId, travelCtx, enabledCurrency, setPayload, onClose]);

  const isSubmitEnabled = useMemo(() => {
    const { date, description, currencyAmounts, paidBy, selfExpense, userDivision } = formState;
    const amount = currencyAmounts[enabledCurrency];
    let userDivisionSum = 0;
    if (Array.isArray(userDivision)) {
      userDivisionSum = round(
        userDivision.reduce((sum, item) => sum + item.amount, 0),
        1,
      );
    }
    const selfExpenseCheck = selfExpense
      ? amount > 0
      : userDivision && userDivision.length > 0 && userDivisionSum === amount;
    const isFormComplete = date && description && amount > 0 && paidBy.userId && selfExpenseCheck;
    if (!editMode) return isFormComplete;
    const hasChanges =
      description !== editData.expenseDesc ||
      new Date(date).toUTCString() !== editData.date ||
      currencyAmounts[enabledCurrency] !== editData.amount ||
      paidBy.userId !== editData.paidBy ||
      (userDivision?.some((element) => {
        const userIdInt = parseInt(element.userId);
        const amt =
          userIdInt === editData.paidBy
            ? editData.amount - editData.splitBetween[userIdInt]
            : -1 * editData.splitBetween[userIdInt];
        return amt !== element.amount;
      }) ?? false);
    return hasChanges && isFormComplete;
  }, [formState, editMode, editData, enabledCurrency]);

  return (
    <Dialog
      open={travelCtx.state.expenseDialogOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      // Outer Paper carries the height cap and a single scroll axis; the
      // ts-paper inside is a flex column so the form scrolls and the
      // action row stays pinned at the bottom.
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          maxHeight: 'calc(100vh - 32px)',
          margin: '16px',
        },
      }}
    >
      <div
        className="ts-paper"
        style={{
          padding: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 32px)',
        }}
      >
        <DialogContent
          sx={{
            padding: isMobile ? '20px 18px 0' : '24px 26px 0',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div>
              <div className="ts-eyebrow">{editMode ? 'Amend entry' : 'New entry'}</div>
              <h2
                className="ts-display"
                style={{
                  margin: '6px 0 0',
                  fontSize: isMobile ? 22 : 28,
                  fontVariationSettings: '"SOFT" 30, "opsz" 144',
                }}
              >
                {editMode ? 'Edit expense.' : 'Record an expense.'}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <IconButton
                onClick={() => setCalcState(true)}
                sx={{
                  border: '1px solid var(--ink)',
                  borderRadius: 0,
                  color: 'var(--ink)',
                  width: 38,
                  height: 38,
                  '&:hover': { background: 'var(--ink)', color: 'var(--paper)' },
                }}
              >
                <Calculate fontSize="small" />
              </IconButton>
              {!isMobile && (
                <Stamp
                  text="Entry"
                  date="·"
                  tone={editMode ? 'gold' : 'ledger'}
                  size={60}
                  rotate={editMode ? 7 : -8}
                />
              )}
            </div>
          </div>

          <Calculator isVisible={calcState} onClose={() => setCalcState(false)} />

          <Perf style={{ margin: '6px 0 14px' }} />

          {/* Date + description */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '160px 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div>
              <label className="ts-label">Date</label>
              <input
                type="date"
                className="ts-input ts-mono"
                value={formState.date}
                onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                style={{ fontSize: 14 }}
              />
            </div>
            <div>
              <label className="ts-label">Description</label>
              <input
                className="ts-input"
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="What was the expense for?"
              />
            </div>
          </div>

          {/* Currency amounts */}
          <div style={{ marginBottom: 14 }}>
            <label className="ts-label">Amount</label>
            <div
              style={{
                marginTop: 8,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10,
              }}
            >
              {travelCtx.state.chosenTrip?.currencies.map((currency) => {
                const abr = currencies.find((c) => c.label === currency)?.abr || '';
                return (
                  <div key={currency} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="ts-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-faded)', marginBottom: 2 }}>
                      {currency.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ color: 'var(--ink-faded)' }}>
                        {currencies.find((it) => it.label === currency)?.icon}
                      </span>
                      <input
                        type="number"
                        className="ts-input ts-num"
                        value={formState.currencyAmounts[abr] || ''}
                        onChange={(e) =>
                          handleCurrencyAmountChange(currency, parseFloat(e.target.value))
                        }
                        style={{ fontSize: 18 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paid by */}
          <div style={{ marginBottom: 14 }}>
            <label className="ts-label">Paid by</label>
            <select
              className="ts-input ts-mono"
              value={formState.paidBy.userId?.toString() || ''}
              onChange={(e) => {
                const selected = travelCtx.state.users.find(
                  (item) => item.userId === parseInt(e.target.value),
                );
                setFormState((prev) => ({
                  ...prev,
                  paidBy: { userId: selected?.userId, userName: selected?.userName || '' },
                }));
              }}
              style={{
                fontSize: 14,
                letterSpacing: '0.04em',
                background: 'transparent',
              }}
            >
              <option value="">Choose payer</option>
              {travelCtx.state.users.map((user) => (
                <option key={user.userId} value={user.userId.toString()}>
                  {user.userName}
                </option>
              ))}
            </select>
          </div>

          {/* Self vs split */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <label
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={formState.selfExpense}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormState((prev) => {
                    const next = { ...prev, selfExpense: checked };
                    if (checked && prev.paidBy.userId) {
                      next.userDivision = [
                        { userId: prev.paidBy.userId, userName: '', amount: prev.currencyAmounts[enabledCurrency] },
                      ];
                    }
                    return next;
                  });
                }}
              />
              Personal · do not split
            </label>

            <button
              type="button"
              className="ts-btn ts-btn-ink"
              onClick={() => setAmountSetter(true)}
              disabled={
                !formState.paidBy.userId ||
                !formState.currencyAmounts[enabledCurrency] ||
                formState.selfExpense
              }
              style={{ padding: '8px 14px', fontSize: 11 }}
            >
              Apportion among bearers
            </button>
          </div>

          {formState.userDivision && formState.userDivision.length > 0 && !formState.selfExpense && (
            <div
              style={{
                background: 'var(--paper-deep)',
                border: '1px dashed var(--rule-soft)',
                padding: 10,
                marginTop: 8,
              }}
            >
              <div className="ts-label" style={{ marginBottom: 6 }}>Current apportionment</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {formState.userDivision.map((u) => {
                  const userName =
                    travelCtx.state.users.find((x) => x.userId === u.userId)?.userName || `#${u.userId}`;
                  return (
                    <div
                      key={u.userId}
                      style={{
                        border: '1px solid var(--rule-soft)',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 6,
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13 }}>{userName}</span>
                      <span className="ts-num" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                        ₹{Math.abs(u.amount).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>

        <AmountSplitDialog
          amount={formState.currencyAmounts}
          open={amountSetter}
          onSubmit={(items: SplitItem[]) => {
            const userDiv = items.map((item) => ({
              userId: item.userId,
              userName: item.userName,
              amount: item[enabledCurrency],
            }));
            setFormState((prev) => ({ ...prev, userDivision: userDiv }));
            setAmountSetter(false);
          }}
          onCancel={() => setAmountSetter(false)}
          editMode={editMode}
          editValues={formState.userDivision}
        />

        {/* Sticky footer — sits outside the scroll area so users always see
            Submit/Cancel even when the form is long. */}
        <div
          style={{
            flexShrink: 0,
            padding: isMobile ? '14px 18px 18px' : '16px 26px 22px',
            background: 'var(--paper-deep)',
            borderTop: '1px dashed var(--rule-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <button type="button" className="ts-btn" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="ts-btn ts-btn-ink"
            onClick={handleSubmit}
            disabled={!isSubmitEnabled}
          >
            {editMode ? 'File amendment ↗' : 'Record entry ↗'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export function round(value: any, precision: any) {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

export default ExpenseDialog;

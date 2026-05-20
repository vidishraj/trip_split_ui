import { Dialog } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { useTravel } from '../../../Contexts/TravelContext';
import { CurrencyContext } from '../../../Contexts/CurrencyContext';
import { currencies } from '../../../Assets/currencyData';
import { round } from './ExpenseDialog';
import { Perf } from '../../Design/Atoms';

interface User {
  userId: any;
  userName: any;
  isChecked: any;
  [key: string]: any;
}

interface AmountSplitDialogProps {
  amount: Record<string, any>;
  onSubmit: (users: any) => void;
  onCancel: () => void;
  open: boolean;
  editMode?: boolean;
  editValues?: { userId: string; amount: any }[];
}

export const AmountSplitDialog: React.FC<AmountSplitDialogProps> = ({
  amount,
  onSubmit,
  onCancel,
  open,
  editMode = false,
  editValues = [],
}) => {
  const travelCtx = useTravel();
  const currencyCtx = useContext(CurrencyContext);
  const users = travelCtx.state.users;

  // Deep clone so adding currency-keyed amount fields doesn't mutate
  // the shared travelCtx.state.users objects.
  const [checkedUsers, setCheckedUsers] = useState<User[]>(
    users.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      isChecked: true,
    })),
  );
  const [isEqual, setIsEqual] = useState(true);
  const [currentTotal, setCurrentTotal] = useState<Record<string, any>>(amount);
  const [selectedCurrency, setSelectedCurrency] = useState('inr');
  const [rawInputValues, setRawInputValues] = useState<Record<number, Record<string, string>>>({});
  const [submitStatus, setSubmitStatus] = useState(true);
  const [initialAmountSet, setInitialAmountSet] = useState(false);

  useEffect(() => {
    if (open) setInitialAmountSet(false);
  }, [open]);

  useEffect(() => {
    if (!initialAmountSet) {
      initializeValues(true);
      setInitialAmountSet(true);
    } else {
      initializeValues(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const initializeTotal = (a: Record<string, number>) =>
    Object.keys(a).reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {} as Record<string, number>);

  const balanceRemainder = (
    rawObj: Record<number, Record<string, string>>,
    usersObj: User[],
    total: Record<string, number>,
  ) => {
    Object.keys(amount).forEach((curr) => {
      const remainder = round(amount[curr] - total[curr], 1);
      if (remainder !== 0) {
        rawObj[0][curr] = (parseFloat(rawObj[0][curr]) + remainder).toString();
        usersObj[0][curr] += remainder;
      }
    });
  };

  const initializeValues = (useEditValues = false) => {
    const newCheckedUsers = [...checkedUsers];
    const newRawInputValues: Record<number, Record<string, string>> = {};
    let total = initializeTotal(amount);
    newCheckedUsers.forEach((user, index) => {
      newRawInputValues[index] = {};
      Object.keys(amount).forEach((curr) => {
        const value =
          useEditValues && editMode
            ? editValues.find((v) => v.userId === user.userId)?.amount ||
              round(amount[curr] / users.length, 1)
            : round(amount[curr] / users.length, 1);
        newRawInputValues[index][curr] = value.toString();
        newCheckedUsers[index][curr] = value;
        total[curr] += value;
      });
    });
    balanceRemainder(newRawInputValues, newCheckedUsers, total);
    setRawInputValues(newRawInputValues);
    setCheckedUsers(newCheckedUsers);
    calculateTotal();
  };

  const redistributeEqually = (newCheckedUsers: User[]) => {
    const checkedCount = newCheckedUsers.filter((u) => u.isChecked).length;
    if (checkedCount === 0) return;
    const newRawInputValues = { ...rawInputValues };
    let total = initializeTotal(amount);

    newCheckedUsers.forEach((user, index) => {
      if (user.isChecked) {
        Object.keys(amount).forEach((curr) => {
          const value = round(amount[curr] / checkedCount, 1);
          newRawInputValues[index][curr] = value.toString();
          newCheckedUsers[index][curr] = value;
          total[curr] += value;
        });
      } else {
        Object.keys(amount).forEach((curr) => {
          newRawInputValues[index][curr] = '0';
          newCheckedUsers[index][curr] = 0;
        });
      }
    });

    const checkedIndices = newCheckedUsers
      .map((u, i) => (u.isChecked ? i : -1))
      .filter((i) => i !== -1);
    if (checkedIndices.length > 0) {
      Object.keys(amount).forEach((curr) => {
        const remainder = round(amount[curr] - total[curr], 1);
        if (remainder !== 0) {
          const first = checkedIndices[0];
          newRawInputValues[first][curr] = (
            parseFloat(newRawInputValues[first][curr]) + remainder
          ).toString();
          newCheckedUsers[first][curr] += remainder;
        }
      });
    }
    setRawInputValues(newRawInputValues);
  };

  const checkSubmitDisabled = (currTotal: Record<string, string>) => {
    setSubmitStatus(
      !(parseFloat(amount[selectedCurrency]) === parseFloat(currTotal[selectedCurrency])),
    );
  };

  const handleEqualToggle = () => {
    if (!isEqual) redistributeEqually(checkedUsers);
    setIsEqual((prev) => !prev);
  };

  const handleCheckboxChange = (index: number) => {
    const newCheckedUsers = [...checkedUsers];
    newCheckedUsers[index].isChecked = !newCheckedUsers[index].isChecked;
    if (isEqual) {
      redistributeEqually(newCheckedUsers);
    } else {
      if (!newCheckedUsers[index].isChecked) {
        Object.keys(amount).forEach((curr) => {
          newCheckedUsers[index][curr] = 0;
        });
        const newRawInputValues = { ...rawInputValues };
        Object.keys(amount).forEach((curr) => {
          newRawInputValues[index][curr] = '0';
        });
        setRawInputValues(newRawInputValues);
      }
    }
    setCheckedUsers(newCheckedUsers);
    calculateTotal();
  };

  const calculateTotal = () => {
    const currTotal: any = initializeTotal(amount);
    checkedUsers.forEach((user) => {
      if (user.isChecked) {
        Object.keys(amount).forEach((curr) => {
          currTotal[curr] += user[curr];
        });
      }
    });
    Object.keys(currTotal).forEach((curr) => {
      currTotal[curr] = round(currTotal[curr], 1);
    });
    checkSubmitDisabled(currTotal);
    setCurrentTotal(currTotal);
  };

  const handleAmountChange = (index: number, inputValue: string) => {
    if (inputValue === '') {
      let emptyNewObj: any = rawInputValues;
      const newCheckedUsers = [...checkedUsers];
      Object.keys(amount).forEach((curr) => {
        emptyNewObj[index][curr] = '';
        newCheckedUsers[index][curr] = 0;
      });
      setCheckedUsers(newCheckedUsers);
      setRawInputValues(emptyNewObj);
    }
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue)) {
      const conversionRate = currencyCtx.state.currencies['inr'][selectedCurrency];
      const newValueInr = parsedValue / conversionRate;
      const newRawInputValues = { ...rawInputValues };
      const newCheckedUsers = [...checkedUsers];
      Object.keys(amount).forEach((curr) => {
        const convertedValue = round(
          newValueInr * currencyCtx.state.currencies['inr'][curr],
          1,
        );
        newRawInputValues[index][curr] = inputValue.endsWith('.')
          ? `${convertedValue}.`
          : convertedValue.toString();
        newCheckedUsers[index][curr] = convertedValue;
      });
      setRawInputValues(newRawInputValues);
      setCheckedUsers(newCheckedUsers);
    }
    calculateTotal();
  };

  const getCurrencySymbol = (abr: string) => {
    const m: Record<string, string> = { usd: '$', inr: '₹', eur: '€', gbp: '£', aud: 'A$', thb: '฿' };
    return m[abr] || '₹';
  };

  const difference =
    round((amount[selectedCurrency] || 0) - (currentTotal[selectedCurrency] || 0), 1);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '26px 28px' }}>
        <div className="ts-eyebrow">Apportionment</div>
        <h2
          className="ts-display"
          style={{ margin: '6px 0 14px', fontSize: 26, fontVariationSettings: '"SOFT" 30, "opsz" 144' }}
        >
          Divide among bearers.
        </h2>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 14,
            alignItems: 'flex-end',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" checked={isEqual} onChange={handleEqualToggle} />
            Equal split
          </label>

          <div>
            <div className="ts-label">View in</div>
            <select
              className="ts-input ts-mono"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              style={{ fontSize: 14, minWidth: 100 }}
            >
              {travelCtx.state.chosenTrip?.currencies.map((item, index) => (
                <option
                  key={index}
                  value={currencies.find((it) => it.label === item)?.abr}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Perf style={{ marginBottom: 12 }} />

        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {checkedUsers.map((user, index) => (
            <div
              key={user.userId}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 110px',
                gap: 12,
                alignItems: 'center',
                padding: '10px 4px',
                borderBottom: '1px dashed var(--rule-soft)',
              }}
            >
              <input
                type="checkbox"
                checked={user.isChecked}
                onChange={() => handleCheckboxChange(index)}
              />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>
                {user.userName}
              </div>
              <input
                type="text"
                className="ts-input ts-num"
                value={rawInputValues[index]?.[selectedCurrency] || ''}
                onChange={(e) => handleAmountChange(index, e.target.value)}
                disabled={isEqual || !user.isChecked}
                style={{ fontSize: 14, textAlign: 'right' }}
              />
            </div>
          ))}
        </div>

        {submitStatus && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              border: `1px solid ${difference === 0 ? 'var(--ledger)' : 'var(--stamp)'}`,
              color: difference === 0 ? 'var(--ledger)' : 'var(--stamp)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.06em',
            }}
          >
            {difference > 0
              ? `${getCurrencySymbol(selectedCurrency)}${difference} short of the total`
              : difference < 0
                ? `${getCurrencySymbol(selectedCurrency)}${Math.abs(difference)} over the total`
                : 'Apportionment balanced.'}
          </div>
        )}

        <Perf style={{ margin: '18px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <button className="ts-btn" onClick={onCancel}>Cancel</button>
          <button
            className="ts-btn ts-btn-ink"
            onClick={() => onSubmit(checkedUsers.filter((u) => u.isChecked))}
            disabled={submitStatus}
          >
            File apportionment ↗
          </button>
        </div>
      </div>
    </Dialog>
  );
};

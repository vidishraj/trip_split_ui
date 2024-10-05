import { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import { insertExpense, updateExpense } from '../../Api';
import { useTravel } from '../../Contexts/TravelContext';
import { AmountSplitDialog } from './AmountSplitDialog';
import { CurrencyContext } from '../../Contexts/CurrencyContext';
import { currencies } from '../Trip';
import { useMessage } from '../../Contexts/NotifContext';

interface ExpenseDialogProps {
  editMode?: boolean;
  editData?: any;
  open: boolean;
  onClose: () => void;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  open,
  onClose,
  editMode,
  editData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const { state: currencyState } = useContext(CurrencyContext);

  const [date, setDate] = useState(
    editMode && editData
      ? new Date(editData.date).toISOString().substr(0, 10)
      : new Date().toISOString().substr(0, 10)
  );
  const [description, setDescription] = useState(
    editMode && editData ? editData.expenseDesc : ''
  );
  const [currencyAmounts, setCurrencyAmounts] = useState<{
    [key: string]: number;
  }>({});
  const enabledCurrency = 'inr';
  const [paidBy, setPaidBy] = useState<any>(
    editMode && editData
      ? {
          userId: editData.paidBy,
          userName: travelCtx.state.users.find(
            (user) => user.userId === editData.paidBy
          )?.userName,
        }
      : { userId: undefined, userName: '' }
  );
  const [amountSetter, openAmountSetter] = useState(false);
  const [userDivision, setUserDivision] = useState<any>(undefined);
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  useEffect(() => {
    if (
      travelCtx.state.chosenTrip &&
      travelCtx.state.chosenTrip?.currencies?.length > 0
    ) {
      const curr = travelCtx.state.chosenTrip.currencies;
      const init: any = {};
      curr.forEach((cur: any) => {
        let abr = currencies.find((c) => c.label === cur)?.abr;
        if (abr) {
          init[abr] =
            editMode && editData
              ? round(editData.amount * currencyState.currencies['inr'][abr], 1)
              : 0;
        }
      });
      if (editMode) {
        let userDiv: any = [];
        Object.keys(editData['splitBetween']).forEach((userId) => {
          let userIdInt = parseInt(userId);
          if (userIdInt === paidBy.userId) {
            userDiv.push({
              userId: userIdInt,
              userName: '',
              amount: editData['amount'] - editData['splitBetween'][userIdInt],
            });
          } else {
            userDiv.push({
              userId: userIdInt,
              userName: '',
              amount: -1 * editData['splitBetween'][userIdInt],
            });
          }
        });
        setUserDivision([...userDiv]);
      }
      setCurrencyAmounts(init);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelCtx.state.chosenTrip, editMode, editData]);

  const handleCurrencyAmountChange = (currency: string, amount: number) => {
    let curr: any = Object.keys(currencyAmounts);
    let init = currencyAmounts;
    let abr: any = currencies.find((c) => c.label === currency)?.abr;
    let valInRs = round(amount / currencyState.currencies['inr'][abr], 1);
    curr.forEach((key: any) => {
      init[key] = round(valInRs * currencyState.currencies['inr'][key], 1);
    });
    setCurrencyAmounts((prev) => ({ ...prev, ...init }));
  };

  const handleSubmit = () => {
    const payload = {
      tripId: travelCtx?.state?.chosenTrip?.tripId,
      date,
      description,
      amount: currencyAmounts[enabledCurrency],
      paidBy: paidBy.userId,
      splitbw: userDivision.map((item: any) => ({
        userId: item.userId,
        amount: item.amount,
      })),
    };

    if (editMode) {
      updateExpense(editData.expenseId, payload)
        .then((response) => {
          if (response.data.Message) {
            setPayload({
              type: 'success',
              message: 'Expense updated successfully',
            });
          } else {
            setPayload({
              type: 'error',
              message: 'Failed to update',
            });
          }
        })
        .catch((error) => {
          setPayload({
            type: 'error',
            message: 'Failed to update.',
          });
          console.log(error);
        });
    } else {
      insertExpense(payload)
        .then((response) => {
          if (response.data.Message) {
            setPayload({
              type: 'success',
              message: 'Expense inserted successfully',
            });
          } else {
            setPayload({
              type: 'error',
              message: 'Failed to insert',
            });
          }
        })
        .catch((error) => {
          setPayload({
            type: 'error',
            message: 'Failed to insert.',
          });
          console.log(error);
        });
    }
    travelCtx.state.refreshData();
    onClose();
  };

  useEffect(() => {
    const isSplitEnabled =
      currencyAmounts[enabledCurrency] > 0 && paidBy.userId;
    let userDivisionSum: any = 0;
    if (Array.isArray(userDivision)) {
      userDivision.forEach((item) => {
        userDivisionSum += item.amount;
      });
    }
    userDivisionSum = round(userDivisionSum, 1);
    const originalPayload = editMode ? editData : {};
    const isFormComplete =
      date &&
      description &&
      currencyAmounts[enabledCurrency] > 0 &&
      paidBy.userId &&
      userDivisionSum === currencyAmounts[enabledCurrency];
    let splitChanged = false;
    if (editMode) {
      userDivision?.forEach((element: any) => {
        let userIdInt = parseInt(element.userId);
        let amount = null;
        if (userIdInt === paidBy.userId) {
          amount = editData['amount'] - editData['splitBetween'][userIdInt];
        } else {
          amount = -1 * editData['splitBetween'][userIdInt];
        }

        splitChanged = amount !== element.amount;
      });
    }
    const hasChanges =
      description !== originalPayload.expenseDesc ||
      new Date(date).toUTCString() !== originalPayload.date ||
      currencyAmounts['inr'] !== originalPayload.amount ||
      paidBy.userId !== originalPayload.paidBy ||
      splitChanged;

    setIsSubmitEnabled(
      editMode
        ? hasChanges && userDivisionSum === currencyAmounts[enabledCurrency]
        : !!isFormComplete
    );
    setIsSplitEnabled(!!isSplitEnabled);
  }, [
    date,
    description,
    currencyAmounts,
    enabledCurrency,
    paidBy,
    userDivision,
    editMode,
    editData,
  ]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent
        sx={{
          padding: isMobile ? '16px' : '24px',
          backgroundColor: '#f0f4f8',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          }}
        />

        <TextField
          label="Description"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          }}
        />

        {travelCtx.state.chosenTrip?.currencies.map((currency) => (
          <TextField
            key={currency}
            label={`Amount (${currency.toUpperCase()})`}
            type="number"
            fullWidth
            value={
              currencyAmounts[
                currencies.find((c) => c.label === currency)?.abr || ''
              ] || ''
            }
            onChange={(e) =>
              handleCurrencyAmountChange(currency, parseFloat(e.target.value))
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {currencies.find((it) => it.label === currency)?.icon}
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        ))}

        <TextField
          label="Paid By"
          select
          fullWidth
          value={paidBy.userId}
          onChange={(e) => {
            let selectedUser = travelCtx.state.users.find(
              (item) => item.userId === parseInt(e.target.value)
            );
            setPaidBy({
              userId: selectedUser?.userId,
              userName: selectedUser?.userName,
            });
          }}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {travelCtx.state.users.map((user) => (
            <MenuItem key={user.userId} value={user.userId}>
              {user.userName}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          fullWidth
          onClick={() => openAmountSetter(true)}
          disabled={!isSplitEnabled}
          sx={{
            padding: isMobile ? '10px' : '12px',
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#155a8a',
            },
          }}
        >
          Split Amount
        </Button>
        <AmountSplitDialog
          amount={currencyAmounts}
          open={amountSetter}
          onSubmit={(items: any) => {
            const userDiv: any[] = items.map((item: any) => ({
              userId: item.userId,
              userName: item.userName,
              amount: item.amount,
            }));
            console.log(userDiv);
            setUserDivision(userDiv);
            openAmountSetter(false);
          }}
          onCancel={() => openAmountSetter(false)}
          editMode={editMode}
          editValues={userDivision}
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!isSubmitEnabled}
        >
          {editMode ? 'Update' : 'Submit'}
        </Button>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export function round(value: any, precision: any) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
export default ExpenseDialog;

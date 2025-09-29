import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { insertExpense, updateExpense } from '../../../Api/Api';
import { useTravel } from '../../../Contexts/TravelContext';
import { AmountSplitDialog } from './AmountSplitDialog';
import { CurrencyContext } from '../../../Contexts/CurrencyContext';
import { currencies } from '../../../Assets/currencyData';
import { useMessage } from '../../../Contexts/NotifContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Calculate } from '@mui/icons-material';
import Calculator from '../../Calculator/Calculator';

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
  userDivision?: Array<{
    userId: any;
    userName: string;
    amount: number;
  }>;
}

interface SplitItem {
  userId: number;
  userName: string;
  [key: string]: any;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  onClose,
  editMode,
  editData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const { state: currencyState } = useContext(CurrencyContext);
  const [calcState, setCalcState] = useState(false);
  const [amountSetter, setAmountSetter] = useState(false);
  
  // Consolidate form state into a single object
  const [formState, setFormState] = useState<FormState>(() => {
    const initialState: FormState = {
      date: editMode && editData ? new Date(editData.date).toISOString().substr(0, 10) : new Date().toISOString().substr(0, 10),
      description: editMode && editData ? editData.expenseDesc : '',
      currencyAmounts: {},
      paidBy: editMode && editData ? {
        userId: editData.paidBy,
        userName: travelCtx.state.users.find(user => user.userId === editData.paidBy)?.userName || ''
      } : { userId: undefined, userName: '' },
      selfExpense: editMode && editData ? editData.selfExpense : false,
      userDivision: undefined
    };
      
    return initialState;
  });   
  // Memoize enabled currency
  const enabledCurrency = useMemo(() => 'inr', []);

  // Initialize currency amounts once when dialog opens or edit data changes
  useEffect(() => {
    const chosenTrip = travelCtx.state.chosenTrip;
    if (chosenTrip?.currencies && chosenTrip.currencies.length > 0) {
      const curr = chosenTrip.currencies;
      const init: { [key: string]: number } = {};
      
      curr.forEach((cur: string) => {
        const abr = currencies.find((c) => c.label === cur)?.abr;
        if (abr) {
          init[abr] = editMode && editData
            ? round(editData.amount * currencyState.currencies['inr'][abr], 1)
            : 0;
        }
      });

      // In edit mode, initialize user division
      if (editMode && editData) {
        const userDiv = Object.keys(editData.splitBetween).map(userId => {
          const userIdInt = parseInt(userId);
          const isPayingUser = userIdInt === editData.paidBy;
          return {
            userId: userIdInt,
            userName: '',
            amount: isPayingUser 
              ? editData.amount - editData.splitBetween[userIdInt]
              : -1 * editData.splitBetween[userIdInt]
          };
        });
        setFormState(prev => ({
          ...prev,
          description: editData.expenseDesc,
          date:  new Date(editData.date).toISOString().substr(0, 10),
          paidBy: {
            userId: editData.paidBy,
            userName: travelCtx.state.users.find(user => user.userId === editData.paidBy)?.userName || ''
          },
          selfExpense: editData.selfExpense,
          currencyAmounts: init,
          userDivision: userDiv
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          currencyAmounts: init
        }));
      }
    }
  }, [travelCtx.state.chosenTrip, travelCtx.state.users, editMode, editData, currencyState.currencies]);
  // Memoize currency amount change handler
  const handleCurrencyAmountChange = useCallback((currency: string, amount: number) => {
    const abr = currencies.find((c) => c.label === currency)?.abr;
    if (!abr) return;

    const valInRs = round(amount / currencyState.currencies['inr'][abr], 1);
    const newAmounts = Object.keys(formState.currencyAmounts).reduce((acc, key) => {
      acc[key] = round(valInRs * currencyState.currencies['inr'][key], 1);
      return acc;
    }, {} as { [key: string]: number });

    setFormState(prev => ({
      ...prev,
      currencyAmounts: newAmounts
    }));
  }, [formState.currencyAmounts, currencyState.currencies]);

  // Memoize submit handler
  const handleSubmit = useCallback(() => {
    const payload = {
      tripId: travelCtx?.state?.chosenTrip?.tripIdShared,
      date: formState.date,
      description: formState.description,
      amount: formState.currencyAmounts[enabledCurrency],
      paidBy: formState.paidBy.userId,
      splitbw: formState.userDivision?.map(item => ({
        userId: item.userId,
        amount: item.amount,
      })),
      selfExpense: formState.selfExpense,
    };

    const apiCall = editMode 
      ? () => updateExpense(editData.expenseId, payload)
      : () => insertExpense(payload);

    apiCall()
      .then(response => {
        if (response.data.Message) {
          setPayload({
            type: 'success',
            message: `Expense ${editMode ? 'updated' : 'inserted'} successfully`,
          });
          travelCtx.state.refreshData();
          onClose();
        } else {
          setPayload({
            type: 'error',
            message: `Failed to ${editMode ? 'update' : 'insert'}`,
          });
        }
      })
      .catch(error => {
        console.error(error);
        setPayload({
          type: 'error',
          message: `Failed to ${editMode ? 'update' : 'insert'}.`,
        });
      });
  }, [formState, editMode, editData?.expenseId, travelCtx, enabledCurrency, setPayload, onClose]);

  // Memoize form validation
  const isSubmitEnabled = useMemo(() => {
    const { date, description, currencyAmounts, paidBy, selfExpense, userDivision } = formState;
    const amount = currencyAmounts[enabledCurrency];

    let userDivisionSum = 0;
    if (Array.isArray(userDivision)) {
      userDivisionSum = userDivision.reduce((sum, item) => sum + item.amount, 0);
      userDivisionSum = round(userDivisionSum, 1);
    }

    const selfExpenseCheck = selfExpense
      ? amount > 0
      : userDivision && userDivision.length > 0 && userDivisionSum === amount;

    const isFormComplete = date && description && amount > 0 && paidBy.userId && selfExpenseCheck;

    if (!editMode) return isFormComplete;

    // Check for changes in edit mode
    const hasChanges = 
      description !== editData.expenseDesc ||
      new Date(date).toUTCString() !== editData.date ||
      currencyAmounts[enabledCurrency] !== editData.amount ||
      paidBy.userId !== editData.paidBy ||
      (userDivision?.some(element => {
        const userIdInt = parseInt(element.userId);
        const amount = userIdInt === editData.paidBy
          ? editData.amount - editData.splitBetween[userIdInt]
          : -1 * editData.splitBetween[userIdInt];
        return amount !== element.amount;
      }) ?? false);

    return hasChanges && isFormComplete;
  }, [formState, editMode, editData, enabledCurrency]);

  return (
    <Dialog 
      open={travelCtx.state.expenseDialogOpen} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
    >
      <DialogContent
        sx={{
          padding: isMobile ? '16px' : '24px',
          backgroundColor: '#f0f4f8',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: isMobile ? '12px' : '16px',
        }}
      >
        <IconButton 
          onClick={() => setCalcState(true)} 
          sx={{
            borderRadius: '50%',
            alignSelf: 'flex-end',
            border: 'grey 0.5px solid'
          }}
        >
          <Calculate />
        </IconButton>
        <Calculator isVisible={calcState} onClose={() => setCalcState(false)}/>

        <TextField
          label="Date"
          type="date"
          fullWidth
          value={formState.date}
          onChange={(e) => setFormState(prev => ({ ...prev, date: e.target.value }))}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            '& .MuiOutlinedInput-root': {
              height: '56px',
            },
          }}
        />

        <TextField
          label="Description"
          fullWidth
          variant="outlined"
          value={formState.description}
          onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            '& .MuiOutlinedInput-root': {
              minHeight: '56px',
            },
          }}
        />

        {travelCtx.state.chosenTrip?.currencies.map((currency) => (
          <TextField
            key={currency}
            label={`Amount (${currency.toUpperCase()})`}
            type="number"
            fullWidth
            value={formState.currencyAmounts[currencies.find((c) => c.label === currency)?.abr || ''] || ''}
            onChange={(e) => handleCurrencyAmountChange(currency, parseFloat(e.target.value))}
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
              '& .MuiOutlinedInput-root': {
                height: '56px',
              },
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            }}
          />
        ))}

        <TextField
          label="Paid By"
          select
          fullWidth
          value={formState.paidBy.userId?.toString() || ''}
          onChange={(e) => {
            const selectedUser = travelCtx.state.users.find(
              (item) => item.userId === parseInt(e.target.value)
            );
            setFormState(prev => ({
              ...prev,
              paidBy: {
                userId: selectedUser?.userId,
                userName: selectedUser?.userName || '',
              }
            }));
          }}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            '& .MuiOutlinedInput-root': {
              height: '56px',
            },
          }}
        >
          {travelCtx.state.users.map((user) => (
            <MenuItem key={user.userId} value={user.userId.toString()}>
              {user.userName}
            </MenuItem>
          ))}
        </TextField>

        <Box
          display="flex"
          justifyContent="space-evenly"
          width="100%"
          gap="5px"
        >
          <FormControlLabel
            sx={{ textWrap: 'nowrap' }}
            control={
              <Checkbox
                checked={formState.selfExpense}
                onChange={(_, checked) => {
                  setFormState(prev => {
                    const newState = { ...prev, selfExpense: checked };
                    if (checked && prev.paidBy.userId) {
                      newState.userDivision = [{
                        userId: prev.paidBy.userId,
                        userName: '',
                        amount: prev.currencyAmounts[enabledCurrency]
                      }];
                    }
                    return newState;
                  });
                }}
              />
            }
            label="Self-Expense"
          />
          <Button
            variant="contained"
            fullWidth
            onClick={() => setAmountSetter(true)}
            disabled={!formState.paidBy.userId || !formState.currencyAmounts[enabledCurrency] || formState.selfExpense}
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
        </Box>

        <AmountSplitDialog
          amount={formState.currencyAmounts}
          open={amountSetter}
          onSubmit={(items: SplitItem[]) => {
            const userDiv = items.map(item => ({
              userId: item.userId,
              userName: item.userName,
              amount: item[enabledCurrency],
            }));
            setFormState(prev => ({
              ...prev,
              userDivision: userDiv
            }));
            setAmountSetter(false);
          }}
          onCancel={() => setAmountSetter(false)}
          editMode={editMode}
          editValues={formState.userDivision}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', padding: '16px', gap: 2 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<CheckCircleIcon />}
          disabled={!isSubmitEnabled}
          sx={{
            backgroundColor: !isSubmitEnabled ? '#ccc' : '#1976d2',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: '600',
            '&:hover': {
              backgroundColor: !isSubmitEnabled ? '#ccc' : '#1565c0',
            },
          }}
        >
          {editMode ? 'Update' : 'Submit'}
        </Button>
        <Button 
          onClick={onClose} 
          variant="outlined"
          color="error"
          sx={{
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: '600',
          }}
        >
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

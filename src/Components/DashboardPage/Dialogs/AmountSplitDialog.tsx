import {
  Dialog,
  DialogContent,
  Switch,
  Divider,
  Box,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  Button,
  Stack,
  Select,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { useTravel } from '../../../Contexts/TravelContext';
import { CurrencyContext } from '../../../Contexts/CurrencyContext';
import { currencies } from '../../../Assets/currencyData';
import { round } from './ExpenseDialog';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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

  const [checkedUsers, setCheckedUsers] = useState<User[]>(
    users.map((user) => ({
      ...user,
      isChecked: true,
    }))
  );
  const [isEqual, setIsEqual] = useState(true);
  const [currentTotal, setCurrentTotal] = useState<Record<string, any>>(amount);
  const [selectedCurrency, setSelectedCurrency] = useState('inr');
  const [rawInputValues, setRawInputValues] = useState<
    Record<number, Record<string, string>>
  >({});
  const [submitStatus, setSubmitStatus] = useState(true);
  const [initialAmountSet, setInitialAmountSet] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setInitialAmountSet(false);
    }
  }, [open]);

  useEffect(() => {
    if (!initialAmountSet) {
      // First time opening - use edit values if available
      initializeValues(true);
      setInitialAmountSet(true);
    } else {
      // Amount changed after initialization - reset to equal distribution
      initializeValues(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const initializeValues = (useEditValues = false) => {
    const newCheckedUsers = [...checkedUsers];
    const newRawInputValues: Record<number, Record<string, string>> = {};
    let total = initializeTotal(amount);

    newCheckedUsers.forEach((user, index) => {
      newRawInputValues[index] = {};
      Object.keys(amount).forEach((curr) => {
        const value = useEditValues && editMode
          ? editValues.find((v) => v.userId === user.userId)?.amount || round(amount[curr] / users.length, 1)
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

  const initializeTotal = (amount: Record<string, number>) => {
    return Object.keys(amount).reduce(
      (acc, curr) => {
        acc[curr] = 0;
        return acc;
      },
      {} as Record<string, number>
    );
  };

  const balanceRemainder = (
    rawObj: Record<number, Record<string, string>>,
    usersObj: User[],
    total: Record<string, number>
  ) => {
    Object.keys(amount).forEach((curr, index) => {
      const remainder = round(amount[curr] - total[curr], 1);
      if (remainder !== 0) {
        rawObj[0][curr] = (parseFloat(rawObj[0][curr]) + remainder).toString();
        usersObj[0][curr] += remainder;
      }
    });
  };

  const redistributeEqually = (newCheckedUsers: User[]) => {
    const checkedCount = newCheckedUsers.filter(user => user.isChecked).length;
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
        // Zero out unchecked users
        Object.keys(amount).forEach((curr) => {
          newRawInputValues[index][curr] = '0';
          newCheckedUsers[index][curr] = 0;
        });
      }
    });

    // Balance any remainder among checked users
    const checkedIndices = newCheckedUsers
      .map((user, index) => user.isChecked ? index : -1)
      .filter(index => index !== -1);
    
    if (checkedIndices.length > 0) {
      Object.keys(amount).forEach((curr) => {
        const remainder = round(amount[curr] - total[curr], 1);
        if (remainder !== 0) {
          const firstCheckedIndex = checkedIndices[0];
          newRawInputValues[firstCheckedIndex][curr] = 
            (parseFloat(newRawInputValues[firstCheckedIndex][curr]) + remainder).toString();
          newCheckedUsers[firstCheckedIndex][curr] += remainder;
        }
      });
    }

    setRawInputValues(newRawInputValues);
  };

  const checkSubmitDisabled = (currTotal: Record<string, string>) => {
    setSubmitStatus(
      !(
        parseFloat(amount[selectedCurrency]) ===
        parseFloat(currTotal[selectedCurrency])
      )
    );
  };

  const handleEqualToggle = () => {
    if (!isEqual) {
      // When turning equal toggle ON, redistribute equally among checked users
      redistributeEqually(checkedUsers);
    }
    setIsEqual((prev) => !prev);
  };

  const handleCheckboxChange = (index: number) => {
    const newCheckedUsers = [...checkedUsers];
    newCheckedUsers[index].isChecked = !newCheckedUsers[index].isChecked;
    
    // If equal toggle is on, redistribute amounts equally among checked users
    if (isEqual) {
      redistributeEqually(newCheckedUsers);
    } else {
      // If not in equal mode, just zero out the unchecked user's amount
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
      const conversionRate =
        currencyCtx.state.currencies['inr'][selectedCurrency];
      const newValueInr = parsedValue / conversionRate;

      const newRawInputValues = { ...rawInputValues };
      const newCheckedUsers = [...checkedUsers];

      Object.keys(amount).forEach((curr) => {
        const convertedValue = round(
          newValueInr * currencyCtx.state.currencies['inr'][curr],
          1
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

  return (
    <Dialog open={open} onClose={onCancel} fullWidth>
      <DialogContent>
        <Box display={'flex'} justifyContent={'space-evenly'} gap={'25px'}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Switch checked={isEqual} onChange={handleEqualToggle} />
            <Typography variant="body1">Equal</Typography>
          </Stack>

          <Box marginBottom={2}>
            <Typography variant="caption" fontWeight="bold">
              Select Currency
            </Typography>
            <Select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              }
            >
              {travelCtx.state.chosenTrip?.currencies.map((item, index) => (
                <MenuItem
                  key={index}
                  value={currencies.find((it) => it.label === item)?.abr}
                >
                  {item}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        <Divider sx={{ marginBottom: 2 }} />

        {checkedUsers.map((user, index) => (
          <Stack
            key={user.userId}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Checkbox
              checked={user.isChecked}
              onChange={() => handleCheckboxChange(index)}
              icon={<PersonIcon />}
              checkedIcon={<CheckCircleIcon color="primary" />}
            />
            <Typography sx={{ flexGrow: 1 }}>{user.userName}</Typography>
            <TextField
              type="text"
              size="small"
              value={rawInputValues[index]?.[selectedCurrency] || ''}
              onChange={(e) => handleAmountChange(index, e.target.value)}
              disabled={isEqual || !user.isChecked}
              sx={{ width: '100px' }}
            />
          </Stack>
        ))}
        
        {/* Helper text for remaining amount */}
        {submitStatus && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: '#ffebee', 
              borderRadius: '8px',
              border: '1px solid #f44336'
            }}
          >
            <Typography 
              variant="caption" 
              color="error" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 500
              }}
            >
              {(() => {
                const totalAmount = amount[selectedCurrency] || 0;
                const currentAmount = currentTotal[selectedCurrency] || 0;
                const difference = round(totalAmount - currentAmount, 1);
                const getCurrencySymbol = (abr: string) => {
                  const symbolMap: Record<string, string> = {
                    'usd': '$',
                    'inr': '₹',
                    'eur': '€',
                    'gbp': '£',
                    'aud': 'A$',
                    'thb': '฿'
                  };
                  return symbolMap[abr] || '₹';
                };
                
                const currencySymbol = getCurrencySymbol(selectedCurrency);
                
                if (difference > 0) {
                  return `${currencySymbol}${difference} more needed to complete the split`;
                } else if (difference < 0) {
                  return `${currencySymbol}${Math.abs(difference)} over the total amount`;
                } else {
                  return 'Amount split correctly';
                }
              })()}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => onSubmit(checkedUsers.filter(user => user.isChecked))}
          color="primary"
          variant="contained"
          startIcon={<CheckCircleIcon />}
          disabled={submitStatus}
        >
          Submit
        </Button>
        <Button onClick={onCancel} color="error" startIcon={<CancelIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

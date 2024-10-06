import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Switch,
  Divider,
  Box,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  Button,
} from '@mui/material';
import { useState, useEffect, useContext, ChangeEvent } from 'react';
import { useTravel } from '../../Contexts/TravelContext';
import { CurrencyContext } from '../../Contexts/CurrencyContext';
import { currencies } from '../Trip';
import { round } from './ExpenseDialog';

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

  useEffect(() => {
    initializeValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const initializeValues = () => {
    const newCheckedUsers = [...checkedUsers];
    const newRawInputValues: Record<number, Record<string, string>> = {};
    let total = initializeTotal(amount);

    newCheckedUsers.forEach((user, index) => {
      newRawInputValues[index] = {};
      Object.keys(amount).forEach((curr) => {
        const value = editMode
          ? editValues.find((v) => v.userId === user.userId)?.amount || 0
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

  const checkSubmitDisabled = (currTotal: Record<string, string>) => {
    setSubmitStatus(
      !(
        parseFloat(amount[selectedCurrency]) ===
        parseFloat(currTotal[selectedCurrency])
      )
    );
  };

  const handleEqualToggle = () => {
    if (!isEqual) initializeValues();
    setIsEqual((prev) => !prev);
  };

  const handleCheckboxChange = (index: number) => {
    const newCheckedUsers = [...checkedUsers];
    newCheckedUsers[index].isChecked = !newCheckedUsers[index].isChecked;
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
      Object.keys(amount).forEach((curr) => {
        emptyNewObj[index][curr] = '';
      });
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

  const handleCurrencyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedCurrency(e.target.value);
    calculateTotal();
  };

  const handleSubmit = () => {
    const submissionData = checkedUsers.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      amount: user.isChecked ? user['inr'] : 0,
    }));

    onSubmit(submissionData);
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth>
      <DialogTitle>Distribute Amount</DialogTitle>

      <DialogContent>
        <FormControlLabel
          control={<Switch checked={isEqual} onChange={handleEqualToggle} />}
          label="Equal"
        />

        <Divider sx={{ marginY: 2 }} />

        <Box marginBottom={2}>
          <Typography variant="caption">Select Currency</Typography>
          <TextField
            select
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            SelectProps={{
              native: true,
            }}
            fullWidth
          >
            {travelCtx.state.chosenTrip?.currencies.map((item, index) => (
              <option
                key={index}
                value={currencies.find((it) => it.label === item)?.abr}
              >
                {item}
              </option>
            ))}
          </TextField>
        </Box>

        {checkedUsers.map((user, index) => (
          <Box
            key={user.userId}
            display="flex"
            alignItems="center"
            marginBottom={2}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.isChecked}
                  onChange={() => handleCheckboxChange(index)}
                />
              }
              label={user.userName}
              sx={{ flex: 1 }}
            />

            <TextField
              type="text"
              variant="outlined"
              size="small"
              value={
                rawInputValues[index] && rawInputValues[index][selectedCurrency]
                  ? rawInputValues[index][selectedCurrency]
                  : ''
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                if (!isEqual && inputValue.match(/^\d*\.?\d{0,1}$/)) {
                  console.log(inputValue);
                  handleAmountChange(index, inputValue);
                }
              }}
              onBlur={() => {
                if (!rawInputValues[index][selectedCurrency]) {
                  setRawInputValues((prev) => ({
                    ...prev,
                    [index]: { [selectedCurrency]: '0' },
                  }));
                  handleAmountChange(index, '0');
                }
              }}
              disabled={isEqual || !user.isChecked}
              slotProps={{
                htmlInput: {
                  inputMode: 'decimal',
                  pattern: '^d*.?d{0,1}$',
                },
              }}
              sx={{ width: '120px' }}
            />
          </Box>
        ))}

        {amount[selectedCurrency] !== currentTotal[selectedCurrency] && (
          <>
            <Typography color="error" variant="caption">
              The total amount should equal {selectedCurrency}{' '}
              {amount[selectedCurrency]}
            </Typography>
            <br />
            <Typography color="error" variant="caption">
              Remaining {selectedCurrency}{' '}
              {round(
                amount[selectedCurrency] - currentTotal[selectedCurrency],
                1
              )}
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={submitStatus}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

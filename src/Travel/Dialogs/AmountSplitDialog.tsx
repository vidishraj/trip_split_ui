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
import { useState, useEffect, useContext } from 'react';
import { useTravel } from '../../Contexts/TravelContext';
import { CurrencyContext } from '../../Contexts/CurrencyContext';
import { currencies } from '../Trip';
import { round } from './ExpenseDialog';

interface AmountSplitDialogProps {
  amount: any;
  onSubmit: any;
  onCancel: any;
  open: boolean;
  setUserDiv: any;
  editMode?: boolean;
  editValues?: [];
}

export const AmountSplitDialog: React.FC<AmountSplitDialogProps> = ({
  amount,
  onSubmit,
  onCancel,
  open,
  editMode,
  editValues,
}) => {
  const travelCtx = useTravel();
  const currencyCtx = useContext(CurrencyContext);
  const users = travelCtx.state.users;
  const [checkedUsers, setCheckedUsers] = useState<any>(
    users.map((user) => ({
      ...user,
      isChecked: true,
    }))
  );

  const [isEqual, setIsEqual] = useState(true);
  const [currentTotal, setCurrentTotal] = useState(amount);
  const [selectedCurrency, setSelectedCurrency] = useState('inr');
  const [rawInputValues, setRawInputValues] = useState<any>({});
  const [submitStatus, setSubmitStatus] = useState(true);

  useEffect(() => {
    let newObj = checkedUsers;
    let rawObj: any = {};
    checkedUsers.forEach((element: any, index: any) => {
      rawObj[index] = {};
    });
    if (!editMode) {
      newObj.forEach((item: any, index: any) => {
        Object.keys(amount).forEach((curr) => {
          rawObj[index][curr] = round(amount[curr] / users.length, 1);
          newObj[index][curr] = round(amount[curr] / users.length, 1);
        });
      });
    } else {
      newObj.forEach((item: any, index: any) => {
        let valAmount = editValues?.filter(
          (element) => element['userId'] === item['userId']
        )[0]['amount'];
        Object.keys(amount).forEach((curr) => {
          rawObj[index][curr] = valAmount;
          newObj[index][curr] = valAmount;
        });
      });
    }
    setRawInputValues({ ...rawObj });
    setCheckedUsers([...newObj]);
    calculateTotal(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  function checkSubmitDiabled(currTotal: any) {
    setSubmitStatus(
      !(
        parseFloat(amount[selectedCurrency]) ===
        parseFloat(currTotal[selectedCurrency])
      )
    );
  }

  const handleEqualToggle = () => {
    if (!isEqual) {
      let newObj = checkedUsers;
      let rawObj: any = rawInputValues;
      newObj.forEach((item: any, index: any) => {
        newObj[index]['isChecked'] = true;
        Object.keys(amount).forEach((curr) => {
          rawObj[index][curr] = round(amount[curr] / users.length, 1);
          newObj[index][curr] = round(amount[curr] / users.length, 1);
        });
      });
      setRawInputValues({ ...rawObj });
      setCheckedUsers([...newObj]);
    }
    setIsEqual(!isEqual);
    calculateTotal();
  };

  const handleCheckboxChange = (index: number) => {
    let currChecked = checkedUsers;
    currChecked[index]['isChecked'] = !currChecked[index]['isChecked'];
    setCheckedUsers([...currChecked]);
    calculateTotal();
  };

  const calculateTotal = () => {
    let currTotal: any = {};
    Object.keys(amount).forEach((curr) => {
      currTotal[curr] = 0;
    });
    checkedUsers.forEach((element: any) => {
      if (element['isChecked']) {
        Object.keys(amount).forEach((curr) => {
          currTotal[curr] += element[curr];
        });
      }
    });
    Object.keys(amount).forEach((curr) => {
      currTotal[curr] = round(currTotal[curr], 1);
    });
    checkSubmitDiabled(currTotal);
    setCurrentTotal((prev: any) => ({ ...prev, ...currTotal }));
  };

  const handleAmountChange = (index: number, inputValue: string) => {
    setRawInputValues((prev: any) => ({
      ...prev,
      [index]: { ...prev[index], [selectedCurrency]: inputValue },
    }));

    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue)) {
      let rawObj: any = rawInputValues;
      let conversionObj = currencyCtx.state.currencies['inr'];
      let newValueInr = parsedValue / conversionObj[selectedCurrency];
      let currChecked = checkedUsers;
      Object.keys(amount).forEach((curr) => {
        rawObj[index][curr] = inputValue.endsWith('.')
          ? round(newValueInr * conversionObj[curr], 1).toString() + '.'
          : round(newValueInr * conversionObj[curr], 1);
        currChecked[index][curr] = round(newValueInr * conversionObj[curr], 1);
      });
      setRawInputValues({ ...rawObj });
      setCheckedUsers([...currChecked]);
    }
    calculateTotal();
  };

  const handleCurrencyChange = (e: any) => {
    setSelectedCurrency(e.target.value);
    calculateTotal();
  };

  const handleSubmit = () => {
    let item: any = [];
    checkedUsers.forEach((element: any, index: number) => {
      if (element.isChecked) {
        item.push({
          userId: element.userId,
          userName: element.userName,
          amount: element['inr'],
        });
      } else {
        item.push({
          userId: element.userId,
          userName: element.userName,
          amount: 0,
        });
      }
    });
    onSubmit(item);
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

        {checkedUsers.map((user: any, index: any) => (
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
                  handleAmountChange(index, inputValue);
                }
              }}
              onBlur={() => {
                if (!rawInputValues[index][selectedCurrency]) {
                  setRawInputValues((prev: any) => ({
                    ...prev,
                    [index]: {
                      [selectedCurrency]: '0',
                    },
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

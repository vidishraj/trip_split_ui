import React, { useState } from 'react';
import { Box, Button, ClickAwayListener, Tooltip, styled, tooltipClasses } from '@mui/material';
import { People, AttachMoney, CurrencyExchange, Notes, Calculate, Grid3x3 } from '@mui/icons-material';
import { useTravel } from '../../Contexts/TravelContext';

interface ActionButtonGroupsProps {
  isMobile: boolean;
  userCount: number;
  onToggleExpenses: () => void;
  onToggleBalances: () => void;
  onOpenNameList: () => void;
  onOpenCurrencyDialog: () => void;
  onOpenExpenseDialog: () => void;
  onOpenUserDialog: () => void;
  onOpenNotes: () => void;
  onOpenCalculator: () => void;
}
const CustomTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#1976d2',
    color: '#fff',
    fontSize: '0.9rem',
    padding: '10px 14px',
    borderRadius: '8px',
    boxShadow: '0px 3px 12px rgba(0,0,0,0.2)',
    fontWeight: 500,
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 1.4,
  },
}));

const ActionButtonGroups: React.FC<ActionButtonGroupsProps> = ({
  isMobile,
  userCount,
  onToggleExpenses,
  onToggleBalances,
  onOpenNameList,
  onOpenCurrencyDialog,
  onOpenExpenseDialog,
  onOpenUserDialog,
  onOpenNotes,
  onOpenCalculator
}) => {

  const buttonStylesSmall = {
    flexBasis: '40%',
    bgcolor: '#fff',
    color: '#1976d2',
    maxWidth: isMobile?'100px':'100%',
    fontSize: isMobile?'10px':'',
    borderRadius: '8px',
    boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
    margin: '0 4px',
    textTransform: 'none',
    '&:hover': { backgroundColor: '#e3f2fd' },
  };

  const mainButtonStylesSmall = {
    flexBasis: '40%',
    maxWidth: isMobile?'110px':'100%',
    fontSize: isMobile?'10px':'',
    backgroundColor: '#1976d2',
    color: '#fff',
    borderRadius: '8px',
    margin: '0 4px',
    boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
    textTransform: 'none',
    '&:hover': { backgroundColor: '#1565c0' },
  };
  const travelCtx = useTravel();

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipClick = () => {
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, 2500);
  };


  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };
  return (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" padding={"1rem"}>
      {/* Left side: main action buttons */}
      <Box flexGrow={1}>
        {/* Group 1: Spendings and See Balances */}
        <Box display="flex" justifyContent="center" mb={1}>
          <Button
            variant="outlined"
            startIcon={<AttachMoney />}
            onClick={onToggleExpenses}
            sx={buttonStylesSmall}
          >
              See Expenses
          </Button>
          <Button
            variant="outlined"
            startIcon={<AttachMoney />}
            onClick={onToggleBalances}
            sx={buttonStylesSmall}
          >
              See Balances
          </Button>
          <ClickAwayListener onClickAway={handleTooltipClose}>

              <CustomTooltip
                title="Share this Id with your friends to add them to the trip!"
                placement="top"
                open={tooltipOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <Button
                  variant="outlined"
                  startIcon={<Grid3x3 />}
                  sx={buttonStylesSmall}
                  onClick={handleTooltipClick}
                >
                  {travelCtx.state.chosenTrip?.tripIdShared}
                </Button>
              </CustomTooltip>

          </ClickAwayListener>


        </Box>

        {/* Group 2: Users and Rates */}
        <Box display="flex" justifyContent="center" mb={1}>
          <Button
            variant="outlined"
            startIcon={<People />}
            onClick={onOpenNameList}
            sx={buttonStylesSmall}
          >
              {userCount} Users
          </Button>
          <Button
            variant="outlined"
            startIcon={<CurrencyExchange />}
            onClick={onOpenCurrencyDialog}
            sx={buttonStylesSmall}
          >
              Rates
          </Button>
          <Button
            variant="outlined"
            startIcon={<Notes />}
            onClick={onOpenNotes}
            sx={buttonStylesSmall }
          >
          Notes
          </Button>
        </Box>

        {/* Group 3: Add Expense and Add User */}
        <Box display="flex" justifyContent="center" mb={1}>
          <Button
            variant="contained"
            startIcon={<AttachMoney />}
            sx={mainButtonStylesSmall}
            onClick={onOpenExpenseDialog}
          >
            Add Expense
          </Button>
          <Button
            variant="contained"
            startIcon={<People />}
            sx={mainButtonStylesSmall}
            onClick={onOpenUserDialog}
          >
            Add User
          </Button>
          <Button
            variant="contained"
            startIcon={<Calculate />}
            onClick={onOpenCalculator}
            sx={{
              ...mainButtonStylesSmall,
              zIndex: travelCtx.state.expenseDialogOpen || tooltipOpen?0:9999, // max z-index to always be clickable
              position: 'relative',
            }}
          >
            Calculator
          </Button>
        </Box>
      </Box>

      {/* Right side: Notes and Calculator */}
      {/* Trip ID Display */}
    </Box>
  );
};


export default ActionButtonGroups;

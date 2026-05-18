// Dashboard.tsx — The active ledger
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme, useMediaQuery } from '@mui/material';
import { useTravel } from '../Contexts/TravelContext';
import { fetchTripRequestsForTrip } from '../Api/Api';
import { useMessage } from '../Contexts/NotifContext';
import ActionButtonGroups from '../Components/DashboardPage/ActionButtonGroups';
import DynamicContentContainer from '../Components/DashboardPage/DynamicContentContainer';
import DashboardDialogs from '../Components/DashboardPage/DashboardDialogs';
import NotesModal from '../Components/DashboardPage/Dialogs/NotesDialog';
import Calculator from '../Components/Calculator/Calculator';
import ChatDialog from '../Components/Chat/ChatDialog';
import { Perf, Stamp } from '../Components/Design/Atoms';

interface ActionProps {
  refreshData: () => void;
}

const Dashboard: React.FC<ActionProps> = ({ refreshData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const travelCtx = useTravel();
  const { setPayload } = useMessage();

  const [nameListOpen, setNameListOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [calcDialogOpen, setCalcDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [activeContainer, setActiveContainer] = useState<'expenses' | 'balances'>(
    'expenses',
  );

  useEffect(() => {
    if (travelCtx.state.chosenTrip?.tripIdShared) {
      fetchTripRequestsForTrip(travelCtx.state.chosenTrip?.tripIdShared)
        .then((response) => {
          if (Array.isArray(response.data.Message)) {
            travelCtx.dispatch({ type: 'SET_TRIP_REQ', payload: response.data.Message });
          }
        })
        .catch(() =>
          setPayload({ type: 'error', message: 'Could not fetch user requests' }),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelCtx.state.chosenTrip]);

  const handleOpenUserDialog = () => setUserDialogOpen(true);
  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
    setUsername('');
  };

  const handleOpenExpenseDialog = () => {
    travelCtx.dispatch({ type: 'SET_SELECTED_EXPENSE', payload: null });
    travelCtx.dispatch({ type: 'SET_EXPENSE_DIALOG_STATE', payload: true });
  };

  const handleLeaveTrip = () => {
    travelCtx.dispatch({ type: 'SET_CHOSEN_TRIP', payload: undefined });
  };

  const trip = travelCtx.state.chosenTrip;
  const userCount = travelCtx?.state?.summary?.userCount ?? 0;
  const expenseCount = (travelCtx.state.expenses || []).length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 18px 80px', position: 'relative' }}>
      {/* Trip banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="ts-paper"
        style={{
          padding: isMobile ? '16px 18px' : '22px 28px',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* corner stamp */}
        <div style={{ position: 'absolute', right: 18, top: 18, pointerEvents: 'none' }}>
          {!isMobile && (
            <Stamp
              text="In Transit"
              date={(trip?.tripIdShared || '').toUpperCase()}
              tone="stamp"
              size={86}
              rotate={-10}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="ts-btn" onClick={handleLeaveTrip} style={{ padding: '6px 12px', fontSize: 10 }}>
            ← Back
          </button>
          <span className="ts-eyebrow">Active itinerary</span>
        </div>

        <h2
          className="ts-display"
          style={{
            margin: '10px 0 8px',
            fontSize: isMobile ? 30 : 44,
            fontVariationSettings: '"SOFT" 30, "WONK" 1, "opsz" 144',
            paddingRight: isMobile ? 0 : 110,
            lineHeight: 1,
          }}
        >
          {trip?.tripTitle || 'Untitled trip'}
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px 22px',
            alignItems: 'baseline',
            paddingRight: isMobile ? 0 : 110,
          }}
        >
          <div>
            <span className="ts-label">Trip ID&nbsp;·&nbsp;</span>
            <span className="ts-mono" style={{ letterSpacing: '0.16em', fontSize: 13 }}>
              {trip?.tripIdShared}
            </span>
          </div>
          <div>
            <span className="ts-label">Members&nbsp;·&nbsp;</span>
            <span className="ts-mono" style={{ fontSize: 13 }}>{userCount}</span>
          </div>
          <div>
            <span className="ts-label">Entries&nbsp;·&nbsp;</span>
            <span className="ts-mono" style={{ fontSize: 13 }}>{expenseCount}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(trip?.currencies || []).map((c: string) => (
              <span
                key={c}
                className="ts-mono"
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  border: '1px solid var(--rule-soft)',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <ActionButtonGroups
        isMobile={isMobile}
        userCount={userCount}
        active={activeContainer}
        onToggleExpenses={() => setActiveContainer('expenses')}
        onToggleBalances={() => setActiveContainer('balances')}
        onOpenNameList={() => setNameListOpen(true)}
        onOpenCurrencyDialog={() => setCurrencyDialogOpen(true)}
        onOpenExpenseDialog={handleOpenExpenseDialog}
        onOpenUserDialog={handleOpenUserDialog}
        onOpenNotes={() => setNotesDialogOpen(true)}
        onOpenCalculator={() => setCalcDialogOpen(!calcDialogOpen)}
      />

      <Perf style={{ margin: '20px 0' }} />

      {/* Content */}
      <DynamicContentContainer
        showExpenseContainer={activeContainer === 'expenses'}
        showBalancesContainer={activeContainer === 'balances'}
        onCloseExpenseDialog={() => {
          travelCtx.dispatch({ type: 'SET_EXPENSE_DIALOG_STATE', payload: false });
        }}
      />

      <Calculator isVisible={calcDialogOpen} onClose={() => setCalcDialogOpen(false)} />

      <DashboardDialogs
        userDialogOpen={userDialogOpen}
        username={username}
        setUsername={setUsername}
        onCloseUserDialog={handleCloseUserDialog}
        onSubmitUser={() => {
          refreshData();
          handleCloseUserDialog();
        }}
        currencyDialogOpen={currencyDialogOpen}
        onCloseCurrencyDialog={() => setCurrencyDialogOpen(false)}
        nameListOpen={nameListOpen}
        onCloseNameList={() => setNameListOpen(false)}
        refreshData={refreshData}
        travelCtx={travelCtx}
      />
      <NotesModal open={notesDialogOpen} onClose={() => setNotesDialogOpen(false)} />

      <ChatDialog open={chatOpen} onClose={() => setChatOpen(false)} />
      <motion.button
        type="button"
        onClick={() => setChatOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Trip assistant"
        style={{
          position: 'fixed',
          right: isMobile ? 18 : 28,
          bottom: isMobile ? 18 : 28,
          width: 64,
          height: 64,
          borderRadius: 999,
          border: '2px solid var(--ink)',
          background: 'var(--ink)',
          color: 'var(--paper)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontSize: 10,
          fontWeight: 700,
          boxShadow: '0 12px 28px -10px rgba(20,17,13,0.5)',
          cursor: 'pointer',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.05,
        }}
      >
        <span style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: 0 }}>✦</span>
        <span style={{ marginTop: 2 }}>Ask</span>
      </motion.button>
    </div>
  );
};

export default Dashboard;

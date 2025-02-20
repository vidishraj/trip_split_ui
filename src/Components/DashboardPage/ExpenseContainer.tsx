// ExpenseContainer.tsx
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useTravel } from '../../Contexts/TravelContext';
import './ExpenseContainer.scss';
import ExpenseList from './ExpenseContainer/ExpenseList';
import EmptyExpenseState from './ExpenseContainer/EmptyState';
import { motion, useScroll } from 'framer-motion';

const ExpenseContainer = () => {
  const travelCtx = useTravel();
  useEffect(() => {
    fetchMoreData();
  }, []);

  const fetchMoreData = () => {
    // Implementation here
  };

  const sortedExpenses = travelCtx.state.expenses.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const scrollRef: any = useRef();
  const { scrollYProgress } = useScroll({
    container: scrollRef,
    offset: ['start end', 'end end'],
  });

  return (
    <Box
      id="innerBox"
      flexGrow={1}
      width="100%"
      borderRadius="12px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <motion.div
        id="scroll-indicator"
        style={{
          scaleX: scrollYProgress,
          position: 'absolute',
          zIndex: 2,
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          originX: 0,
          backgroundColor: '#1976d2',
        }}
      />
      {sortedExpenses && sortedExpenses.length > 0 ? (
        <div
          ref={scrollRef}
          style={{ height: '100%', width: '100%', overflow: 'auto' }}
        >
          <ExpenseList expenses={sortedExpenses} />
        </div>
      ) : (
        <EmptyExpenseState />
      )}
    </Box>
  );
};

export default ExpenseContainer;

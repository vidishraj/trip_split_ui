// ExpenseContainer.tsx
import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTravel } from '../../Contexts/TravelContext';
import './ExpenseContainer.scss';
import ExpenseList from './ExpenseContainer/ExpenseList';
import EmptyExpenseState from './ExpenseContainer/EmptyState';

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
        overflow: 'auto',
      }}
    >
      {sortedExpenses && sortedExpenses.length > 0 ? (
        <InfiniteScroll
          dataLength={sortedExpenses.length}
          next={fetchMoreData}
          hasMore={false}
          loader={
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          }
          endMessage={
            <Typography
              variant="body2"
              color="textSecondary"
              textAlign="center"
            >
              You have seen it all!
            </Typography>
          }
          height={'80%'}
          scrollableTarget={'parentBox'}
          style={{ width: '100%' }}
        >
          <ExpenseList expenses={sortedExpenses} />
        </InfiniteScroll>
      ) : (
        <EmptyExpenseState />
      )}
    </Box>
  );
};

export default ExpenseContainer;
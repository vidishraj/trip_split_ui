// ExpenseContainer.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { useTravel } from '../../Contexts/TravelContext';
import './ExpenseContainer.scss';
import ExpenseList from './ExpenseContainer/ExpenseList';
import EmptyExpenseState from './ExpenseContainer/EmptyState';
import FilterSortPanel, { FilterOptions, SortOptions } from './ExpenseContainer/FilterSortPanel';
import { motion, useScroll } from 'framer-motion';

const ExpenseContainer = () => {
  const travelCtx = useTravel();
  
  const [filters, setFilters] = useState<FilterOptions>({
    paidBy: '',
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: '',
    selfExpenseOnly: false,
    sharedExpenseOnly: false,
    description: ''
  });

  const [sort, setSort] = useState<SortOptions>({
    field: 'date',
    direction: 'desc'
  });

  useEffect(() => {
    fetchMoreData();
  }, []);

  const fetchMoreData = () => {
    // Implementation here
  };

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...travelCtx.state.expenses];

    // Apply filters
    if (filters.paidBy !== '') {
      filtered = filtered.filter(expense => expense.paidBy === filters.paidBy);
    }

    if (filters.minAmount !== '') {
      filtered = filtered.filter(expense => expense.amount >= filters.minAmount);
    }

    if (filters.maxAmount !== '') {
      filtered = filtered.filter(expense => expense.amount <= filters.maxAmount);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) <= new Date(filters.dateTo)
      );
    }

    if (filters.selfExpenseOnly) {
      filtered = filtered.filter(expense => expense.selfExpense === true);
    }

    if (filters.sharedExpenseOnly) {
      filtered = filtered.filter(expense => expense.selfExpense === false);
    }

    if (filters.description) {
      filtered = filtered.filter(expense => 
        expense.expenseDesc.toLowerCase().includes(filters.description.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      let aValue, bValue;

      switch (sort.field) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.expenseDesc.toLowerCase();
          bValue = b.expenseDesc.toLowerCase();
          break;
        case 'paidBy':
          const userA = travelCtx.state.users.find(u => u.userId === a.paidBy);
          const userB = travelCtx.state.users.find(u => u.userId === b.paidBy);
          aValue = userA?.userName.toLowerCase() || '';
          bValue = userB?.userName.toLowerCase() || '';
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [travelCtx.state.expenses, travelCtx.state.users, filters, sort]);
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
      flexDirection="column"
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        position: 'relative',
      }}
    >
      <FilterSortPanel
        onFilterChange={setFilters}
        onSortChange={setSort}
        currentFilters={filters}
        currentSort={sort}
      />
      
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
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
        {filteredAndSortedExpenses && filteredAndSortedExpenses.length > 0 ? (
          <div
            ref={scrollRef}
            style={{ height: '100%', width: '100%', overflow: 'auto' }}
          >
            <ExpenseList expenses={filteredAndSortedExpenses} />
          </div>
        ) : (
          <EmptyExpenseState />
        )}
      </Box>
    </Box>
  );
};

export default ExpenseContainer;

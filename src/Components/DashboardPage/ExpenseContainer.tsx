// ExpenseContainer.tsx — The ledger view
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTravel } from '../../Contexts/TravelContext';
import ExpenseList from './ExpenseContainer/ExpenseList';
import EmptyExpenseState from './ExpenseContainer/EmptyState';
import FilterSortPanel, {
  FilterOptions,
  SortOptions,
} from './ExpenseContainer/FilterSortPanel';

const ExpenseContainer: React.FC = () => {
  const travelCtx = useTravel();

  const [filters, setFilters] = useState<FilterOptions>({
    paidBy: '',
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: '',
    selfExpenseOnly: false,
    sharedExpenseOnly: false,
    description: '',
  });

  const [sort, setSort] = useState<SortOptions>({
    field: 'date',
    direction: 'desc',
  });

  const expenses = useMemo(() => {
    let filtered = [...(travelCtx.state.expenses || [])];
    if (filters.paidBy !== '')
      filtered = filtered.filter((e) => e.paidBy === filters.paidBy);
    if (filters.minAmount !== '')
      filtered = filtered.filter((e) => e.amount >= filters.minAmount);
    if (filters.maxAmount !== '')
      filtered = filtered.filter((e) => e.amount <= filters.maxAmount);
    if (filters.dateFrom)
      filtered = filtered.filter(
        (e) => new Date(e.date) >= new Date(filters.dateFrom),
      );
    if (filters.dateTo)
      filtered = filtered.filter(
        (e) => new Date(e.date) <= new Date(filters.dateTo),
      );
    if (filters.selfExpenseOnly)
      filtered = filtered.filter((e) => e.selfExpense === true);
    if (filters.sharedExpenseOnly)
      filtered = filtered.filter((e) => e.selfExpense === false);
    if (filters.description)
      filtered = filtered.filter((e) =>
        e.expenseDesc.toLowerCase().includes(filters.description.toLowerCase()),
      );

    filtered.sort((a: any, b: any) => {
      let aValue: any, bValue: any;
      switch (sort.field) {
        case 'amount':
          aValue = a.amount; bValue = b.amount; break;
        case 'description':
          aValue = a.expenseDesc.toLowerCase(); bValue = b.expenseDesc.toLowerCase(); break;
        case 'paidBy': {
          const uA = travelCtx.state.users.find((u) => u.userId === a.paidBy);
          const uB = travelCtx.state.users.find((u) => u.userId === b.paidBy);
          aValue = uA?.userName.toLowerCase() || '';
          bValue = uB?.userName.toLowerCase() || '';
          break;
        }
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      if (sort.direction === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    return filtered;
  }, [travelCtx.state.expenses, travelCtx.state.users, filters, sort]);

  return (
    <motion.div
      key="ledger"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="ts-paper"
      style={{ padding: 0, position: 'relative', overflow: 'hidden' }}
    >
      {/* Ledger heading band */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '20px 24px 6px',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="ts-eyebrow">Folio II</div>
          <h3
            className="ts-display"
            style={{
              margin: '6px 0 0',
              fontSize: 28,
              fontVariationSettings: '"SOFT" 30, "opsz" 144',
            }}
          >
            The ledger.
          </h3>
        </div>
        <div className="ts-mono" style={{ fontSize: 12, color: 'var(--ink-faded)', letterSpacing: '0.18em' }}>
          {expenses.length.toString().padStart(3, '0')} entries on file
        </div>
      </div>

      <div style={{ padding: '0 24px 16px' }}>
        <FilterSortPanel
          onFilterChange={setFilters}
          onSortChange={setSort}
          currentFilters={filters}
          currentSort={sort}
        />
      </div>

      {/* Column header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '92px 1fr auto',
          gap: 18,
          padding: '8px 24px',
          background: 'var(--paper-deep)',
          borderTop: '1px solid var(--rule-soft)',
          borderBottom: '1px solid var(--rule-soft)',
        }}
      >
        <div className="ts-label">Date</div>
        <div className="ts-label">Description / Paid by</div>
        <div className="ts-label" style={{ textAlign: 'right' }}>Amount · INR</div>
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 560, overflowY: 'auto', padding: '0 8px' }}>
        {expenses.length > 0 ? (
          <ExpenseList expenses={expenses} />
        ) : (
          <EmptyExpenseState />
        )}
      </div>
    </motion.div>
  );
};

export default ExpenseContainer;

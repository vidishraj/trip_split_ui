import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useTravel } from '../../../Contexts/TravelContext';

export interface FilterOptions {
  paidBy: number | '';
  minAmount: number | '';
  maxAmount: number | '';
  dateFrom: string;
  dateTo: string;
  selfExpenseOnly: boolean;
  sharedExpenseOnly: boolean;
  description: string;
}

export interface SortOptions {
  field: 'date' | 'amount' | 'description' | 'paidBy';
  direction: 'asc' | 'desc';
}

interface FilterSortPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOptions) => void;
  currentFilters: FilterOptions;
  currentSort: SortOptions;
}

const FilterSortPanel: React.FC<FilterSortPanelProps> = ({
  onFilterChange,
  onSortChange,
  currentFilters,
  currentSort
}) => {
  const { state } = useTravel();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);
  const [tempSort, setTempSort] = useState<SortOptions>(currentSort);

  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilters.paidBy !== '') count++;
    if (currentFilters.minAmount !== '' || currentFilters.maxAmount !== '') count++;
    if (currentFilters.dateFrom || currentFilters.dateTo) count++;
    if (currentFilters.selfExpenseOnly || currentFilters.sharedExpenseOnly) count++;
    if (currentFilters.description) count++;
    return count;
  };

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setFilterDialogOpen(false);
  };

  const handleApplySort = () => {
    onSortChange(tempSort);
    setSortDialogOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      paidBy: '',
      minAmount: '',
      maxAmount: '',
      dateFrom: '',
      dateTo: '',
      selfExpenseOnly: false,
      sharedExpenseOnly: false,
      description: ''
    };
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setFilterDialogOpen(false);
  };

  const getSortLabel = () => {
    const fieldLabels = {
      date: 'Date',
      amount: 'Amount',
      description: 'Description',
      paidBy: 'Paid By'
    };
    const directionLabels = {
      asc: currentSort.field === 'date' ? 'Oldest First' : 'Low to High',
      desc: currentSort.field === 'date' ? 'Newest First' : 'High to Low'
    };
    return `${fieldLabels[currentSort.field]} (${directionLabels[currentSort.direction]})`;
  };

  const buttonStyles = {
    borderRadius: '8px',
    boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
    textTransform: 'none',
    fontSize: isMobile ? '10px' : '14px',
    minWidth: isMobile ? '60px' : '80px',
    height: isMobile ? '32px' : '36px',
    '&:hover': { 
      backgroundColor: getActiveFilterCount() > 0 ? '#1565c0' : '#e3f2fd' 
    },
  };

  const searchFieldStyles = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  };

  return (
    <Box 
      display="flex" 
      gap={isMobile ? 0.5 : 1} 
      alignItems="center" 
      p={isMobile ? '8px 12px' : '12px 16px'}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        margin: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Quick Search */}
      <TextField
        size="small"
        placeholder={isMobile ? "Search..." : "Search expenses..."}
        value={currentFilters.description}
        onChange={(e) => onFilterChange({ ...currentFilters, description: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize={isMobile ? "small" : "medium"} />
            </InputAdornment>
          ),
          endAdornment: currentFilters.description ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onFilterChange({ ...currentFilters, description: '' })}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
        sx={{
          ...searchFieldStyles,
          minWidth: isMobile ? '120px' : '200px',
          flexGrow: 1,
          maxWidth: isMobile ? '150px' : '300px',
        }}
      />

      {/* Filter Button */}
      <Button
        variant={getActiveFilterCount() > 0 ? "contained" : "outlined"}
        startIcon={!isMobile && <FilterIcon />}
        onClick={() => {
          setTempFilters(currentFilters);
          setFilterDialogOpen(true);
        }}
        color={getActiveFilterCount() > 0 ? "primary" : "inherit"}
        sx={{
          ...buttonStyles,
          backgroundColor: getActiveFilterCount() > 0 ? '#1976d2' : '#fff',
          color: getActiveFilterCount() > 0 ? '#fff' : '#1976d2',
          border: getActiveFilterCount() > 0 ? 'none' : '1px solid #1976d2',
        }}
      >
        {isMobile ? <FilterIcon fontSize="small" /> : 'Filter'}
        {getActiveFilterCount() > 0 && !isMobile && (
          <Chip
            label={getActiveFilterCount()}
            size="small"
            sx={{ 
              ml: 1, 
              height: 18, 
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff'
            }}
          />
        )}
        {getActiveFilterCount() > 0 && isMobile && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#f44336',
              color: '#fff',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getActiveFilterCount()}
          </Box>
        )}
      </Button>

      {/* Sort Button */}
      <Button
        variant="outlined"
        startIcon={!isMobile && <SortIcon />}
        onClick={() => {
          setTempSort(currentSort);
          setSortDialogOpen(true);
        }}
        sx={{
          ...buttonStyles,
          backgroundColor: '#fff',
          color: '#1976d2',
          border: '1px solid #1976d2',
        }}
      >
        {isMobile ? <SortIcon fontSize="small" /> : 'Sort'}
      </Button>

      {/* Filter Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f0f4f8',
          borderRadius: isMobile ? '0' : '12px 12px 0 0',
          textAlign: 'center',
          fontWeight: 600
        }}>
          Filter Expenses
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: '#f0f4f8',
          padding: isMobile ? '16px' : '24px',
        }}>
          <Stack spacing={isMobile ? 2 : 3} sx={{ mt: 1 }}>
            {/* Paid By Filter */}
            <FormControl fullWidth>
              <InputLabel>Paid By</InputLabel>
              <Select
                value={tempFilters.paidBy}
                label="Paid By"
                onChange={(e) => setTempFilters({ ...tempFilters, paidBy: e.target.value as number | '' })}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <MenuItem value="">All Users</MenuItem>
                {state.users.map((user) => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.userName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Amount Range */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Amount Range</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Amount"
                    type="number"
                    value={tempFilters.minAmount}
                    onChange={(e) => setTempFilters({ ...tempFilters, minAmount: e.target.value ? Number(e.target.value) : '' })}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Amount"
                    type="number"
                    value={tempFilters.maxAmount}
                    onChange={(e) => setTempFilters({ ...tempFilters, maxAmount: e.target.value ? Number(e.target.value) : '' })}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Date Range */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Date Range</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    value={tempFilters.dateFrom}
                    onChange={(e) => setTempFilters({ ...tempFilters, dateFrom: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={tempFilters.dateTo}
                    onChange={(e) => setTempFilters({ ...tempFilters, dateTo: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Expense Type */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>Expense Type</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempFilters.selfExpenseOnly}
                    onChange={(e) => setTempFilters({ 
                      ...tempFilters, 
                      selfExpenseOnly: e.target.checked,
                      sharedExpenseOnly: e.target.checked ? false : tempFilters.sharedExpenseOnly
                    })}
                  />
                }
                label="Self Expenses Only"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempFilters.sharedExpenseOnly}
                    onChange={(e) => setTempFilters({ 
                      ...tempFilters, 
                      sharedExpenseOnly: e.target.checked,
                      selfExpenseOnly: e.target.checked ? false : tempFilters.selfExpenseOnly
                    })}
                  />
                }
                label="Shared Expenses Only"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          backgroundColor: '#f0f4f8',
          padding: isMobile ? '16px' : '24px',
          borderRadius: isMobile ? '0' : '0 0 12px 12px',
          gap: 1
        }}>
          <Button 
            onClick={handleClearFilters} 
            color="error"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            Clear All
          </Button>
          <Button 
            onClick={() => setFilterDialogOpen(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplyFilters} 
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sort Dialog */}
      <Dialog 
        open={sortDialogOpen} 
        onClose={() => setSortDialogOpen(false)} 
        maxWidth="xs" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f0f4f8',
          borderRadius: isMobile ? '0' : '12px 12px 0 0',
          textAlign: 'center',
          fontWeight: 600
        }}>
          Sort Expenses
        </DialogTitle>
        <DialogContent sx={{
          backgroundColor: '#f0f4f8',
          padding: isMobile ? '16px' : '24px',
        }}>
          <Stack spacing={isMobile ? 2 : 2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={tempSort.field}
                label="Sort By"
                onChange={(e) => setTempSort({ ...tempSort, field: e.target.value as SortOptions['field'] })}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="description">Description</MenuItem>
                <MenuItem value="paidBy">Paid By</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={tempSort.direction}
                label="Order"
                onChange={(e) => setTempSort({ ...tempSort, direction: e.target.value as 'asc' | 'desc' })}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {tempSort.field === 'date' ? (
                  <>
                    <MenuItem value="desc">Newest First</MenuItem>
                    <MenuItem value="asc">Oldest First</MenuItem>
                  </>
                ) : tempSort.field === 'description' ? (
                  <>
                    <MenuItem value="asc">A to Z</MenuItem>
                    <MenuItem value="desc">Z to A</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem value="desc">High to Low</MenuItem>
                    <MenuItem value="asc">Low to High</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          backgroundColor: '#f0f4f8',
          padding: isMobile ? '16px' : '24px',
          borderRadius: isMobile ? '0' : '0 0 12px 12px',
          gap: 1
        }}>
          <Button 
            onClick={() => setSortDialogOpen(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplySort} 
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Apply Sort
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterSortPanel;
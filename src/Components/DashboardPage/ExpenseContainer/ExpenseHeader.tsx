// ExpenseComponents/ExpenseHeader.tsx
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ExpenseHeaderProps {
  title: string;
  date: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ExpenseHeader: React.FC<ExpenseHeaderProps> = ({
  title,
  date,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="8px"
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', gap: '8px' }}>
          <IconButton aria-label="edit" onClick={onEdit} size="small">
            <EditIcon fontSize="small" sx={{ color: '#1976d2' }} />
          </IconButton>
          <IconButton aria-label="delete" onClick={onDelete} size="small">
            <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
          </IconButton>
        </Box>
      </Box>

      <Typography
        variant="subtitle2"
        sx={{ color: '#1976d2', textAlign: 'right', marginBottom: '8px' }}
      >
        {date}
      </Typography>
    </>
  );
};

export default ExpenseHeader;

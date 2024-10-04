import {
  Dialog,
  DialogContent,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTravel } from '../../Contexts/TravelContext';
import { useMessage } from '../../Contexts/NotifContext';
import { deleteUser } from '../../Api';

interface NameListDialogProps {
  onClose: () => void;
}

export const NameListDialog: React.FC<NameListDialogProps> = ({ onClose }) => {
  const travelCtx = useTravel();
  const { setPayload } = useMessage();

  function onDelete(userId: string, deletable: boolean) {
    if (deletable) {
      deleteUser(userId.toString())
        .then((response) => {
          if (response.data.Message) {
            setPayload({
              type: 'success',
              message: 'User deleted successfully.',
            });
          } else {
            setPayload({
              type: 'warning',
              message: 'Failed to delete user.',
            });
          }
          travelCtx.state.refreshData();
        })
        .catch((error) => {
          setPayload({
            type: 'error',
            message: 'Error deleting the user',
          });
        });
    } else {
      setPayload({
        type: 'error',
        message: 'Cannot delete user with expenses.',
      });
    }
  }
  return (
    <Dialog open onClose={onClose} fullWidth>
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems={'center'}
          padding="16px"
          bgcolor="#ffffff"
          borderRadius="8px"
        >
          <Divider sx={{ width: '100%' }} />

          <List sx={{ width: '100%', maxHeight: '400px', overflowY: 'auto' }}>
            {travelCtx.state.users?.map((name: any, index: any) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={name.userName}
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    variant: 'h6',
                  }}
                />
                {/* Delete Button */}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(name.userId, name.deletable)}
                  disabled={!name.deletable}
                >
                  <DeleteIcon color={name.deletable ? 'error' : 'disabled'} />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

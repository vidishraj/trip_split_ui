// DashboardComponents/DashboardDialogs.tsx
import React from 'react';
import UsernameDialog from './Dialogs/AddUserDialog';
import CurrencyDialog from './Dialogs/CurrencyDialog';
import { NameListDialog } from './Dialogs/UserDialog';
import { insertUser } from '../../Api/Api';
import { useMessage } from '../../Contexts/NotifContext';

interface DashboardDialogsProps {
  userDialogOpen: boolean;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  onCloseUserDialog: () => void;
  onSubmitUser: () => void;
  currencyDialogOpen: boolean;
  onCloseCurrencyDialog: () => void;
  nameListOpen: boolean;
  onCloseNameList: () => void;
  refreshData: () => void;
  travelCtx: any; // You can use a proper type from your context
}

const DashboardDialogs: React.FC<DashboardDialogsProps> = ({
  userDialogOpen,
  username,
  setUsername,
  onCloseUserDialog,
  currencyDialogOpen,
  onCloseCurrencyDialog,
  nameListOpen,
  onCloseNameList,
  refreshData,
  travelCtx,
}) => {
  const { setPayload } = useMessage();

  const handleSubmitUser = () => {
    if (travelCtx.state.chosenTrip) {
      const body = {
        user: [username, travelCtx.state.chosenTrip.tripIdShared],
      };
      insertUser(body)
        .then(() => {
          setPayload({
            type: 'success',
            message: 'User added successfully',
          });
          refreshData();
        })
        .catch(() => {
          setPayload({
            type: 'error',
            message: 'Failed to add user.',
          });
        })
        .finally(onCloseUserDialog);
    }
    refreshData();
  };

  return (
    <>
      {/* Username Dialog */}
      <UsernameDialog
        onClose={onCloseUserDialog}
        open={userDialogOpen}
        username={username}
        setUsername={setUsername}
        handleSubmit={handleSubmitUser}
      />

      {/* Currency Dialog */}
      {currencyDialogOpen && (
        <CurrencyDialog
          open={currencyDialogOpen}
          onClose={onCloseCurrencyDialog}
        />
      )}

      {/* Name List Dialog */}
      {nameListOpen && <NameListDialog onClose={onCloseNameList} />}
    </>
  );
};

export default DashboardDialogs;

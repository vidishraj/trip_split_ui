import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Notification.scss';
import { useMessage } from '../Contexts/NotifContext';

const NotificationMessage = (props: any) => {
  const { payload } = useMessage();

  let message = payload.message;
  let type = payload.type;

  const showSuccess = () => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 2500,
    });
  };

  const showWarning = () => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 2500,
    });
  };

  const showError = () => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 2500,
    });
  };

  useEffect(() => {
    if (message !== '') {
      if (type === 'error') {
        showError();
      } else if (type === 'success') {
        showSuccess();
      } else {
        showWarning();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  return (
    <>
      <ToastContainer />
      {props.children}
    </>
  );
};

export default NotificationMessage;

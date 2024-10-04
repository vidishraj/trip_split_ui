import React, { createContext, useState, useContext, ReactNode } from 'react';

interface MessageContextProp {
  payload: {
    message: string;
    type: string;
  };
  setPayload: any;
}

const MessageContext = createContext<MessageContextProp>({
  payload: { message: '', type: '' },
  setPayload: null,
});

const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [payload, setPayload] = useState({
    message: '',
    type: '',
  });

  return (
    <MessageContext.Provider value={{ payload, setPayload }}>
      {children}
    </MessageContext.Provider>
  );
};

const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export { MessageProvider, useMessage };

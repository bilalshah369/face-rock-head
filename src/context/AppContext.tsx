import React, {createContext, useContext, useState} from 'react';

type AppContextType = {
  isAutoSync: boolean;
  setIsAutoSync: (value: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [isAutoSync, setIsAutoSync] = useState(true);

  return (
    <AppContext.Provider
      value={{
        isAutoSync,
        setIsAutoSync,
      }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
};

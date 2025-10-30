import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PermissaoContextType {
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

const PermissaoContext = createContext<PermissaoContextType | undefined>(undefined);

export function PermissaoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const isAdmin = user?.permissao === 'admin';
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canCreate = isAdmin;

  return (
    <PermissaoContext.Provider value={{ isAdmin, canEdit, canDelete, canCreate }}>
      {children}
    </PermissaoContext.Provider>
  );
}

export function usePermissao() {
  const context = useContext(PermissaoContext);
  if (context === undefined) {
    throw new Error('usePermissao must be used within a PermissaoProvider');
  }
  return context;
}

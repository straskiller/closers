import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);

      if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
        // Redirect authenticated users from login page to home
        if (window.location.pathname === '/login') {
          navigate('/');
        }
      } else if (_event === 'SIGNED_OUT') {
        // Redirect unauthenticated users to login page
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session && window.location.pathname !== '/login') {
        navigate('/login');
      } else if (session && window.location.pathname === '/login') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};
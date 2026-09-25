import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DEMO_PASSWORD } from '../../config/demo';
import { errorMessage } from '../../shared/lib/form-errors';
import { authApi } from './auth-api';
import { sessionStore } from './session-store';

/** Signs in to a seeded demo account and opens the app home. */
export function useDemoSignIn() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(email: string) {
    setPending(email);
    setError(null);
    try {
      sessionStore.setGrant(await authApi.login({ email, password: DEMO_PASSWORD }));
      navigate('/');
    } catch (err) {
      setError(errorMessage(err, 'The demo account is unavailable right now. Please try again.'));
      setPending(null);
    }
  }

  return { signIn, pending, error };
}

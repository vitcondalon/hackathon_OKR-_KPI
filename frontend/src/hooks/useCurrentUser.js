import { useAuth } from '../contexts/AuthContext';

export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}

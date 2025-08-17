import { useState } from 'react';
import { User } from '@/types';

export function useUser() {
  const [user, setUser] = useState<User>({
    id: '1',
    email: 'user@example.com',
    name: 'Mohit Dua',
    isPremium: true,
    panNumbers: ['ABCDE1234F', 'FGHIJ5678K'],
    alerts: [],
  });

  const logout = () => {
    // In real app, clear auth tokens and navigate to login
    console.log('Logging out...');
  };

  const updateSubscription = (isPremium: boolean, subscriptionEnd?: string) => {
    setUser(prev => ({
      ...prev,
      isPremium,
      subscriptionEnd,
    }));
  };

  return {
    user,
    logout,
    updateSubscription,
  };
}
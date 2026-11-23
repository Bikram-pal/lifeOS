import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/authStore';
import { authService } from './services/auth.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  const { setUser, token } = useAuthStore();

  useEffect(() => {
    // Validate session on mount if token is present
    if (token) {
      authService
        .getMe()
        .then((res) => {
          if (res?.data?.user) {
            setUser(res.data.user);
          }
        })
        .catch(() => {
          // Token invalid or expired
        });
    }
  }, [token, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#161F36',
              border: '1px solid #233054',
              color: '#F8FAFC',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

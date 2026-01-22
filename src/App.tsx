import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './stores/auth-store';
import './App.css';

function App() {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;

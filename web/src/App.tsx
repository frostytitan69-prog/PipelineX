import { AppProvider } from './app/provider';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;

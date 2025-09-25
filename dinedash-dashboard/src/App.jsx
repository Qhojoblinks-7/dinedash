import Dashboard from './components/Dashboard';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
        {/* <StaffDashboard /> */}
      </div>
    </ToastProvider>
  );
}

export default App;

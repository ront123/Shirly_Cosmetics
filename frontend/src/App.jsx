import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import BookingPage from './pages/BookingPage';
import ClientsList from './pages/ClientsList';
import Campaigns from './pages/Campaigns';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin/Staff Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="clients" element={<ClientsList />} />
          <Route path="campaigns" element={<Campaigns />} />
        </Route>

        {/* Public Client Routes */}
        <Route path="/book" element={<PublicLayout />}>
          <Route index element={<BookingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

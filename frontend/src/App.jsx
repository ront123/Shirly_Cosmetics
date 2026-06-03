import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import BookingPage from './pages/BookingPage';
import ClientsList from './pages/ClientsList';
import Campaigns from './pages/Campaigns';
import Reports from './pages/Reports';
import Products from './pages/Products';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';

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
          <Route path="reports" element={<Reports />} />
          <Route path="products" element={<Products />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="staff" element={<Staff />} />
        </Route>

        {/* Public Client Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route path="book" element={<BookingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

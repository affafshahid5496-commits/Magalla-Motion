import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import DataGate from './components/DataGate.jsx';
import ClassesPage from './pages/ClassesPage.jsx';
import ClassDetailPage from './pages/ClassDetailPage.jsx';
import PlanPage from './pages/PlanPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Routes that need the timetable go through DataGate (loading + retry states). */}
        <Route element={<DataGate />}>
          <Route index element={<ClassesPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>
        <Route path="confirmation/:ref" element={<ConfirmationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

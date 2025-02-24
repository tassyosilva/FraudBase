import { Outlet } from 'react-router-dom';
import Dashboard from './Dashboard';

export default function Layout() {
  return (
    <Dashboard>
      <Outlet />
    </Dashboard>
  );
}

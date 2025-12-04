import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useSidebar } from '../context/SidebarContext';

export default function Layout() {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

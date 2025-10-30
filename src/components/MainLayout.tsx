import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  Wallet,
  FileText,
  FileCog,
  User,
  Menu,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MainLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/funcionarios', label: 'Funcionários', icon: Users },
  { path: '/dividas', label: 'Dívidas', icon: CreditCard },
  { path: '/obras', label: 'Obras', icon: Building2 },
  { path: '/caixa', label: 'Caixa', icon: Wallet },
  { path: '/receber', label: 'A Receber', icon: FileText },
  { path: '/automacao-pdf', label: 'Automação PDF', icon: FileCog },
  { path: '/minha-conta', label: 'Minha Conta', icon: User },
];

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-gray-900">PEPERAIO</h1>
          <p className="text-xs text-gray-600">Comunicação Visual</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start mb-1 ${
                    isActive ? '' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-gray-900">PEPERAIO</h1>
                <p className="text-xs text-gray-600">Comunicação Visual</p>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={`w-full justify-start mb-1 ${
                          isActive ? '' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-gray-900">{user?.nome}</p>
              <p className="text-gray-500 text-xs">
                {user?.permissao === 'admin' ? 'Administrador' : 'Visualizador'}
              </p>
            </div>
            <Avatar>
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback>{user?.nome.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

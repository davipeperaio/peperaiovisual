import React, { useMemo, useState, Suspense, lazy } from 'react';
import LauncherGrid from '../features/launcher/LauncherGrid';
import LauncherModal from '../features/launcher/LauncherModal';
import { LauncherApp } from '../features/launcher/LauncherIcon';
import '../features/launcher/launcher-new.css';

// Lazy load dos componentes de conteúdo
const Caixa = lazy(() => import('./Caixa'));
const Calendario = lazy(() => import('./Calendario'));
const Propostas = lazy(() => import('./Propostas'));
const ObrasHub = lazy(() => import('./ObrasHub'));
const FinanceiroHub = lazy(() => import('./FinanceiroHub'));
const CardsDeObra = lazy(() => import('./CardsDeObra'));
const MinhasObras = lazy(() => import('./MinhasObras'));
const Receber = lazy(() => import('./Receber'));
const Dividas = lazy(() => import('./Dividas'));
const Funcionarios = lazy(() => import('./Funcionarios'));
const MinhaConta = lazy(() => import('./MinhaConta'));

// MUI icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import ConstructionIcon from '@mui/icons-material/Construction';
import AppsIcon from '@mui/icons-material/Apps';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DownloadIcon from '@mui/icons-material/Download';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonIcon from '@mui/icons-material/Person';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ExploreIcon from '@mui/icons-material/Explore';

export default function DashboardLauncher() {
  const [activeApp, setActiveApp] = useState<LauncherApp | null>(null);

  const apps = useMemo<LauncherApp[]>(() => [
    { id: 'lancamentos', label: 'Lançamentos', gradient: 'linear-gradient(135deg,#00C853,#00E676)', glyph: <AttachMoneyIcon /> },
    { id: 'calendario', label: 'Calendário', gradient: 'linear-gradient(135deg,#3F51B5,#00BCD4)', glyph: <CalendarMonthIcon /> },
    { id: 'propostas', label: 'Propostas', gradient: 'linear-gradient(135deg,#FF6F00,#FFA000)', glyph: <DescriptionIcon /> },
    { id: 'obras', label: 'Obras', gradient: 'linear-gradient(135deg,#8E24AA,#D81B60)', glyph: <ConstructionIcon /> },
    { id: 'cards', label: 'Cards de Obra', gradient: 'linear-gradient(135deg,#7CB342,#C0CA33)', glyph: <AppsIcon /> },
    { id: 'minhas-obras', label: 'Minhas Obras', gradient: 'linear-gradient(135deg,#0097A7,#26C6DA)', glyph: <ContentPasteIcon /> },
    { id: 'receber', label: 'A Receber', gradient: 'linear-gradient(135deg,#00B8D4,#00E5FF)', glyph: <DownloadIcon /> },
    { id: 'dividas', label: 'Dívidas', gradient: 'linear-gradient(135deg,#D32F2F,#FF5252)', glyph: <WarningAmberIcon /> },
    { id: 'funcionarios', label: 'Funcionários', gradient: 'linear-gradient(135deg,#5E35B1,#7E57C2)', glyph: <PeopleOutlineIcon /> },
    { id: 'conta', label: 'Minha Conta', gradient: 'linear-gradient(135deg,#546E7A,#455A64)', glyph: <PersonIcon /> },
    { id: 'financeiro', label: 'Financeiro', gradient: 'linear-gradient(135deg,#1565C0,#42A5F5)', glyph: <QueryStatsIcon /> },
    { id: 'obras-hub', label: 'Obras Hub', gradient: 'linear-gradient(135deg,#6A1B9A,#AB47BC)', glyph: <ExploreIcon /> },
  ], []);

  const renderContent = () => {
    if (!activeApp) return null;

    const contentMap: Record<string, React.ReactElement> = {
      'lancamentos': <Caixa />,
      'calendario': <Calendario />,
      'propostas': <Propostas />,
      'obras': <ObrasHub />,
      'cards': <CardsDeObra />,
      'minhas-obras': <MinhasObras />,
      'receber': <Receber />,
      'dividas': <Dividas />,
      'funcionarios': <Funcionarios />,
      'conta': <MinhaConta />,
      'financeiro': <FinanceiroHub />,
      'obras-hub': <ObrasHub />,
    };

    return (
      <Suspense fallback={<div style={{ padding: 40, color: '#fff', textAlign: 'center' }}>Carregando...</div>}>
        {contentMap[activeApp.id]}
      </Suspense>
    );
  };

  return (
    <>
      <LauncherGrid apps={apps} onAppClick={setActiveApp} />
      
      <LauncherModal
        isOpen={!!activeApp}
        onClose={() => setActiveApp(null)}
        title={activeApp?.label || ''}
      >
        {renderContent()}
      </LauncherModal>
    </>
  );
}

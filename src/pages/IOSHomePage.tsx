import React, { useMemo } from 'react';
import AppIcon, { AppConfig } from '../features/launcher/AppIcon';
import '../features/launcher/ios-home.css';

// MUI Icons
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
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';

export default function IOSHomePage() {
  const apps = useMemo<AppConfig[]>(() => [
    { 
      id: 'lancamentos', 
      label: 'Lançamentos', 
      gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
      icon: <AttachMoneyIcon />,
      route: '/caixa'
    },
    { 
      id: 'calendario', 
      label: 'Calendário', 
      gradient: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
      icon: <CalendarMonthIcon />,
      route: '/calendario'
    },
    { 
      id: 'propostas', 
      label: 'Propostas', 
      gradient: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
      icon: <DescriptionIcon />,
      route: '/propostas'
    },
    { 
      id: 'obras', 
      label: 'Obras', 
      gradient: 'linear-gradient(135deg, #AF52DE 0%, #8E3CC9 100%)',
      icon: <ConstructionIcon />,
      route: '/obras-hub'
    },
    { 
      id: 'cards', 
      label: 'Cards de Obra', 
      gradient: 'linear-gradient(135deg, #32ADE6 0%, #0A84FF 100%)',
      icon: <AppsIcon />,
      route: '/cards-de-obra'
    },
    { 
      id: 'minhas-obras', 
      label: 'Minhas Obras', 
      gradient: 'linear-gradient(135deg, #00C7BE 0%, #00A8A0 100%)',
      icon: <ContentPasteIcon />,
      route: '/minhas-obras'
    },
    { 
      id: 'receber', 
      label: 'A Receber', 
      gradient: 'linear-gradient(135deg, #5AC8FA 0%, #0A84FF 100%)',
      icon: <DownloadIcon />,
      route: '/receber'
    },
    { 
      id: 'dividas', 
      label: 'Dívidas', 
      gradient: 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)',
      icon: <WarningAmberIcon />,
      route: '/dividas'
    },
    { 
      id: 'funcionarios', 
      label: 'Funcionários', 
      gradient: 'linear-gradient(135deg, #BF5AF2 0%, #A346D8 100%)',
      icon: <PeopleOutlineIcon />,
      route: '/funcionarios'
    },
    { 
      id: 'conta', 
      label: 'Minha Conta', 
      gradient: 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)',
      icon: <PersonIcon />,
      route: '/minha-conta'
    },
    { 
      id: 'financeiro', 
      label: 'Financeiro', 
      gradient: 'linear-gradient(135deg, #0A84FF 0%, #0051D5 100%)',
      icon: <QueryStatsIcon />,
      route: '/financeiro-hub'
    },
    { 
      id: 'obras-hub', 
      label: 'Obras Hub', 
      gradient: 'linear-gradient(135deg, #AF52DE 0%, #8E3CC9 100%)',
      icon: <ExploreIcon />,
      route: '/obras-hub'
    },
  ], []);

  const dockApps = useMemo<AppConfig[]>(() => [
    {
      id: 'home',
      label: 'Início',
      gradient: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
      icon: <HomeIcon />,
      route: '/dashboard'
    },
    {
      id: 'obras-dock',
      label: 'Obras',
      gradient: 'linear-gradient(135deg, #AF52DE 0%, #8E3CC9 100%)',
      icon: <ConstructionIcon />,
      route: '/obras-hub'
    },
    {
      id: 'financeiro-dock',
      label: 'Financeiro',
      gradient: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
      icon: <QueryStatsIcon />,
      route: '/financeiro-hub'
    },
    {
      id: 'config',
      label: 'Configurações',
      gradient: 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)',
      icon: <SettingsIcon />,
      route: '/minha-conta'
    },
  ], []);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="ios-home-screen">
      {/* Status Bar */}
      <div className="ios-status-bar">
        <div style={{ width: 60 }}></div>
        <div className="ios-status-time">{getCurrentTime()}</div>
        <div style={{ width: 60 }}></div>
      </div>

      {/* Grid de Apps */}
      <div className="ios-app-grid">
        {apps.map((app) => (
          <AppIcon key={app.id} app={app} />
        ))}
      </div>

      {/* Dock */}
      <div className="ios-dock-wrapper">
        <div className="ios-dock">
          {dockApps.map((app) => (
            <AppIcon key={app.id} app={app} isDock />
          ))}
        </div>
      </div>
    </div>
  );
}

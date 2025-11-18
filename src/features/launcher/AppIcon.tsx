import React from 'react';
import { useNavigate } from 'react-router-dom';

export type AppConfig = {
  id: string;
  label: string;
  gradient: string;
  icon: React.ReactNode;
  route: string;
};

type Props = {
  app: AppConfig;
  isDock?: boolean;
};

export default function AppIcon({ app, isDock = false }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(app.route);
  };

  return (
    <div className="ios-app-item" onClick={handleClick}>
      <div 
        className="ios-app-icon"
        style={{ background: app.gradient }}
      >
        <div className="ios-app-icon-content">
          {app.icon}
        </div>
      </div>
      {!isDock && <span className="ios-app-label">{app.label}</span>}
    </div>
  );
}

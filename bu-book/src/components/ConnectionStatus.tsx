/**
 * Connection Status Component for bu-book
 * Shows Supabase connection status in a simple format
 */
import React from 'react';
import { useGlobalApi } from '../contexts/GlobalApiContext';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected, isLoading, error, lastFetch } = useGlobalApi();

  const getStatusClass = () => {
    if (isLoading) return 'connecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  const getStatusText = () => {
    if (isLoading) return 'Server Status: Connecting...';
    if (isConnected) return 'Server Status: Online';
    return 'Server Status: Offline';
  };

  return (
    <div className={`connection-status ${className}`}>
      <div className="status-indicator">
        <div 
          className={`status-dot ${getStatusClass()}`}
        />
        <span className="status-text">{getStatusText()}</span>
        {lastFetch && (
          <span className="last-update">
            | {new Date(lastFetch).toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {error && (
        <div className="error-message" title={error}>
          Connection error
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;

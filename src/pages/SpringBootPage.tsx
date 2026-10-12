import React from 'react';
import SpringBootArchitectureExplorer from '../components/SpringBoot/SpringBootArchitectureExplorer';

export const SpringBootPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Spring Boot Backend Architecture & REST Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            JAVA 21 · SPRING BOOT 3.3.4 · HIBERNATE JPA · STOMP WEBSOCKET · POSTGRESQL POSTGIS
          </p>
        </div>
      </div>

      <SpringBootArchitectureExplorer />
    </div>
  );
};

import React from 'react';
import { PlayerStats, Weapon } from './types';
import { Crosshair, Heart, Shield } from 'lucide-react';

interface UIProps {
  stats: PlayerStats;
  weapon: Weapon;
}

export const UI: React.FC<UIProps> = ({ stats, weapon }) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Crosshair className="w-6 h-6 text-white opacity-50" />
      </div>

      {/* Status Bars */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 w-64">
        {/* Health Bar */}
        <div className="w-full flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-200"
              style={{ width: `${(stats.health / stats.maxHealth) * 100}%` }}
            />
          </div>
        </div>

        {/* Stamina Bar */}
        <div className="w-full flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${(stats.stamina / stats.maxStamina) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weapon Info */}
      <div className="absolute bottom-8 right-8 bg-black bg-opacity-50 p-4 rounded text-white">
        <div className="font-bold mb-1">{weapon.name}</div>
        <div className="text-sm">
          Ammo: {weapon.ammo} / {weapon.maxAmmo}
        </div>
      </div>

      {/* Score */}
      <div className="absolute top-8 right-8 bg-black bg-opacity-50 p-4 rounded text-white">
        <div className="text-xl font-bold">Score: {stats.score}</div>
      </div>

      {/* Weapon Status */}
      {weapon.isReloading && (
        <div className="absolute bottom-32 right-8 bg-black bg-opacity-50 p-2 rounded text-white">
          Reloading...
        </div>
      )}
    </div>
  );
};
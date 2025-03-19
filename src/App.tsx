import React, { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';
import { UI } from './game/UI';
import { PlayerStats, Weapon } from './game/types';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    score: 0,
    currentWeapon: 'pistol'
  });
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>({
    name: 'Pistol',
    damage: 20,
    range: 20,
    fireRate: 0.5,
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 1.5,
    isReloading: false
  });

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Game(containerRef.current);
      
      // Update stats every frame
      const updateStats = () => {
        if (gameRef.current) {
          const player = gameRef.current.getPlayer();
          setPlayerStats(player.getStats());
          setCurrentWeapon(player.getCurrentWeapon());
        }
        requestAnimationFrame(updateStats);
      };
      updateStats();
    }
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 p-2 rounded">
        Click to start - WASD to move, Mouse to look, Space to jump, Shift to sprint, E to dodge
      </div>
      <UI stats={playerStats} weapon={currentWeapon} />
    </div>
  );
}

export default App;
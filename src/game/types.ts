export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Bounds {
  min: Vector3;
  max: Vector3;
}

export interface Weapon {
  name: string;
  damage: number;
  range: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  reloadTime: number;
  isReloading: boolean;
}

export interface WeaponStats {
  pistol: Weapon;
  shotgun: Weapon;
  rifle: Weapon;
}

export enum EnemyState {
  PATROL = 'patrol',
  CHASE = 'chase',
  ATTACK = 'attack',
  RETREAT = 'retreat'
}

export enum EnemyType {
  GRUNT = 'grunt',
  HEAVY = 'heavy',
  SCOUT = 'scout'
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  score: number;
  currentWeapon: keyof WeaponStats;
}
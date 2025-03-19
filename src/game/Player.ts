import * as THREE from 'three';
import { PlayerStats, WeaponStats } from './types';
import { WeaponSystem } from './weapons/WeaponSystem';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private canJump: boolean = false;
  private isSprinting: boolean = false;
  private isDodging: boolean = false;
  private velocity: THREE.Vector3;
  private direction: THREE.Vector3;
  private boundingBox: THREE.Box3;
  private weaponSystem: WeaponSystem;
  private lastDodgeTime: number = 0;
  private dodgeCooldown: number = 1;
  private stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    score: 0,
    currentWeapon: 'pistol'
  };

  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.camera = camera;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.boundingBox = new THREE.Box3(
      new THREE.Vector3(-0.5, 0, -0.5),
      new THREE.Vector3(0.5, 2, 0.5)
    );
    this.weaponSystem = new WeaponSystem(camera, scene);
    
    this.camera.position.set(0, 2, 0);
    this.setupControls();
  }

  private setupControls() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'KeyA':
          this.moveLeft = true;
          break;
        case 'KeyD':
          this.moveRight = true;
          break;
        case 'Space':
          if (this.canJump) {
            this.velocity.y += 350;
            this.canJump = false;
          }
          break;
        case 'ShiftLeft':
          this.isSprinting = true;
          break;
        case 'KeyR':
          this.weaponSystem.reload();
          break;
        case 'Digit1':
          this.weaponSystem.switchWeapon('pistol');
          this.stats.currentWeapon = 'pistol';
          break;
        case 'Digit2':
          this.weaponSystem.switchWeapon('shotgun');
          this.stats.currentWeapon = 'shotgun';
          break;
        case 'Digit3':
          this.weaponSystem.switchWeapon('rifle');
          this.stats.currentWeapon = 'rifle';
          break;
        case 'KeyE':
          this.tryDodge();
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'KeyA':
          this.moveLeft = false;
          break;
        case 'KeyD':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
          this.isSprinting = false;
          break;
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.y -= event.movementX * 0.002;
        this.camera.rotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, this.camera.rotation.x - event.movementY * 0.002)
        );
      }
    });

    document.addEventListener('mousedown', (event) => {
      if (event.button === 0) { // Left click
        this.weaponSystem.fire(performance.now() / 1000);
      }
    });
  }

  private tryDodge() {
    const currentTime = performance.now() / 1000;
    if (currentTime - this.lastDodgeTime >= this.dodgeCooldown && this.stats.stamina >= 30) {
      this.isDodging = true;
      this.stats.stamina -= 30;
      this.lastDodgeTime = currentTime;
      
      // Add dodge impulse in movement direction
      const dodgeSpeed = 20;
      if (this.moveForward) this.velocity.z -= dodgeSpeed;
      if (this.moveBackward) this.velocity.z += dodgeSpeed;
      if (this.moveLeft) this.velocity.x -= dodgeSpeed;
      if (this.moveRight) this.velocity.x += dodgeSpeed;

      setTimeout(() => {
        this.isDodging = false;
      }, 300);
    }
  }

  update(delta: number) {
    if (document.pointerLockElement === document.body) {
      // Update stamina
      if (this.isSprinting && (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight)) {
        this.stats.stamina = Math.max(0, this.stats.stamina - 20 * delta);
      } else {
        this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + 10 * delta);
      }

      // Movement
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= 9.8 * 100.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      const speedMultiplier = this.isSprinting && this.stats.stamina > 0 ? 1.5 : 1;
      const baseSpeed = this.isDodging ? 600 : 400;
      const speed = baseSpeed * speedMultiplier;

      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * speed * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * speed * delta;
      }

      // Update position
      this.camera.position.x += this.velocity.x * delta;
      this.camera.position.z += this.velocity.z * delta;
      this.camera.position.y += this.velocity.y * delta;

      // Ground collision
      if (this.camera.position.y < 2) {
        this.velocity.y = 0;
        this.camera.position.y = 2;
        this.canJump = true;
      }

      // Update bounding box
      this.boundingBox.setFromCenterAndSize(
        this.camera.position,
        new THREE.Vector3(1, 2, 1)
      );
    }
  }

  takeDamage(amount: number) {
    if (this.isDodging) amount *= 0.5; // Damage reduction while dodging
    this.stats.health = Math.max(0, this.stats.health - amount);
    return this.stats.health <= 0;
  }

  heal(amount: number) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  addScore(points: number) {
    this.stats.score += points;
  }

  getStats(): PlayerStats {
    return { ...this.stats };
  }

  getPosition(): THREE.Vector3 {
    return this.camera.position;
  }

  getBoundingBox(): THREE.Box3 {
    return this.boundingBox;
  }

  getCurrentWeapon() {
    return this.weaponSystem.getCurrentWeapon();
  }
}
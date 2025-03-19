import * as THREE from 'three';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { World } from './World';
import { EnemyType } from './types';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: Player;
  private enemies: Enemy[];
  private world: World;
  private clock: THREE.Clock;
  private spawnInterval: number = 10000; // Spawn new enemy every 10 seconds
  private lastSpawnTime: number = 0;

  constructor(container: HTMLElement) {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Initialize game components
    this.world = new World(this.scene);
    this.player = new Player(this.camera, this.scene);
    this.enemies = [
      new Enemy(this.scene, new THREE.Vector3(10, 1, 10), EnemyType.GRUNT),
      new Enemy(this.scene, new THREE.Vector3(-10, 1, -10), EnemyType.SCOUT, 8),
      new Enemy(this.scene, new THREE.Vector3(15, 1, -15), EnemyType.HEAVY, 6)
    ];
    
    this.clock = new THREE.Clock();

    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    container.addEventListener('click', this.onContainerClick.bind(this));

    // Start the game loop
    this.animate();
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onContainerClick() {
    if (document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
    }
  }

  private spawnEnemy() {
    const currentTime = performance.now();
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      const spawnRadius = 30;
      const angle = Math.random() * Math.PI * 2;
      const spawnPosition = new THREE.Vector3(
        Math.cos(angle) * spawnRadius,
        1,
        Math.sin(angle) * spawnRadius
      );

      // Randomly select enemy type
      const types = [EnemyType.GRUNT, EnemyType.SCOUT, EnemyType.HEAVY];
      const randomType = types[Math.floor(Math.random() * types.length)];

      this.enemies.push(new Enemy(this.scene, spawnPosition, randomType));
      this.lastSpawnTime = currentTime;
    }
  }

  private checkCollisions() {
    const playerBox = this.player.getBoundingBox();

    // Check enemy collisions
    this.enemies.forEach((enemy, index) => {
      const enemyBox = enemy.getBoundingBox();
      
      if (playerBox.intersectsBox(enemyBox)) {
        if (enemy.getState() === 'attack') {
          const isDead = this.player.takeDamage(enemy.getDamage() * this.clock.getDelta());
          if (isDead) {
            console.log('Game Over!');
            // Implement game over logic
          }
        }
      }
    });

    // Check world collisions
    if (this.world.checkCollision(playerBox)) {
      // Implement collision response
      // For now, we'll just prevent movement through obstacles
      const pos = this.player.getPosition();
      pos.y = Math.max(2, pos.y);
    }
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    // Update game objects
    this.player.update(delta);
    this.enemies.forEach((enemy, index) => {
      enemy.update(delta, this.player.getPosition());
    });

    // Spawn new enemies
    this.spawnEnemy();

    // Check collisions
    this.checkCollisions();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  getPlayer() {
    return this.player;
  }
}
import * as THREE from 'three';
import { EnemyState, EnemyType } from './types';

export class Enemy {
  private mesh: THREE.Mesh;
  private state: EnemyState = EnemyState.PATROL;
  private health: number;
  private maxHealth: number;
  private speed: number;
  private detectionRange: number;
  private attackRange: number;
  private damage: number;
  private lastAttackTime: number = 0;
  private attackCooldown: number;
  private patrolPoints: THREE.Vector3[];
  private currentPatrolIndex: number = 0;
  private velocity: THREE.Vector3;
  private boundingBox: THREE.Box3;

  constructor(
    private scene: THREE.Scene,
    position: THREE.Vector3,
    private type: EnemyType,
    patrolRadius: number = 5
  ) {
    // Set stats based on enemy type
    switch (type) {
      case EnemyType.HEAVY:
        this.maxHealth = 200;
        this.speed = 2;
        this.detectionRange = 15;
        this.attackRange = 3;
        this.damage = 20;
        this.attackCooldown = 2;
        break;
      case EnemyType.SCOUT:
        this.maxHealth = 50;
        this.speed = 8;
        this.detectionRange = 25;
        this.attackRange = 5;
        this.damage = 10;
        this.attackCooldown = 0.5;
        break;
      default: // GRUNT
        this.maxHealth = 100;
        this.speed = 4;
        this.detectionRange = 20;
        this.attackRange = 4;
        this.damage = 15;
        this.attackCooldown = 1;
    }

    this.health = this.maxHealth;
    this.velocity = new THREE.Vector3();

    // Create enemy mesh with different appearances based on type
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({
      color: this.getColorForType(),
      emissive: 0x222222
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.scene.add(this.mesh);

    // Create bounding box for collision detection
    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

    // Generate patrol points
    this.patrolPoints = this.generatePatrolPoints(position, patrolRadius);
  }

  private getColorForType(): number {
    switch (this.type) {
      case EnemyType.HEAVY:
        return 0x8B0000; // Dark red
      case EnemyType.SCOUT:
        return 0x00FF00; // Green
      default:
        return 0xFF0000; // Red for GRUNT
    }
  }

  private generatePatrolPoints(center: THREE.Vector3, radius: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const numPoints = 4;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      points.push(new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        center.y,
        center.z + Math.sin(angle) * radius
      ));
    }
    
    return points;
  }

  update(delta: number, playerPosition: THREE.Vector3) {
    // Update bounding box
    this.boundingBox.setFromObject(this.mesh);

    const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
    
    // State machine
    switch (this.state) {
      case EnemyState.PATROL:
        if (distanceToPlayer <= this.detectionRange) {
          this.state = EnemyState.CHASE;
        } else {
          this.patrol(delta);
        }
        break;

      case EnemyState.CHASE:
        if (distanceToPlayer <= this.attackRange) {
          this.state = EnemyState.ATTACK;
        } else if (distanceToPlayer > this.detectionRange * 1.5) {
          this.state = EnemyState.RETREAT;
        } else {
          this.chase(playerPosition, delta);
        }
        break;

      case EnemyState.ATTACK:
        if (distanceToPlayer > this.attackRange) {
          this.state = EnemyState.CHASE;
        } else {
          this.attack(delta);
        }
        break;

      case EnemyState.RETREAT:
        if (distanceToPlayer <= this.detectionRange) {
          this.state = EnemyState.CHASE;
        } else if (this.mesh.position.distanceTo(this.patrolPoints[0]) <= 2) {
          this.state = EnemyState.PATROL;
        } else {
          this.retreat(delta);
        }
        break;
    }

    // Update position and rotation
    this.mesh.position.add(this.velocity.multiplyScalar(delta));
  }

  private patrol(delta: number) {
    const target = this.patrolPoints[this.currentPatrolIndex];
    const direction = target.clone().sub(this.mesh.position).normalize();
    
    this.velocity.copy(direction.multiplyScalar(this.speed));
    
    if (this.mesh.position.distanceTo(target) < 0.5) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }

    // Update rotation to face movement direction
    this.mesh.lookAt(target);
  }

  private chase(playerPosition: THREE.Vector3, delta: number) {
    const direction = playerPosition.clone().sub(this.mesh.position).normalize();
    this.velocity.copy(direction.multiplyScalar(this.speed * 1.5));
    this.mesh.lookAt(playerPosition);
  }

  private attack(delta: number) {
    const currentTime = performance.now() / 1000;
    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
      this.lastAttackTime = currentTime;
      // Attack logic will be handled by the collision system
    }
  }

  private retreat(delta: number) {
    const target = this.patrolPoints[0];
    const direction = target.clone().sub(this.mesh.position).normalize();
    this.velocity.copy(direction.multiplyScalar(this.speed * 0.7));
    this.mesh.lookAt(target);
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    
    // Visual feedback
    const material = this.mesh.material as THREE.MeshPhongMaterial;
    material.emissive.setHex(0xff0000);
    setTimeout(() => {
      material.emissive.setHex(0x222222);
    }, 100);

    if (this.health <= this.maxHealth * 0.3) {
      this.state = EnemyState.RETREAT;
    }

    return this.health <= 0;
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }

  getBoundingBox(): THREE.Box3 {
    return this.boundingBox;
  }

  getState(): EnemyState {
    return this.state;
  }

  getDamage(): number {
    return this.damage;
  }
}
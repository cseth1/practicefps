import * as THREE from 'three';
import { Weapon, WeaponStats } from '../types';

export class WeaponSystem {
  private weapons: WeaponStats = {
    pistol: {
      name: 'Pistol',
      damage: 20,
      range: 20,
      fireRate: 0.5,
      ammo: 12,
      maxAmmo: 12,
      reloadTime: 1.5,
      isReloading: false
    },
    shotgun: {
      name: 'Shotgun',
      damage: 80,
      range: 10,
      fireRate: 1.2,
      ammo: 6,
      maxAmmo: 6,
      reloadTime: 2.5,
      isReloading: false
    },
    rifle: {
      name: 'Rifle',
      damage: 35,
      range: 50,
      fireRate: 0.2,
      ammo: 30,
      maxAmmo: 30,
      reloadTime: 2.0,
      isReloading: false
    }
  };

  private lastFireTime: number = 0;
  private raycaster: THREE.Raycaster;
  private currentWeapon: keyof WeaponStats = 'pistol';

  constructor(private camera: THREE.PerspectiveCamera, private scene: THREE.Scene) {
    this.raycaster = new THREE.Raycaster();
  }

  getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeapon];
  }

  switchWeapon(weapon: keyof WeaponStats) {
    if (this.weapons[weapon]) {
      this.currentWeapon = weapon;
      return true;
    }
    return false;
  }

  fire(time: number): boolean {
    const weapon = this.weapons[this.currentWeapon];
    
    if (weapon.isReloading || weapon.ammo <= 0) {
      return false;
    }

    if (time - this.lastFireTime < weapon.fireRate) {
      return false;
    }

    this.lastFireTime = time;
    weapon.ammo--;

    // Update raycaster with current camera direction
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    // Create muzzle flash effect
    this.createMuzzleFlash();

    // Check for hits
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (intersects.length > 0) {
      const hit = intersects[0];
      if (hit.distance <= weapon.range) {
        this.createHitEffect(hit.point);
        return true;
      }
    }

    return false;
  }

  reload() {
    const weapon = this.weapons[this.currentWeapon];
    if (weapon.isReloading || weapon.ammo === weapon.maxAmmo) {
      return;
    }

    weapon.isReloading = true;
    setTimeout(() => {
      weapon.ammo = weapon.maxAmmo;
      weapon.isReloading = false;
    }, weapon.reloadTime * 1000);
  }

  private createMuzzleFlash() {
    const flash = new THREE.PointLight(0xffaa00, 3, 3);
    flash.position.copy(this.camera.position).add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));
    this.scene.add(flash);
    
    setTimeout(() => {
      this.scene.remove(flash);
    }, 50);
  }

  private createHitEffect(position: THREE.Vector3) {
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints([position]),
      new THREE.PointsMaterial({ color: 0xff0000, size: 0.5 })
    );
    this.scene.add(particles);
    
    setTimeout(() => {
      this.scene.remove(particles);
    }, 100);
  }
}
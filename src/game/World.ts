import * as THREE from 'three';

export class World {
  private scene: THREE.Scene;
  private obstacles: THREE.Mesh[] = [];
  private colliders: THREE.Box3[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createWorld();
  }

  private createWorld() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x808080,
      side: THREE.DoubleSide,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // Walls
    const wallMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x808080,
      roughness: 0.6
    });
    
    // Create walls with more interesting architecture
    const walls = [
      { pos: [0, 5, -50], scale: [100, 10, 1], rot: [0, 0, 0] },  // Back wall
      { pos: [0, 5, 50], scale: [100, 10, 1], rot: [0, 0, 0] },   // Front wall
      { pos: [-50, 5, 0], scale: [1, 10, 100], rot: [0, 0, 0] },  // Left wall
      { pos: [50, 5, 0], scale: [1, 10, 100], rot: [0, 0, 0] },   // Right wall
    ];

    walls.forEach(wall => {
      const wallGeometry = new THREE.BoxGeometry(...wall.scale);
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(...wall.pos);
      wallMesh.rotation.set(...wall.rot);
      this.scene.add(wallMesh);
      this.obstacles.push(wallMesh);
      this.colliders.push(new THREE.Box3().setFromObject(wallMesh));
    });

    // Create a more complex environment with various obstacles
    const obstacleConfigs = [
      // Central structure
      { pos: [0, 2, 0], scale: [6, 4, 6], rot: [0, Math.PI / 4, 0], color: 0x4a4a4a },
      
      // Cover points
      { pos: [-15, 1.5, -15], scale: [3, 3, 3], rot: [0, 0, 0], color: 0x555555 },
      { pos: [15, 1.5, 15], scale: [3, 3, 3], rot: [0, 0, 0], color: 0x555555 },
      
      // Barriers
      { pos: [-8, 1, 8], scale: [8, 2, 1], rot: [0, Math.PI / 3, 0], color: 0x666666 },
      { pos: [8, 1, -8], scale: [8, 2, 1], rot: [0, -Math.PI / 3, 0], color: 0x666666 },
      
      // Elevated platforms
      { pos: [-20, 0.5, 20], scale: [6, 1, 6], rot: [0, 0, 0], color: 0x777777 },
      { pos: [20, 0.5, -20], scale: [6, 1, 6], rot: [0, 0, 0], color: 0x777777 },
    ];

    obstacleConfigs.forEach(config => {
      const geometry = new THREE.BoxGeometry(...config.scale);
      const material = new THREE.MeshPhongMaterial({ 
        color: config.color,
        roughness: 0.7
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...config.pos);
      mesh.rotation.set(...config.rot);
      this.scene.add(mesh);
      this.obstacles.push(mesh);
      this.colliders.push(new THREE.Box3().setFromObject(mesh));
    });

    // Add atmospheric lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    // Add point lights for atmosphere
    const pointLights = [
      { pos: [20, 5, 20], color: 0xff7700, intensity: 1 },
      { pos: [-20, 5, -20], color: 0x0077ff, intensity: 1 },
      { pos: [-20, 5, 20], color: 0xff0077, intensity: 1 },
      { pos: [20, 5, -20], color: 0x00ff77, intensity: 1 },
    ];

    pointLights.forEach(light => {
      const pointLight = new THREE.PointLight(light.color, light.intensity, 20);
      pointLight.position.set(...light.pos);
      this.scene.add(pointLight);
    });

    // Add fog for atmosphere
    this.scene.fog = new THREE.Fog(0x000000, 20, 60);
  }

  checkCollision(box: THREE.Box3): boolean {
    return this.colliders.some(collider => box.intersectsBox(collider));
  }

  getObstacles(): THREE.Mesh[] {
    return this.obstacles;
  }
}
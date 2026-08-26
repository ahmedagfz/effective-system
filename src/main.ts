import './style.css';
import HavokPhysics from '@babylonjs/havok';
import {
  Engine,
  Scene,
  Vector3,
  Color3,
  Color4,
  StandardMaterial,
  DynamicTexture,
  MeshBuilder,
  FreeCamera,
  HemisphericLight,
  PointLight,
  DirectionalLight,
  GlowLayer,
  ParticleSystem,
  Texture,
  Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  PhysicsMotionType,
  Ray,
  Quaternion,
} from '@babylonjs/core';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import {
  AdvancedDynamicTexture,
  TextBlock,
  Rectangle,
  Button,
  Control,
  StackPanel,
} from '@babylonjs/gui';
import { io, Socket } from 'socket.io-client';

// ==========================================
// PROCEDURAL SOUND MANAGER (WEB AUDIO API)
// ==========================================
class SoundManager {
  private ctx: AudioContext | null = null;

  private initCtx(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  playShoot(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playBossShoot(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playHit(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  playHeal(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }

  playPingAlert(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  playBossExplosion(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [120, 80, 50].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const start = now + idx * 0.18;
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(20, start + 0.7);
        gain.gain.setValueAtTime(0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.7);
      });
    } catch {}
  }

  playVictory(): void {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const startTime = now + i * 0.14;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {}
  }
}

// ==========================================
// GAME STATE & INTERFACES
// ==========================================
interface RemotePlayer {
  id: string;
  mesh: Mesh;
  targetPosition: Vector3;
  targetRotationY: number;
  label: TextBlock;
  downedMarker?: TextBlock;
  color: string;
  lives: number;
  health: number;
  isDowned: boolean;
}

interface MovingPlatform {
  mesh: Mesh;
  aggregate: PhysicsAggregate;
  speed: number;
  distance: number;
  center: Vector3;
  axis: 'x' | 'z';
  velocity: Vector3;
  delta: Vector3;
}

interface Projectile {
  mesh: Mesh;
  velocity: Vector3;
  lifeTime: number;
  isLocal: boolean;
}

interface BossProjectile {
  mesh: Mesh;
  velocity: Vector3;
  lifeTime: number;
}

interface BossState {
  mesh: Mesh;
  coreMesh: Mesh;
  leftWing: Mesh;
  rightWing: Mesh;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  position: Vector3;
}

const LEVEL_GOAL_Z = 220;
const BOSS_ARENA_Z = 180;
const DANGER_ZONE_Y = -6.0;
const START_POSITION = new Vector3(0, 2.5, 0);

class StreetBrawlerGame {
  private canvas!: HTMLCanvasElement;
  private engine!: Engine;
  private scene!: Scene;
  private camera!: FreeCamera;
  private playerMesh!: Mesh;
  private playerAggregate!: PhysicsAggregate;
  private playerLight!: PointLight;
  private glowLayer!: GlowLayer;
  private sounds: SoundManager = new SoundManager();

  // Input states & Game Flow
  private inputKeys: { [key: string]: boolean } = {};
  private touchMoveX: number = 0;
  private touchMoveZ: number = 0;
  private isGrounded: boolean = false;
  private canJump: boolean = true;
  private canShoot: boolean = true;
  private isGameStarted: boolean = false;

  // Health, Lives & Co-op Downed System
  private health: number = 100;
  private maxHealth: number = 100;
  private lives: number = 3;
  private maxLives: number = 3;
  private isRespawning: boolean = false;
  private isDowned: boolean = false;
  private hasWon: boolean = false;
  private cameraShakeTimer: number = 0;

  // Multiplayer
  private socket: Socket | null = null;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private lastEmitTime: number = 0;
  private isConnected: boolean = false;
  private downedTeammateId: string | null = null;

  // Level & Boss elements
  private movingPlatforms: MovingPlatform[] = [];
  private rotatingObstacles: { mesh: Mesh; aggregate: PhysicsAggregate; speed: number }[] = [];
  private projectiles: Projectile[] = [];
  private bossProjectiles: BossProjectile[] = [];
  private lastBossAttackTime: number = 0;
  private boss!: BossState;
  private bossGateMesh!: Mesh;
  private victoryParticles!: ParticleSystem;
  private hitParticles!: ParticleSystem;
  private healParticles!: ParticleSystem;
  private bossExplosionParticles!: ParticleSystem;

  // UI elements
  private uiTexture!: AdvancedDynamicTexture;
  private lobbyModal!: Rectangle;
  private zoneBadge!: TextBlock;
  private progressFill!: Rectangle;
  private progressPercentText!: TextBlock;
  private onlineStatusText!: TextBlock;
  private healthFill!: Rectangle;
  private healthText!: TextBlock;
  private livesText!: TextBlock;
  private fallCountText!: TextBlock;
  private koBanner!: Rectangle;
  private koBannerText!: TextBlock;
  private downedBanner!: Rectangle;
  private downedBannerText!: TextBlock;
  private rescuePromptBanner!: Rectangle;
  private rescuePromptBtn!: Button;
  private bossHUD!: Rectangle;
  private bossHealthFill!: Rectangle;
  private bossHealthText!: TextBlock;
  private winModal!: Rectangle;
  private winHeader!: TextBlock;
  private winSub!: TextBlock;
  private winTimeText!: TextBlock;
  private winFallsText!: TextBlock;
  private winCountdownText!: TextBlock;
  private lobbyReturnTimer: any = null;

  // Game metrics
  private startTime: number = Date.now();
  private fallCount: number = 0;
  private currentCheckpoint: Vector3 = START_POSITION.clone();

  constructor() {
    this.init();
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  private async init(): Promise<void> {
    this.createCanvas();
    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });
    this.scene = new Scene(this.engine);

    // Warm Sunset Atmosphere
    this.scene.clearColor = new Color4(0.96, 0.65, 0.45, 1.0);
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogDensity = 0.004;
    this.scene.fogColor = new Color3(0.95, 0.72, 0.55);

    // Initialize Havok Physics Engine
    await this.setupPhysics();

    // Setup Lighting & Visual Glow
    this.setupLighting();

    // Build the Level
    this.buildLevel();

    // Create Player Character & Controls
    this.createPlayer();

    // Setup Camera following Player
    this.setupCamera();

    // Setup GUI HUD, Touch Controls, Lobby & Win Screen
    this.setupGUI();

    // Register Input Listeners (Keyboard + Touch)
    this.setupInput();

    // Main Game Render Loop
    this.setupGameLoop();

    // Handle Window Resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private createCanvas(): void {
    let app = document.getElementById('app');
    if (!app) {
      app = document.createElement('div');
      app.id = 'app';
      document.body.appendChild(app);
    }
    app.innerHTML = '';

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'renderCanvas';
    app.appendChild(this.canvas);
  }

  // ==========================================
  // PHYSICS SETUP (HAVOK)
  // ==========================================
  private async setupPhysics(): Promise<void> {
    try {
      const havokInstance = await HavokPhysics();
      const havokPlugin = new HavokPlugin(true, havokInstance);
      this.scene.enablePhysics(new Vector3(0, -25, 0), havokPlugin);
      console.log('⚡ [Havok Physics] Successfully initialized.');
    } catch (err) {
      console.error('Failed to initialize Havok physics:', err);
    }
  }

  // ==========================================
  // LIGHTING & POST-PROCESSING
  // ==========================================
  private setupLighting(): void {
    const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
    hemiLight.intensity = 0.7;
    hemiLight.diffuse = new Color3(1.0, 0.92, 0.85);
    hemiLight.groundColor = new Color3(0.45, 0.35, 0.3);

    const dirLight = new DirectionalLight('sunLight', new Vector3(-0.6, -1.0, 0.4), this.scene);
    dirLight.position = new Vector3(40, 80, -20);
    dirLight.intensity = 0.95;
    dirLight.diffuse = new Color3(1.0, 0.85, 0.65);

    this.glowLayer = new GlowLayer('glowLayer', this.scene, {
      mainTextureFixedSize: 1024,
      blurKernelSize: 32,
    });
    this.glowLayer.intensity = 0.55;
  }

  // ==========================================
  // TEXTURE & MATERIAL HELPERS
  // ==========================================
  private createAsphaltMaterial(): StandardMaterial {
    const mat = new StandardMaterial('matAsphalt', this.scene);
    const dt = new DynamicTexture('dtAsphalt', 512, this.scene, true);
    const ctx = dt.getContext() as CanvasRenderingContext2D;

    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.floor(40 + Math.random() * 35);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x, y, 2, 2);
    }

    ctx.fillStyle = '#facc15';
    ctx.fillRect(242, 0, 28, 512);

    dt.update();
    mat.diffuseTexture = dt;
    mat.specularColor = new Color3(0.2, 0.2, 0.25);
    mat.roughness = 0.85;
    return mat;
  }

  private createBrickMaterial(): StandardMaterial {
    const mat = new StandardMaterial('matBrick', this.scene);
    const dt = new DynamicTexture('dtBrick', 512, this.scene, true);
    const ctx = dt.getContext() as CanvasRenderingContext2D;

    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(0, 0, 512, 512);

    const brickH = 32;
    const brickW = 64;
    for (let y = 0; y < 512; y += brickH + 4) {
      const offset = (y / (brickH + 4)) % 2 === 0 ? 0 : brickW / 2;
      for (let x = -brickW; x < 512 + brickW; x += brickW + 4) {
        ctx.fillStyle = (x + y) % 3 === 0 ? '#b45309' : '#9a3412';
        ctx.fillRect(x + offset, y, brickW, brickH);
      }
    }
    dt.update();
    mat.diffuseTexture = dt;
    mat.specularColor = new Color3(0.15, 0.15, 0.15);
    return mat;
  }

  private createMetalHazardMaterial(): StandardMaterial {
    const mat = new StandardMaterial('matMetalHazard', this.scene);
    const dt = new DynamicTexture('dtHazard', 512, this.scene, true);
    const ctx = dt.getContext() as CanvasRenderingContext2D;

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#f59e0b';
    for (let i = -512; i < 1024; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 20, 0);
      ctx.lineTo(i + 20 - 512, 512);
      ctx.lineTo(i - 512, 512);
      ctx.fill();
    }
    ctx.fillStyle = '#475569';
    ctx.fillRect(36, 36, 440, 440);

    dt.update();
    mat.diffuseTexture = dt;
    mat.specularColor = new Color3(0.5, 0.5, 0.6);
    return mat;
  }

  private createCrateMaterial(wood: boolean = true): StandardMaterial {
    const mat = new StandardMaterial(wood ? 'matWoodCrate' : 'matMetalCrate', this.scene);
    const dt = new DynamicTexture('dtCrate', 256, this.scene, true);
    const ctx = dt.getContext() as CanvasRenderingContext2D;

    ctx.fillStyle = wood ? '#a16207' : '#64748b';
    ctx.fillRect(0, 0, 256, 256);

    ctx.lineWidth = 14;
    ctx.strokeStyle = wood ? '#713f12' : '#334155';
    ctx.strokeRect(7, 7, 242, 242);

    ctx.beginPath();
    ctx.moveTo(14, 14);
    ctx.lineTo(242, 242);
    ctx.moveTo(242, 14);
    ctx.lineTo(14, 242);
    ctx.stroke();

    dt.update();
    mat.diffuseTexture = dt;
    mat.specularColor = new Color3(0.2, 0.2, 0.2);
    return mat;
  }

  private createNeonSign(text: string, colorHex: string, position: Vector3, rotationY: number = 0): void {
    const signMesh = MeshBuilder.CreatePlane(`neonSign_${text}`, { width: 4.5, height: 1.8 }, this.scene);
    signMesh.position = position;
    signMesh.rotation.y = rotationY;

    const mat = new StandardMaterial(`matNeon_${text}`, this.scene);
    const dt = new DynamicTexture(`dtNeon_${text}`, { width: 512, height: 256 }, this.scene, true);
    const ctx = dt.getContext() as CanvasRenderingContext2D;

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 236);

    ctx.font = 'bold 60px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colorHex;
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 18;
    ctx.fillText(text, 256, 128);

    dt.update();
    mat.diffuseTexture = dt;
    mat.emissiveTexture = dt;
    mat.emissiveColor = Color3.FromHexString(colorHex);
    signMesh.material = mat;
  }

  // ==========================================
  // LEVEL BUILDER
  // ==========================================
  private buildLevel(): void {
    const matAsphalt = this.createAsphaltMaterial();
    const matBrick = this.createBrickMaterial();
    const matHazard = this.createMetalHazardMaterial();
    const matWoodCrate = this.createCrateMaterial(true);
    const matMetalCrate = this.createCrateMaterial(false);

    // 0. SUNSET WATER
    const dangerWater = MeshBuilder.CreateGround(
      'dangerWater',
      { width: 160, height: 360 },
      this.scene
    );
    dangerWater.position = new Vector3(0, -10, 110);

    const matWater = new StandardMaterial('matWater', this.scene);
    matWater.diffuseColor = new Color3(0.02, 0.4, 0.7);
    matWater.emissiveColor = new Color3(0.01, 0.25, 0.5);
    matWater.specularColor = new Color3(1.0, 0.85, 0.6);
    dangerWater.material = matWater;

    this.scene.onBeforeRenderObservable.add(() => {
      const t = performance.now() / 1000;
      matWater.emissiveColor.b = 0.45 + Math.sin(t * 1.5) * 0.1;
    });

    // 1. SECTION 1: DOWNTOWN STREET (Z: 0 to 50)
    const startStreet = MeshBuilder.CreateBox('startStreet', { width: 10, height: 1.5, depth: 16 }, this.scene);
    startStreet.position = new Vector3(0, 0, 2);
    startStreet.material = matAsphalt;
    new PhysicsAggregate(startStreet, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const street1 = MeshBuilder.CreateBox('street1', { width: 8.5, height: 1.5, depth: 14 }, this.scene);
    street1.position = new Vector3(0, 0.5, 20);
    street1.material = matAsphalt;
    new PhysicsAggregate(street1, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const streetStep = MeshBuilder.CreateBox('streetStep', { width: 7.5, height: 1.5, depth: 12 }, this.scene);
    streetStep.position = new Vector3(0, 1.2, 38);
    streetStep.material = matAsphalt;
    new PhysicsAggregate(streetStep, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const wallLeft1 = MeshBuilder.CreateBox('wallLeft1', { width: 1.2, height: 6, depth: 52 }, this.scene);
    wallLeft1.position = new Vector3(-5.5, 3, 22);
    wallLeft1.material = matBrick;
    new PhysicsAggregate(wallLeft1, PhysicsShapeType.BOX, { mass: 0 }, this.scene);

    const wallRight1 = MeshBuilder.CreateBox('wallRight1', { width: 1.2, height: 6, depth: 52 }, this.scene);
    wallRight1.position = new Vector3(5.5, 3, 22);
    wallRight1.material = matBrick;
    new PhysicsAggregate(wallRight1, PhysicsShapeType.BOX, { mass: 0 }, this.scene);

    const cratePositions = [
      new Vector3(-2, 1.5, 6),
      new Vector3(2, 1.5, 8),
      new Vector3(0, 2.0, 22),
      new Vector3(-1.8, 2.0, 24),
      new Vector3(2.2, 2.7, 39),
    ];

    cratePositions.forEach((pos, idx) => {
      const crate = MeshBuilder.CreateBox(`crate_${idx}`, { size: 1.5 }, this.scene);
      crate.position = pos;
      crate.material = idx % 2 === 0 ? matWoodCrate : matMetalCrate;
      new PhysicsAggregate(crate, PhysicsShapeType.BOX, { mass: 0, friction: 0.8 }, this.scene);
    });

    [4, 20, 36].forEach((zPos, idx) => {
      const lampPole = MeshBuilder.CreateCylinder(`lampPole_${idx}`, { height: 5, diameter: 0.2 }, this.scene);
      lampPole.position = new Vector3(-4.5, 3, zPos);
      lampPole.material = matMetalCrate;

      const lampHead = MeshBuilder.CreateSphere(`lampHead_${idx}`, { diameter: 0.7 }, this.scene);
      lampHead.position = new Vector3(-4.5, 5.5, zPos);
      const lampMat = new StandardMaterial(`lampMat_${idx}`, this.scene);
      lampMat.emissiveColor = new Color3(1.0, 0.8, 0.4);
      lampHead.material = lampMat;
    });

    this.createNeonSign('BRAWL', '#f59e0b', new Vector3(-4.8, 4.5, 12), Math.PI / 2);
    this.createNeonSign('SUNSET', '#38bdf8', new Vector3(4.8, 4.5, 28), -Math.PI / 2);

    // 2. SECTION 2: HIGHRISE CONSTRUCTION (Z: 50 to 100)
    const landing1 = MeshBuilder.CreateBox('landing1', { width: 7.5, height: 1.5, depth: 6 }, this.scene);
    landing1.position = new Vector3(0, 1.5, 52);
    landing1.material = matHazard;
    new PhysicsAggregate(landing1, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const movPlatform1 = MeshBuilder.CreateBox('movPlatform1', { width: 7.0, height: 1.5, depth: 6.5 }, this.scene);
    movPlatform1.position = new Vector3(0, 1.5, 62);
    movPlatform1.material = matHazard;
    const agg1 = new PhysicsAggregate(movPlatform1, PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution: 0.0 }, this.scene);
    agg1.body.setMotionType(PhysicsMotionType.ANIMATED);
    this.movingPlatforms.push({
      mesh: movPlatform1,
      aggregate: agg1,
      speed: 1.3,
      distance: 3.8,
      center: new Vector3(0, 1.5, 62),
      axis: 'x',
      velocity: Vector3.Zero(),
      delta: Vector3.Zero(),
    });

    const midPad1 = MeshBuilder.CreateBox('midPad1', { width: 7.0, height: 1.5, depth: 6 }, this.scene);
    midPad1.position = new Vector3(0, 2.0, 72);
    midPad1.material = matHazard;
    new PhysicsAggregate(midPad1, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const barrelMat = new StandardMaterial('matBarrel', this.scene);
    barrelMat.diffuseColor = new Color3(0.9, 0.4, 0.1);
    barrelMat.specularColor = new Color3(0.6, 0.6, 0.6);

    const barrel1 = MeshBuilder.CreateCylinder('barrel1', { height: 1.8, diameter: 1.1 }, this.scene);
    barrel1.position = new Vector3(-1.8, 3.4, 72);
    barrel1.material = barrelMat;
    new PhysicsAggregate(barrel1, PhysicsShapeType.CYLINDER, { mass: 0 }, this.scene);

    const movPlatform2 = MeshBuilder.CreateBox('movPlatform2', { width: 7.0, height: 1.5, depth: 6.5 }, this.scene);
    movPlatform2.position = new Vector3(0, 2.2, 82);
    movPlatform2.material = matHazard;
    const agg2 = new PhysicsAggregate(movPlatform2, PhysicsShapeType.BOX, { mass: 0, friction: 1.0, restitution: 0.0 }, this.scene);
    agg2.body.setMotionType(PhysicsMotionType.ANIMATED);
    this.movingPlatforms.push({
      mesh: movPlatform2,
      aggregate: agg2,
      speed: 1.4,
      distance: 4.2,
      center: new Vector3(0, 2.2, 82),
      axis: 'x',
      velocity: Vector3.Zero(),
      delta: Vector3.Zero(),
    });

    const landing2 = MeshBuilder.CreateBox('landing2', { width: 7.5, height: 1.5, depth: 6 }, this.scene);
    landing2.position = new Vector3(0, 2.8, 94);
    landing2.material = matHazard;
    new PhysicsAggregate(landing2, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    // 3. SECTION 3: ROOFTOP GAUNTLET (Z: 100 to 160)
    const matSteel = new StandardMaterial('matSteel', this.scene);
    matSteel.diffuseColor = new Color3(0.3, 0.35, 0.45);
    matSteel.specularColor = new Color3(0.6, 0.7, 0.85);

    const narrowBeam1 = MeshBuilder.CreateBox('narrowBeam1', { width: 2.5, height: 1.2, depth: 10 }, this.scene);
    narrowBeam1.position = new Vector3(0, 3.2, 104);
    narrowBeam1.material = matSteel;
    new PhysicsAggregate(narrowBeam1, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const rotPlatform = MeshBuilder.CreateBox('rotPlatform', { width: 7.0, height: 1.5, depth: 6.0 }, this.scene);
    rotPlatform.position = new Vector3(0, 3.2, 114);
    rotPlatform.material = matHazard;
    new PhysicsAggregate(rotPlatform, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const rotPipe1 = MeshBuilder.CreateCylinder('rotPipe1', { height: 6, diameter: 1.2 }, this.scene);
    rotPipe1.rotation.x = Math.PI / 2;
    rotPipe1.position = new Vector3(0, 4.4, 114);
    const matPipe = new StandardMaterial('matPipe', this.scene);
    matPipe.diffuseColor = new Color3(0.85, 0.25, 0.25);
    matPipe.emissiveColor = new Color3(0.3, 0.05, 0.05);
    rotPipe1.material = matPipe;
    const aggPipe1 = new PhysicsAggregate(rotPipe1, PhysicsShapeType.CYLINDER, { mass: 0, friction: 0.5 }, this.scene);
    aggPipe1.body.setMotionType(PhysicsMotionType.ANIMATED);
    this.rotatingObstacles.push({ mesh: rotPipe1, aggregate: aggPipe1, speed: 2.2 });

    const platform_bridge_1 = MeshBuilder.CreateBox('platform_bridge_1', { width: 5.0, height: 1.2, depth: 5.0 }, this.scene);
    platform_bridge_1.position = new Vector3(0, 3.6, 122);
    platform_bridge_1.material = matHazard;
    new PhysicsAggregate(platform_bridge_1, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const platform_bridge_2 = MeshBuilder.CreateBox('platform_bridge_2', { width: 5.0, height: 1.2, depth: 5.0 }, this.scene);
    platform_bridge_2.position = new Vector3(0, 3.8, 130);
    platform_bridge_2.material = matHazard;
    new PhysicsAggregate(platform_bridge_2, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const platform_bridge_3 = MeshBuilder.CreateBox('platform_bridge_3', { width: 5.0, height: 1.2, depth: 5.0 }, this.scene);
    platform_bridge_3.position = new Vector3(0, 4.0, 138);
    platform_bridge_3.material = matHazard;
    new PhysicsAggregate(platform_bridge_3, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const platform_bridge_4 = MeshBuilder.CreateBox('platform_bridge_4', { width: 5.5, height: 1.2, depth: 5.0 }, this.scene);
    platform_bridge_4.position = new Vector3(0, 4.2, 146);
    platform_bridge_4.material = matHazard;
    new PhysicsAggregate(platform_bridge_4, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const preBossLanding = MeshBuilder.CreateBox('preBossLanding', { width: 7.5, height: 1.5, depth: 6.0 }, this.scene);
    preBossLanding.position = new Vector3(0, 4.2, 154);
    preBossLanding.material = matHazard;
    new PhysicsAggregate(preBossLanding, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    this.createNeonSign('⚠️ BOSS AHEAD ⚠️', '#ef4444', new Vector3(0, 8.5, 154), 0);

    const platform_bridge_5 = MeshBuilder.CreateBox('platform_bridge_5', { width: 5.0, height: 1.2, depth: 4.5 }, this.scene);
    platform_bridge_5.position = new Vector3(0, 4.2, 161);
    platform_bridge_5.material = matHazard;
    new PhysicsAggregate(platform_bridge_5, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const platform_bridge_6 = MeshBuilder.CreateBox('platform_bridge_6', { width: 5.0, height: 1.2, depth: 4.5 }, this.scene);
    platform_bridge_6.position = new Vector3(0, 4.2, 167);
    platform_bridge_6.material = matHazard;
    new PhysicsAggregate(platform_bridge_6, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    const platform_bridge_7 = MeshBuilder.CreateBox('platform_bridge_7', { width: 6.0, height: 1.2, depth: 4.5 }, this.scene);
    platform_bridge_7.position = new Vector3(0, 4.2, 173);
    platform_bridge_7.material = matHazard;
    new PhysicsAggregate(platform_bridge_7, PhysicsShapeType.BOX, { mass: 0, friction: 1.0 }, this.scene);

    // 4. SECTION 4: THE BOSS ARENA (Z: 170 to 205)
    const arenaPlatform = MeshBuilder.CreateCylinder('bossArena', { height: 2.0, diameter: 26, tessellation: 48 }, this.scene);
    arenaPlatform.position = new Vector3(0, 4.2, BOSS_ARENA_Z);
    const matArena = new StandardMaterial('matArena', this.scene);
    matArena.diffuseColor = new Color3(0.2, 0.22, 0.28);
    matArena.specularColor = new Color3(0.6, 0.6, 0.7);
    arenaPlatform.material = matArena;
    new PhysicsAggregate(arenaPlatform, PhysicsShapeType.CYLINDER, { mass: 0, friction: 1.0 }, this.scene);

    const arenaRing = MeshBuilder.CreateTorus('arenaRing', { diameter: 25.5, thickness: 0.35, tessellation: 48 }, this.scene);
    arenaRing.position = new Vector3(0, 5.3, BOSS_ARENA_Z);
    const matRing = new StandardMaterial('matRing', this.scene);
    matRing.emissiveColor = new Color3(0.95, 0.45, 0.1);
    arenaRing.material = matRing;

    // Create Boss Monster
    this.createBossMonster();

    // 5. VICTORY GATE & PODIUM
    this.createVictoryGate();

    const podiumBase = MeshBuilder.CreateCylinder('podiumBase', { height: 1.8, diameter: 12, tessellation: 32 }, this.scene);
    podiumBase.position = new Vector3(0, 4.5, LEVEL_GOAL_Z);
    const matPodium = new StandardMaterial('matPodium', this.scene);
    matPodium.diffuseColor = new Color3(0.15, 0.15, 0.25);
    matPodium.emissiveColor = new Color3(0.0, 0.6, 1.0);
    podiumBase.material = matPodium;
    new PhysicsAggregate(podiumBase, PhysicsShapeType.CYLINDER, { mass: 0, friction: 1.0 }, this.scene);

    const starTrophy = MeshBuilder.CreateTorusKnot('starTrophy', { radius: 1.3, tube: 0.4, p: 2, q: 3 }, this.scene);
    starTrophy.position = new Vector3(0, 7.8, LEVEL_GOAL_Z);
    const matStar = new StandardMaterial('matStar', this.scene);
    matStar.emissiveColor = new Color3(1.0, 0.85, 0.1);
    matStar.specularColor = new Color3(1.0, 1.0, 1.0);
    starTrophy.material = matStar;

    this.scene.onBeforeRenderObservable.add(() => {
      starTrophy.rotation.y += 0.03;
      starTrophy.rotation.x += 0.015;
    });

    this.setupParticles();
  }

  private createVictoryGate(): void {
    if (this.bossGateMesh && !this.bossGateMesh.isDisposed()) {
      this.bossGateMesh.dispose();
    }
    this.bossGateMesh = MeshBuilder.CreateBox('bossGate', { width: 10, height: 8, depth: 1 }, this.scene);
    this.bossGateMesh.position = new Vector3(0, 8.0, 196);
    const matGate = new StandardMaterial('matGate', this.scene);
    matGate.diffuseColor = new Color3(0.9, 0.1, 0.2);
    matGate.emissiveColor = new Color3(0.9, 0.15, 0.2);
    matGate.alpha = 0.65;
    this.bossGateMesh.material = matGate;
    new PhysicsAggregate(this.bossGateMesh, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
  }

  private createBossMonster(): void {
    if (this.boss && this.boss.mesh && !this.boss.mesh.isDisposed()) {
      this.boss.mesh.dispose();
    }

    const bossRoot = MeshBuilder.CreateBox('bossRoot', { width: 4.0, height: 5.0, depth: 3.5 }, this.scene);
    bossRoot.position = new Vector3(0, 8.5, BOSS_ARENA_Z + 4);

    const matBoss = new StandardMaterial('matBoss', this.scene);
    matBoss.diffuseColor = new Color3(0.2, 0.25, 0.35);
    matBoss.specularColor = new Color3(1.0, 0.8, 0.4);
    bossRoot.material = matBoss;

    const core = MeshBuilder.CreateSphere('bossCore', { diameter: 2.0 }, this.scene);
    core.position = new Vector3(0, 0.3, -1.5);
    core.parent = bossRoot;
    const matCore = new StandardMaterial('matBossCore', this.scene);
    matCore.emissiveColor = new Color3(1.0, 0.2, 0.1);
    core.material = matCore;

    const leftWing = MeshBuilder.CreateBox('bossLeftWing', { width: 1.5, height: 3.2, depth: 1.8 }, this.scene);
    leftWing.position = new Vector3(-3.2, 0.5, 0);
    leftWing.parent = bossRoot;
    leftWing.material = matBoss;

    const rightWing = MeshBuilder.CreateBox('bossRightWing', { width: 1.5, height: 3.2, depth: 1.8 }, this.scene);
    rightWing.position = new Vector3(3.2, 0.5, 0);
    rightWing.parent = bossRoot;
    rightWing.material = matBoss;

    this.boss = {
      mesh: bossRoot,
      coreMesh: core,
      leftWing,
      rightWing,
      health: 100,
      maxHealth: 100,
      isAlive: true,
      position: new Vector3(0, 8.5, BOSS_ARENA_Z + 4),
    };
  }

  private setupParticles(): void {
    // Grand Victory Confetti
    this.victoryParticles = new ParticleSystem('victoryParticles', 800, this.scene);
    this.victoryParticles.particleTexture = new Texture(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPklEQVQYV2P8z8AARAwMDGoMDAxMDDgAEx4FMIkYkxhhGpjgGsD2Y1OEzQSYAmRNeBSgs9HNgGkGqcbhAQAw5gwLE2sMbgAAAABJRU5ErkJggg==',
      this.scene
    );
    this.victoryParticles.emitter = new Vector3(0, 8.0, BOSS_ARENA_Z);
    this.victoryParticles.minEmitBox = new Vector3(-4, 0, -4);
    this.victoryParticles.maxEmitBox = new Vector3(4, 0, 4);
    this.victoryParticles.color1 = new Color4(1.0, 0.85, 0.0, 1.0);
    this.victoryParticles.color2 = new Color4(0.0, 0.95, 1.0, 1.0);
    this.victoryParticles.colorDead = new Color4(1.0, 0.2, 0.6, 0.0);
    this.victoryParticles.minSize = 0.35;
    this.victoryParticles.maxSize = 0.9;
    this.victoryParticles.minLifeTime = 1.2;
    this.victoryParticles.maxLifeTime = 2.8;
    this.victoryParticles.emitRate = 350;
    this.victoryParticles.gravity = new Vector3(0, -9.81, 0);
    this.victoryParticles.direction1 = new Vector3(-6, 12, -6);
    this.victoryParticles.direction2 = new Vector3(6, 16, 6);

    // Player Hit Sparks
    this.hitParticles = new ParticleSystem('hitParticles', 200, this.scene);
    this.hitParticles.particleTexture = this.victoryParticles.particleTexture;
    this.hitParticles.color1 = new Color4(1.0, 0.5, 0.1, 1.0);
    this.hitParticles.color2 = new Color4(1.0, 0.9, 0.2, 1.0);
    this.hitParticles.colorDead = new Color4(0.8, 0.1, 0.0, 0.0);
    this.hitParticles.minSize = 0.2;
    this.hitParticles.maxSize = 0.6;
    this.hitParticles.minLifeTime = 0.2;
    this.hitParticles.maxLifeTime = 0.5;
    this.hitParticles.manualEmitCount = 0;

    // Healing / Revive Sparkles
    this.healParticles = new ParticleSystem('healParticles', 300, this.scene);
    this.healParticles.particleTexture = this.victoryParticles.particleTexture;
    this.healParticles.color1 = new Color4(0.0, 1.0, 0.6, 1.0);
    this.healParticles.color2 = new Color4(0.2, 0.9, 1.0, 1.0);
    this.healParticles.colorDead = new Color4(0.0, 0.5, 0.2, 0.0);
    this.healParticles.minSize = 0.25;
    this.healParticles.maxSize = 0.7;
    this.healParticles.minLifeTime = 0.4;
    this.healParticles.maxLifeTime = 0.9;
    this.healParticles.manualEmitCount = 0;

    // Boss Mega Explosion Burst Particles
    this.bossExplosionParticles = new ParticleSystem('bossExplosionParticles', 600, this.scene);
    this.bossExplosionParticles.particleTexture = this.victoryParticles.particleTexture;
    this.bossExplosionParticles.color1 = new Color4(1.0, 0.2, 0.1, 1.0);
    this.bossExplosionParticles.color2 = new Color4(1.0, 0.9, 0.1, 1.0);
    this.bossExplosionParticles.colorDead = new Color4(0.2, 0.0, 0.1, 0.0);
    this.bossExplosionParticles.minSize = 0.8;
    this.bossExplosionParticles.maxSize = 2.2;
    this.bossExplosionParticles.minLifeTime = 0.6;
    this.bossExplosionParticles.maxLifeTime = 1.4;
    this.bossExplosionParticles.manualEmitCount = 0;
  }

  // ==========================================
  // PLAYER CHARACTER CREATION
  // ==========================================
  private createPlayer(): void {
    this.playerMesh = MeshBuilder.CreateCapsule(
      'localPlayer',
      { radius: 0.5, height: 1.8, tessellation: 16 },
      this.scene
    );
    this.playerMesh.position.set(START_POSITION.x, START_POSITION.y, START_POSITION.z);

    const playerMat = new StandardMaterial('localPlayerMat', this.scene);
    playerMat.diffuseColor = new Color3(0.9, 0.15, 0.2);
    playerMat.specularColor = new Color3(0.6, 0.6, 0.6);
    playerMat.emissiveColor = new Color3(0.15, 0.02, 0.05);
    this.playerMesh.material = playerMat;

    const headband = MeshBuilder.CreateTorus('playerHeadband', { diameter: 0.85, thickness: 0.14 }, this.scene);
    headband.position = new Vector3(0, 0.45, 0);
    headband.rotation.x = Math.PI / 2;
    headband.parent = this.playerMesh;
    const matHeadband = new StandardMaterial('matHeadband', this.scene);
    matHeadband.diffuseColor = new Color3(1.0, 1.0, 1.0);
    matHeadband.emissiveColor = new Color3(0.8, 0.8, 0.8);
    headband.material = matHeadband;

    this.playerLight = new PointLight('playerPointLight', new Vector3(0, 2, 0), this.scene);
    this.playerLight.intensity = 1.0;
    this.playerLight.range = 14;
    this.playerLight.diffuse = new Color3(1.0, 0.9, 0.7);

    this.playerAggregate = new PhysicsAggregate(
      this.playerMesh,
      PhysicsShapeType.CAPSULE,
      { mass: 2.0, friction: 0.8, restitution: 0.0 },
      this.scene
    );

    this.playerAggregate.body.setMassProperties({
      inertia: Vector3.Zero(),
    });
  }

  // ==========================================
  // CAMERA (SMOOTH THIRD-PERSON FOLLOW)
  // ==========================================
  private setupCamera(): void {
    this.camera = new FreeCamera('playerFollowCam', new Vector3(0, 5, -8), this.scene);
    this.camera.setTarget(this.playerMesh.position);
    this.camera.fov = 0.9;
  }

  // ==========================================
  // INPUT HANDLING (KEYBOARD + TOUCH)
  // ==========================================
  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      this.inputKeys[code] = true;

      if (code === 'Space' && this.isGameStarted && !this.isRespawning && !this.isDowned) {
        this.performJump();
      }

      if ((code === 'KeyF' || code === 'KeyJ') && this.isGameStarted && !this.isRespawning && !this.isDowned && this.canShoot) {
        this.shootProjectile();
      }

      if (code === 'KeyE' && this.isGameStarted && this.rescuePromptBanner.isVisible && this.downedTeammateId) {
        this.summonAndReviveTeammate(this.downedTeammateId);
      }

      if (code === 'KeyR' && this.isGameStarted && !this.isRespawning && !this.isDowned) {
        this.damagePlayer(20);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.inputKeys[e.code] = false;
    });
  }

  // ==========================================
  // 1. CLEAN ARCADE JUMP PHYSICS
  // ==========================================
  private performJump(): void {
    if (!this.canJump || !this.isGrounded || this.isRespawning || this.isDowned || !this.isGameStarted) return;

    const currentVel = this.playerAggregate.body.getLinearVelocity();
    this.playerAggregate.body.setLinearVelocity(
      new Vector3(currentVel.x, 13.5, currentVel.z)
    );
    this.sounds.playJump();
    this.isGrounded = false;
    this.canJump = false;
    setTimeout(() => {
      this.canJump = true;
    }, 150);
  }

  // ==========================================
  // 2. SMART 3D AIMING & SHOOTING MECHANIC
  // ==========================================
  private shootProjectile(customPos?: Vector3, customDir?: Vector3, isLocal: boolean = true): void {
    const origin = customPos || this.playerMesh.position.clone().add(new Vector3(0, 0.9, 0));
    let forward: Vector3;

    if (customDir) {
      forward = customDir;
    } else if (this.boss && this.boss.isAlive && this.playerMesh.position.z >= 120) {
      const bossCenter = this.boss.mesh.position.clone();
      bossCenter.y = 8.5;
      const aimVector = bossCenter.subtract(origin);
      forward = aimVector.normalize();

      const targetRotY = Math.atan2(forward.x, forward.z);
      this.playerMesh.rotation.y = targetRotY;
    } else {
      const rotY = this.playerMesh.rotation.y;
      forward = new Vector3(Math.sin(rotY), 0, Math.cos(rotY)).normalize();
    }

    const speed = 40.0;
    const projMesh = MeshBuilder.CreateSphere('projectile', { diameter: 0.8 }, this.scene);
    projMesh.position = origin.clone();
    const projMat = new StandardMaterial('projMat', this.scene);
    projMat.emissiveColor = isLocal ? new Color3(1.0, 0.85, 0.1) : new Color3(0.0, 0.95, 1.0);
    projMat.diffuseColor = isLocal ? new Color3(1.0, 0.7, 0.0) : new Color3(0.0, 0.8, 1.0);
    projMesh.material = projMat;

    this.projectiles.push({
      mesh: projMesh,
      velocity: forward.scale(speed),
      lifeTime: 2.5,
      isLocal,
    });

    if (isLocal) {
      this.sounds.playShoot();
      this.canShoot = false;
      setTimeout(() => {
        this.canShoot = true;
      }, 180);

      if (this.socket && this.isConnected) {
        this.socket.emit('playerShoot', {
          origin: { x: origin.x, y: origin.y, z: origin.z },
          direction: { x: forward.x, y: forward.y, z: forward.z },
        });
      }
    }
  }

  // ==========================================
  // 3. BOSS ATTACKS
  // ==========================================
  private triggerBossAttack(): void {
    if (!this.boss || !this.boss.isAlive || !this.isGameStarted) return;

    const origin = this.boss.mesh.position.clone().add(new Vector3(0, 0, -2.0));
    const target = this.playerMesh.position.clone().add(new Vector3(0, 0.6, 0));
    const direction = target.subtract(origin).normalize();
    const speed = 23.0;

    const bossProjMesh = MeshBuilder.CreateSphere('bossProjectile', { diameter: 1.1 }, this.scene);
    bossProjMesh.position = origin.clone();
    const matProj = new StandardMaterial('matBossProj', this.scene);
    matProj.emissiveColor = new Color3(1.0, 0.1, 0.6);
    matProj.diffuseColor = new Color3(0.8, 0.05, 0.2);
    bossProjMesh.material = matProj;

    this.bossProjectiles.push({
      mesh: bossProjMesh,
      velocity: direction.scale(speed),
      lifeTime: 3.5,
    });

    this.sounds.playBossShoot();

    const coreMat = this.boss.coreMesh.material as StandardMaterial;
    if (coreMat) {
      coreMat.emissiveColor = new Color3(1.0, 0.8, 0.2);
      setTimeout(() => {
        if (this.boss && this.boss.coreMesh && !this.boss.coreMesh.isDisposed()) {
          coreMat.emissiveColor = new Color3(1.0, 0.2, 0.1);
        }
      }, 200);
    }
  }

  private updateBossProjectiles(deltaSec: number): void {
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const bp = this.bossProjectiles[i];
      bp.mesh.position.addInPlace(bp.velocity.scale(deltaSec));
      bp.lifeTime -= deltaSec;

      const dist = Vector3.Distance(bp.mesh.position, this.playerMesh.position);
      if (dist < 1.3 && !this.isRespawning && !this.isDowned) {
        this.hitParticles.emitter = bp.mesh.position.clone();
        this.hitParticles.manualEmitCount = 35;
        this.hitParticles.start();

        bp.mesh.dispose();
        this.bossProjectiles.splice(i, 1);

        this.damagePlayer(20);
        continue;
      }

      if (bp.lifeTime <= 0 || bp.mesh.position.y < -4) {
        bp.mesh.dispose();
        this.bossProjectiles.splice(i, 1);
      }
    }
  }

  // ==========================================
  // 4. HEALTH, DAMAGE & INSTANT CO-OP SUMMON REVIVE
  // ==========================================
  private damagePlayer(amount: number): void {
    if (this.isRespawning || this.isDowned || !this.isGameStarted) return;

    this.health = Math.max(0, this.health - amount);
    this.sounds.playHit();
    this.updateHUD();

    const pMat = this.playerMesh.material as StandardMaterial;
    if (pMat) {
      const origDiff = pMat.diffuseColor.clone();
      const origEmiss = pMat.emissiveColor.clone();
      pMat.diffuseColor = new Color3(1.0, 1.0, 1.0);
      pMat.emissiveColor = new Color3(1.0, 0.2, 0.2);
      setTimeout(() => {
        if (this.playerMesh && !this.playerMesh.isDisposed()) {
          pMat.diffuseColor = origDiff;
          pMat.emissiveColor = origEmiss;
        }
      }, 150);
    }

    if (this.health <= 0) {
      this.playerHitOrFall(false);
    } else {
      this.broadcastPlayerState();
    }
  }

  private playerHitOrFall(isWaterFall: boolean = false): void {
    if (this.isRespawning || this.isDowned || !this.isGameStarted) return;

    this.isRespawning = true;
    this.lives -= 1;
    this.sounds.playHit();
    this.fallCount++;
    this.fallCountText.text = `KOs: ${this.fallCount}`;

    if (this.lives > 0) {
      this.health = this.maxHealth;
      this.updateHUD();

      const targetPos = this.currentCheckpoint.clone();
      targetPos.y += 2.0;

      this.playerAggregate.body.disablePreStep = false;
      this.playerAggregate.body.setLinearVelocity(Vector3.Zero());
      this.playerAggregate.body.setAngularVelocity(Vector3.Zero());
      this.playerMesh.position.copyFrom(targetPos);
      this.playerAggregate.body.transformNode.position.copyFrom(targetPos);

      this.koBannerText.text = isWaterFall
        ? `🌊 FELL IN WATER! LIVES LEFT: ${this.lives} 🌊`
        : `💥 K.O.! LIVES LEFT: ${this.lives} (HP RESTORED) 💥`;
      this.koBanner.isVisible = true;
      setTimeout(() => {
        this.koBanner.isVisible = false;
      }, 1300);

      this.broadcastPlayerState();

      setTimeout(() => {
        this.isRespawning = false;
        this.playerAggregate.body.setLinearVelocity(Vector3.Zero());
        this.playerAggregate.body.setAngularVelocity(Vector3.Zero());
      }, 1500);
    } else {
      // 0 Lives Left -> Enter Co-op Downed State
      this.health = 0;
      this.lives = 0;
      this.updateHUD();
      this.enterDownedState();
    }
  }

  private enterDownedState(): void {
    this.isDowned = true;
    this.isRespawning = false;

    this.playerAggregate.body.setLinearVelocity(Vector3.Zero());
    this.playerAggregate.body.setAngularVelocity(Vector3.Zero());
    this.playerMesh.rotation.z = Math.PI / 2;

    const pMat = this.playerMesh.material as StandardMaterial;
    if (pMat) {
      pMat.emissiveColor = new Color3(1.0, 0.2, 0.2);
    }

    this.downedBanner.isVisible = true;
    this.broadcastPlayerState();
    console.log('💀 [Player Downed] Waiting for teammate to summon & revive...');
  }

  // Alive player clicks to summon & revive fallen friend
  private summonAndReviveTeammate(targetId: string): void {
    if (!this.socket || !this.isConnected) return;

    this.sounds.playHeal();
    const spawnPos = {
      x: Number(this.playerMesh.position.x.toFixed(2)),
      y: Number((this.playerMesh.position.y + 1.5).toFixed(2)),
      z: Number(this.playerMesh.position.z.toFixed(2)),
    };

    this.socket.emit('playerRevive', {
      targetId,
      spawnPos,
    });

    this.rescuePromptBanner.isVisible = false;
    this.downedTeammateId = null;

    this.koBannerText.text = '✨ YOU SUMMONED YOUR TEAMMATE BACK! FIGHT TOGETHER! ✨';
    this.koBanner.isVisible = true;
    setTimeout(() => {
      this.koBanner.isVisible = false;
    }, 1600);
  }

  private revivePlayer(spawnPos?: { x: number; y: number; z: number }): void {
    this.isDowned = false;
    this.health = this.maxHealth;
    this.lives = 3; // Fully restore 3 lives on summon!

    const targetPos = spawnPos ? new Vector3(spawnPos.x, spawnPos.y, spawnPos.z) : this.currentCheckpoint.clone().add(new Vector3(0, 2.0, 0));

    this.playerAggregate.body.disablePreStep = false;
    this.playerAggregate.body.setLinearVelocity(Vector3.Zero());
    this.playerAggregate.body.setAngularVelocity(Vector3.Zero());
    this.playerMesh.rotation.z = 0;
    this.playerMesh.position.copyFrom(targetPos);
    this.playerAggregate.body.transformNode.position.copyFrom(targetPos);

    const pMat = this.playerMesh.material as StandardMaterial;
    if (pMat) {
      pMat.emissiveColor = new Color3(0.15, 0.02, 0.05);
    }

    this.downedBanner.isVisible = false;
    this.updateHUD();

    this.sounds.playHeal();
    this.healParticles.emitter = this.playerMesh.position.clone();
    this.healParticles.manualEmitCount = 100;
    this.healParticles.start();

    this.koBannerText.text = '✨ SUMMONED BY TEAMMATE! FULL HEALTH & 3 LIVES RESTORED! ✨';
    this.koBanner.isVisible = true;
    setTimeout(() => {
      this.koBanner.isVisible = false;
    }, 1800);

    this.broadcastPlayerState();
    console.log('💖 [Player Summoned] Rescued directly by teammate!');
  }

  private broadcastPlayerState(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('playerStateUpdate', {
        lives: this.lives,
        health: this.health,
        isDowned: this.isDowned,
      });
    }
  }

  // ==========================================
  // MULTIPLAYER SYNC (SOCKET.IO)
  // ==========================================
  private connectMultiplayer(): void {
    try {
      const serverUrl = window.location.port === '5174' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : window.location.origin;

      console.log(`🔌 [Socket.io] Connecting to multiplayer server at ${serverUrl} ...`);
      this.socket = io(serverUrl, {
        reconnectionAttempts: 8,
        timeout: 4000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.updateOnlineStatus();
        console.log(`🎮 [Multiplayer] Successfully connected to server! Socket ID: ${this.socket?.id}`);

        this.socket?.emit('playerJoined', {
          id: this.socket.id,
          x: Number(this.playerMesh.position.x.toFixed(3)),
          y: Number(this.playerMesh.position.y.toFixed(3)),
          z: Number(this.playerMesh.position.z.toFixed(3)),
          timestamp: Date.now(),
        });
      });

      this.socket.on('connectionSuccess', (data: any) => {
        console.log('🎉 [Socket.io] connectionSuccess received from server:', data);
      });

      this.socket.on('currentPlayers', (players: { [id: string]: { id: string; x: number; y: number; z: number; rotationY: number; color?: string; lives?: number; health?: number; isDowned?: boolean } }) => {
        console.log('👥 [Socket.io] currentPlayers received from server:', players);
        Object.keys(players).forEach((id) => {
          if (id !== this.socket?.id && !this.remotePlayers.has(id)) {
            this.addRemotePlayer(players[id]);
          }
        });
        this.updateOnlineStatus();
      });

      this.socket.on('newPlayer', (playerData: { id: string; x: number; y: number; z: number; rotationY: number; color?: string; lives?: number; health?: number; isDowned?: boolean }) => {
        console.log('👋 [Socket.io] newPlayer joined:', playerData);
        if (playerData.id !== this.socket?.id && !this.remotePlayers.has(playerData.id)) {
          this.addRemotePlayer(playerData);
          this.updateOnlineStatus();
        }
      });

      this.socket.on('playerMoved', (data: { id: string; x: number; y: number; z: number; rotationY: number }) => {
        const remote = this.remotePlayers.get(data.id);
        if (remote) {
          remote.targetPosition.set(data.x, data.y, data.z);
          remote.targetRotationY = data.rotationY;
        }
      });

      this.socket.on('playerShot', (data: { id: string; origin: { x: number; y: number; z: number }; direction: { x: number; y: number; z: number } }) => {
        this.shootProjectile(
          new Vector3(data.origin.x, data.origin.y, data.origin.z),
          new Vector3(data.direction.x, data.direction.y, data.direction.z),
          false
        );
      });

      // Handle teammate downed -> Show Easy 1-Click Summon Prompt on Screen!
      this.socket.on('playerStateChanged', (data: { id: string; lives: number; health: number; isDowned: boolean }) => {
        const remote = this.remotePlayers.get(data.id);
        if (remote) {
          remote.lives = data.lives;
          remote.health = data.health;
          remote.isDowned = data.isDowned;
          if (remote.isDowned) {
            remote.mesh.rotation.z = Math.PI / 2;
            if (remote.downedMarker) remote.downedMarker.isVisible = true;

            // Show 1-Click Summon Prompt for alive local player!
            if (!this.isDowned && this.isGameStarted) {
              this.downedTeammateId = data.id;
              this.rescuePromptBanner.isVisible = true;
              this.sounds.playPingAlert();
            }
          } else {
            remote.mesh.rotation.z = 0;
            if (remote.downedMarker) remote.downedMarker.isVisible = false;
            this.rescuePromptBanner.isVisible = false;
          }
        }
      });

      // Handle teammate summoned & revived
      this.socket.on('playerRevived', (data: { reviverId: string; targetId: string; spawnPos?: { x: number; y: number; z: number } }) => {
        if (data.targetId === this.socket?.id) {
          this.revivePlayer(data.spawnPos);
        } else {
          this.rescuePromptBanner.isVisible = false;
          this.downedTeammateId = null;
        }
      });

      this.socket.on('bossDamaged', (data: { damage: number; newHealth: number }) => {
        if (this.boss && this.boss.isAlive) {
          this.boss.health = Math.max(0, data.newHealth);
          this.updateBossHUD();
          if (this.boss.health <= 0) {
            this.triggerBossVictory();
          }
        }
      });

      this.socket.on('playerDisconnected', (id: string) => {
        console.log('🚪 [Socket.io] playerDisconnected:', id);
        const remote = this.remotePlayers.get(id);
        if (remote) {
          if (remote.label) remote.label.dispose();
          if (remote.downedMarker) remote.downedMarker.dispose();
          remote.mesh.dispose();
          this.remotePlayers.delete(id);
          this.updateOnlineStatus();
        }
        if (this.downedTeammateId === id) {
          this.rescuePromptBanner.isVisible = false;
          this.downedTeammateId = null;
        }
      });

      this.socket.on('connect_error', () => {
        this.isConnected = false;
        this.updateOnlineStatus();
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.updateOnlineStatus();
      });
    } catch (e) {
      console.warn('Socket.io error during connection:', e);
      this.isConnected = false;
      this.updateOnlineStatus();
    }
  }

  private addRemotePlayer(data: { id: string; x: number; y: number; z: number; rotationY: number; color?: string; lives?: number; health?: number; isDowned?: boolean }): void {
    const mesh = MeshBuilder.CreateCapsule(
      `remotePlayer_${data.id}`,
      { radius: 0.5, height: 1.8, tessellation: 16 },
      this.scene
    );
    mesh.position = new Vector3(data.x, data.y, data.z);

    const hexColor = data.color || '#00E5FF';
    const mat = new StandardMaterial(`matRemote_${data.id}`, this.scene);
    mat.diffuseColor = Color3.FromHexString(hexColor);
    mat.emissiveColor = Color3.FromHexString(hexColor).scale(0.3);
    mesh.material = mat;

    const headband = MeshBuilder.CreateTorus(`remoteHeadband_${data.id}`, { diameter: 0.85, thickness: 0.14 }, this.scene);
    headband.position = new Vector3(0, 0.45, 0);
    headband.rotation.x = Math.PI / 2;
    headband.parent = mesh;
    const hbMat = new StandardMaterial(`matHb_${data.id}`, this.scene);
    hbMat.emissiveColor = new Color3(1, 1, 1);
    headband.material = hbMat;

    const nameLabel = new TextBlock();
    nameLabel.text = `BRAWLER #${data.id.substring(0, 4).toUpperCase()}`;
    nameLabel.color = hexColor;
    nameLabel.fontSize = 14;
    nameLabel.fontFamily = 'Impact, sans-serif';
    this.uiTexture.addControl(nameLabel);
    nameLabel.linkWithMesh(mesh);
    nameLabel.linkOffsetY = -50;

    const downedMarker = new TextBlock();
    downedMarker.text = '⚠️ DOWNED (CLICK RESCUE TO SUMMON) ⚠️';
    downedMarker.color = '#ef4444';
    downedMarker.fontSize = 13;
    downedMarker.fontFamily = 'Impact, sans-serif';
    downedMarker.isVisible = Boolean(data.isDowned);
    this.uiTexture.addControl(downedMarker);
    downedMarker.linkWithMesh(mesh);
    downedMarker.linkOffsetY = -75;

    this.remotePlayers.set(data.id, {
      id: data.id,
      mesh,
      targetPosition: new Vector3(data.x, data.y, data.z),
      targetRotationY: data.rotationY || 0,
      label: nameLabel,
      downedMarker,
      color: hexColor,
      lives: data.lives || 3,
      health: data.health || 100,
      isDowned: Boolean(data.isDowned),
    });

    if (data.isDowned && !this.isDowned && this.isGameStarted) {
      this.downedTeammateId = data.id;
      this.rescuePromptBanner.isVisible = true;
    }
  }

  private updateOnlineStatus(): void {
    if (!this.onlineStatusText) return;
    if (this.isConnected) {
      const totalCount = this.remotePlayers.size + 1;
      this.onlineStatusText.text = `🟢 ONLINE: ${totalCount} BRAWLERS`;
      this.onlineStatusText.color = '#00FF66';
    } else {
      this.onlineStatusText.text = `⚪ SOLO PRACTICE`;
      this.onlineStatusText.color = '#94a3b8';
    }
  }

  // ==========================================
  // USER INTERFACE (BABYLON.GUI)
  // ==========================================
  private setupGUI(): void {
    this.uiTexture = AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, this.scene);

    // 1. TOP STATUS BAR CONTAINER
    const topBar = new Rectangle('topBar');
    topBar.width = '960px';
    topBar.height = '68px';
    topBar.cornerRadius = 14;
    topBar.color = '#38bdf8';
    topBar.thickness = 2;
    topBar.background = 'rgba(15, 23, 42, 0.88)';
    topBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    topBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    topBar.top = '12px';
    this.uiTexture.addControl(topBar);

    const topPanel = new StackPanel('topPanel');
    topPanel.isVertical = false;
    topPanel.height = '100%';
    topBar.addControl(topPanel);

    const titleText = new TextBlock('titleText', '⚡ STREET BRAWLER ⚡');
    titleText.color = '#facc15';
    titleText.fontSize = 17;
    titleText.fontFamily = 'Impact, sans-serif';
    titleText.width = '180px';
    titleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    titleText.paddingLeft = '12px';
    topPanel.addControl(titleText);

    // Player Health Bar (HP: 100 / 100)
    const hpTrack = new Rectangle('hpTrack');
    hpTrack.width = '160px';
    hpTrack.height = '24px';
    hpTrack.cornerRadius = 8;
    hpTrack.background = '#1e293b';
    hpTrack.color = '#475569';
    hpTrack.thickness = 1;
    topPanel.addControl(hpTrack);

    this.healthFill = new Rectangle('healthFill');
    this.healthFill.width = '100%';
    this.healthFill.height = '100%';
    this.healthFill.cornerRadius = 8;
    this.healthFill.background = '#22c55e';
    this.healthFill.thickness = 0;
    this.healthFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    hpTrack.addControl(this.healthFill);

    this.healthText = new TextBlock('healthText', 'HP: 100 / 100');
    this.healthText.color = '#ffffff';
    this.healthText.fontSize = 12;
    this.healthText.fontFamily = 'Impact, sans-serif';
    hpTrack.addControl(this.healthText);

    this.livesText = new TextBlock('livesText', 'LIVES: ❤️ ❤️ ❤️');
    this.livesText.color = '#22c55e';
    this.livesText.fontSize = 14;
    this.livesText.fontFamily = 'Impact, sans-serif';
    this.livesText.width = '150px';
    this.livesText.paddingLeft = '8px';
    topPanel.addControl(this.livesText);

    this.zoneBadge = new TextBlock('zoneBadge', 'ZONE 1: DOWNTOWN');
    this.zoneBadge.color = '#38bdf8';
    this.zoneBadge.fontSize = 14;
    this.zoneBadge.fontFamily = 'Impact, sans-serif';
    this.zoneBadge.width = '160px';
    topPanel.addControl(this.zoneBadge);

    const progressTrack = new Rectangle('progressTrack');
    progressTrack.width = '130px';
    progressTrack.height = '18px';
    progressTrack.cornerRadius = 9;
    progressTrack.background = '#334155';
    progressTrack.color = '#64748b';
    progressTrack.thickness = 1;
    topPanel.addControl(progressTrack);

    this.progressFill = new Rectangle('progressFill');
    this.progressFill.width = '0%';
    this.progressFill.height = '100%';
    this.progressFill.cornerRadius = 9;
    this.progressFill.background = '#38bdf8';
    this.progressFill.thickness = 0;
    this.progressFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    progressTrack.addControl(this.progressFill);

    this.progressPercentText = new TextBlock('progressText', '0%');
    this.progressPercentText.color = '#ffffff';
    this.progressPercentText.fontSize = 11;
    this.progressPercentText.fontFamily = 'sans-serif';
    progressTrack.addControl(this.progressPercentText);

    this.onlineStatusText = new TextBlock('onlineStatus', '⚪ SOLO PRACTICE');
    this.onlineStatusText.color = '#94a3b8';
    this.onlineStatusText.fontSize = 13;
    this.onlineStatusText.fontFamily = 'Impact, sans-serif';
    this.onlineStatusText.width = '140px';
    this.onlineStatusText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.onlineStatusText.paddingRight = '12px';
    topPanel.addControl(this.onlineStatusText);

    // 2. BOSS HEALTH BAR HUD
    this.bossHUD = new Rectangle('bossHUD');
    this.bossHUD.width = '540px';
    this.bossHUD.height = '52px';
    this.bossHUD.cornerRadius = 12;
    this.bossHUD.background = 'rgba(15, 23, 42, 0.95)';
    this.bossHUD.color = '#ef4444';
    this.bossHUD.thickness = 2;
    this.bossHUD.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.bossHUD.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.bossHUD.top = '88px';
    this.bossHUD.isVisible = false;
    this.uiTexture.addControl(this.bossHUD);

    const bossTrack = new Rectangle('bossTrack');
    bossTrack.width = '510px';
    bossTrack.height = '28px';
    bossTrack.cornerRadius = 8;
    bossTrack.background = '#1e293b';
    bossTrack.color = '#475569';
    bossTrack.thickness = 1;
    this.bossHUD.addControl(bossTrack);

    this.bossHealthFill = new Rectangle('bossHealthFill');
    this.bossHealthFill.width = '100%';
    this.bossHealthFill.height = '100%';
    this.bossHealthFill.cornerRadius = 8;
    this.bossHealthFill.background = '#ef4444';
    this.bossHealthFill.thickness = 0;
    this.bossHealthFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    bossTrack.addControl(this.bossHealthFill);

    this.bossHealthText = new TextBlock('bossHealthText', '👾 TITAN MECHA BOSS: 100 / 100 HP [TARGET LOCKED]');
    this.bossHealthText.color = '#ffffff';
    this.bossHealthText.fontSize = 14;
    this.bossHealthText.fontFamily = 'Impact, sans-serif';
    bossTrack.addControl(this.bossHealthText);

    // 3. ONE-CLICK RESCUE & SUMMON TEAMMATE PROMPT (Appears on Alive Player's Screen)
    this.rescuePromptBanner = new Rectangle('rescuePromptBanner');
    this.rescuePromptBanner.width = '560px';
    this.rescuePromptBanner.height = '100px';
    this.rescuePromptBanner.cornerRadius = 16;
    this.rescuePromptBanner.background = 'rgba(15, 23, 42, 0.96)';
    this.rescuePromptBanner.color = '#22c55e';
    this.rescuePromptBanner.thickness = 3;
    this.rescuePromptBanner.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.rescuePromptBanner.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.rescuePromptBanner.top = '150px';
    this.rescuePromptBanner.isVisible = false;
    this.uiTexture.addControl(this.rescuePromptBanner);

    const rescueStack = new StackPanel('rescueStack');
    this.rescuePromptBanner.addControl(rescueStack);

    const rescueTitle = new TextBlock('rescueTitle', '⚠️ YOUR FRIEND IS DOWN! DO YOU WANT TO SUMMON THEM? ⚠️');
    rescueTitle.height = '32px';
    rescueTitle.color = '#facc15';
    rescueTitle.fontSize = 15;
    rescueTitle.fontFamily = 'Impact, sans-serif';
    rescueStack.addControl(rescueTitle);

    this.rescuePromptBtn = Button.CreateSimpleButton('rescuePromptBtn', '💖 YES! SUMMON & REVIVE FRIEND TO MY SIDE (CLICK / TAP) 💖');
    this.rescuePromptBtn.width = '520px';
    this.rescuePromptBtn.height = '48px';
    this.rescuePromptBtn.cornerRadius = 12;
    this.rescuePromptBtn.background = '#22c55e';
    this.rescuePromptBtn.color = '#ffffff';
    this.rescuePromptBtn.fontSize = 16;
    this.rescuePromptBtn.fontFamily = 'Impact, sans-serif';
    this.rescuePromptBtn.top = '4px';
    this.rescuePromptBtn.onPointerUpObservable.add(() => {
      if (this.downedTeammateId) {
        this.summonAndReviveTeammate(this.downedTeammateId);
      }
    });
    rescueStack.addControl(this.rescuePromptBtn);

    // K.O. BANNER
    this.koBanner = new Rectangle('koBanner');
    this.koBanner.width = '520px';
    this.koBanner.height = '60px';
    this.koBanner.cornerRadius = 12;
    this.koBanner.background = 'rgba(225, 29, 72, 0.95)';
    this.koBanner.color = '#ffffff';
    this.koBanner.thickness = 2;
    this.koBanner.isVisible = false;
    this.uiTexture.addControl(this.koBanner);

    this.koBannerText = new TextBlock('koBannerText', '💥 K.O.! RESPAWNING AT CHECKPOINT 💥');
    this.koBannerText.color = '#ffffff';
    this.koBannerText.fontSize = 15;
    this.koBannerText.fontFamily = 'Impact, sans-serif';
    this.koBanner.addControl(this.koBannerText);

    // DOWNED OVERLAY BANNER (On Dead Player's Screen)
    this.downedBanner = new Rectangle('downedBanner');
    this.downedBanner.width = '540px';
    this.downedBanner.height = '180px';
    this.downedBanner.cornerRadius = 18;
    this.downedBanner.background = 'rgba(15, 23, 42, 0.97)';
    this.downedBanner.color = '#ef4444';
    this.downedBanner.thickness = 3;
    this.downedBanner.isVisible = false;
    this.uiTexture.addControl(this.downedBanner);

    const downedStack = new StackPanel('downedStack');
    this.downedBanner.addControl(downedStack);

    this.downedBannerText = new TextBlock('downedBannerText', '💀 YOU ARE OUT OF LIVES! 💀');
    this.downedBannerText.height = '42px';
    this.downedBannerText.color = '#ef4444';
    this.downedBannerText.fontSize = 20;
    this.downedBannerText.fontFamily = 'Impact, sans-serif';
    downedStack.addControl(this.downedBannerText);

    const downedDesc = new TextBlock('downedDesc', '⏳ Waiting for your teammate to summon you to their side...');
    downedDesc.height = '30px';
    downedDesc.color = '#38bdf8';
    downedDesc.fontSize = 14;
    downedStack.addControl(downedDesc);

    const soloRespawnBtn = Button.CreateSimpleButton('soloRespawnBtn', '⚡ RESPAWN AT CHECKPOINT NOW (FULL HP & 3 LIVES) ⚡');
    soloRespawnBtn.width = '480px';
    soloRespawnBtn.height = '48px';
    soloRespawnBtn.cornerRadius = 12;
    soloRespawnBtn.background = '#e11d48';
    soloRespawnBtn.color = '#ffffff';
    soloRespawnBtn.fontSize = 15;
    soloRespawnBtn.fontFamily = 'Impact, sans-serif';
    soloRespawnBtn.top = '10px';
    soloRespawnBtn.onPointerUpObservable.add(() => {
      this.revivePlayer();
    });
    downedStack.addControl(soloRespawnBtn);

    this.fallCountText = new TextBlock('fallCount', 'KOs: 0');
    this.fallCountText.color = '#f43f5e';
    this.fallCountText.fontSize = 14;
    this.fallCountText.fontFamily = 'Impact, sans-serif';
    this.fallCountText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.fallCountText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.fallCountText.top = '90px';
    this.fallCountText.left = '-30px';
    this.uiTexture.addControl(this.fallCountText);

    // 4. MOBILE TOUCH CONTROLS
    this.setupMobileTouchControls();

    // 5. VICTORY MODAL
    this.setupVictoryModal();

    // 6. LOBBY OVERLAY
    this.createLobbyUI();
  }

  private setupMobileTouchControls(): void {
    const touchZoneLeft = new Rectangle('touchZoneLeft');
    touchZoneLeft.width = '48%';
    touchZoneLeft.height = '70%';
    touchZoneLeft.thickness = 0;
    touchZoneLeft.background = 'transparent';
    touchZoneLeft.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    touchZoneLeft.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.uiTexture.addControl(touchZoneLeft);

    const joystickBase = new Rectangle('joystickBase');
    joystickBase.width = '200px';
    joystickBase.height = '200px';
    joystickBase.cornerRadius = 100;
    joystickBase.background = 'rgba(15, 23, 42, 0.7)';
    joystickBase.color = 'rgba(56, 189, 248, 0.7)';
    joystickBase.thickness = 3;
    joystickBase.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    joystickBase.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    joystickBase.left = '40px';
    joystickBase.top = '-35px';
    this.uiTexture.addControl(joystickBase);

    const addDirLabel = (txt: string, top: string, left: string) => {
      const lbl = new TextBlock(`dir_${txt}`, txt);
      lbl.color = 'rgba(56, 189, 248, 0.9)';
      lbl.fontSize = 20;
      lbl.fontFamily = 'Impact, sans-serif';
      lbl.top = top;
      lbl.left = left;
      joystickBase.addControl(lbl);
    };
    addDirLabel('▲', '-68px', '0px');
    addDirLabel('▼', '68px', '0px');
    addDirLabel('◀', '0px', '-68px');
    addDirLabel('▶', '0px', '68px');

    const thumbKnob = new Rectangle('thumbKnob');
    thumbKnob.width = '80px';
    thumbKnob.height = '80px';
    thumbKnob.cornerRadius = 40;
    thumbKnob.background = 'rgba(56, 189, 248, 0.85)';
    thumbKnob.color = '#ffffff';
    thumbKnob.thickness = 2;
    joystickBase.addControl(thumbKnob);

    const knobLabel = new TextBlock('knobLabel', '🕹️');
    knobLabel.fontSize = 22;
    thumbKnob.addControl(knobLabel);

    let isTouching = false;
    let originX = 0;
    let originY = 0;
    const maxRadius = 70;

    const handlePointerDown = (coords: { x: number; y: number }) => {
      isTouching = true;
      originX = coords.x;
      originY = coords.y;
      thumbKnob.background = 'rgba(250, 204, 21, 0.95)';
      handlePointerMove(coords);
    };

    const handlePointerMove = (coords: { x: number; y: number }) => {
      if (!isTouching) return;

      const deltaX = coords.x - originX;
      const deltaY = coords.y - originY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist > 0) {
        const clampedDist = Math.min(dist, maxRadius);
        const normX = deltaX / dist;
        const normY = deltaY / dist;

        thumbKnob.left = `${normX * clampedDist}px`;
        thumbKnob.top = `${normY * clampedDist}px`;

        const strength = Math.min(1.0, dist / 15);
        this.touchMoveX = normX * strength;
        this.touchMoveZ = -normY * strength;
      }
    };

    const handlePointerUp = () => {
      isTouching = false;
      this.touchMoveX = 0;
      this.touchMoveZ = 0;
      thumbKnob.left = '0px';
      thumbKnob.top = '0px';
      thumbKnob.background = 'rgba(56, 189, 248, 0.85)';
    };

    touchZoneLeft.onPointerDownObservable.add((coords) => handlePointerDown(coords));
    touchZoneLeft.onPointerMoveObservable.add((coords) => handlePointerMove(coords));
    touchZoneLeft.onPointerUpObservable.add(() => handlePointerUp());
    touchZoneLeft.onPointerOutObservable.add(() => handlePointerUp());

    joystickBase.onPointerDownObservable.add((coords) => handlePointerDown(coords));
    joystickBase.onPointerMoveObservable.add((coords) => handlePointerMove(coords));
    joystickBase.onPointerUpObservable.add(() => handlePointerUp());
    joystickBase.onPointerOutObservable.add(() => handlePointerUp());

    const actionContainer = new Rectangle('actionContainer');
    actionContainer.width = '250px';
    actionContainer.height = '150px';
    actionContainer.thickness = 0;
    actionContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    actionContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    actionContainer.left = '-25px';
    actionContainer.top = '-25px';
    this.uiTexture.addControl(actionContainer);

    const jumpBtn = Button.CreateSimpleButton('touchJumpBtn', '⚡ JUMP');
    jumpBtn.width = '100px';
    jumpBtn.height = '100px';
    jumpBtn.cornerRadius = 50;
    jumpBtn.background = 'rgba(34, 197, 94, 0.9)';
    jumpBtn.color = '#ffffff';
    jumpBtn.thickness = 3;
    jumpBtn.fontSize = 18;
    jumpBtn.fontFamily = 'Impact, sans-serif';
    jumpBtn.left = '60px';
    jumpBtn.top = '-10px';
    jumpBtn.onPointerDownObservable.add(() => {
      if (this.isGameStarted && !this.isRespawning && !this.isDowned) {
        this.performJump();
      }
    });
    actionContainer.addControl(jumpBtn);

    const fireBtn = Button.CreateSimpleButton('touchFireBtn', '🔥 FIRE');
    fireBtn.width = '90px';
    fireBtn.height = '90px';
    fireBtn.cornerRadius = 45;
    fireBtn.background = 'rgba(239, 68, 68, 0.9)';
    fireBtn.color = '#ffffff';
    fireBtn.thickness = 3;
    fireBtn.fontSize = 17;
    fireBtn.fontFamily = 'Impact, sans-serif';
    fireBtn.left = '-60px';
    fireBtn.top = '10px';
    fireBtn.onPointerDownObservable.add(() => {
      if (this.isGameStarted && !this.isRespawning && !this.isDowned && this.canShoot) {
        this.shootProjectile();
      }
    });
    actionContainer.addControl(fireBtn);
  }

  private setupVictoryModal(): void {
    this.winModal = new Rectangle('winModal');
    this.winModal.width = '540px';
    this.winModal.height = '390px';
    this.winModal.cornerRadius = 24;
    this.winModal.background = 'rgba(15, 23, 42, 0.97)';
    this.winModal.color = '#facc15';
    this.winModal.thickness = 3;
    this.winModal.isVisible = false;
    this.uiTexture.addControl(this.winModal);

    const winStack = new StackPanel('winStack');
    this.winModal.addControl(winStack);

    this.winHeader = new TextBlock('winHeader', '🏆 VICTORY - MISSION COMPLETE! 🏆');
    this.winHeader.height = '55px';
    this.winHeader.color = '#facc15';
    this.winHeader.fontSize = 25;
    this.winHeader.fontFamily = 'Impact, sans-serif';
    winStack.addControl(this.winHeader);

    this.winSub = new TextBlock('winSub', '👾 TITAN MECHA ANNIHILATED • CITY SAVED!');
    this.winSub.height = '28px';
    this.winSub.color = '#38bdf8';
    this.winSub.fontSize = 15;
    this.winSub.fontFamily = 'Impact, sans-serif';
    winStack.addControl(this.winSub);

    this.winTimeText = new TextBlock('winTimeText', '⏱️ TIME: 00:00');
    this.winTimeText.height = '34px';
    this.winTimeText.color = '#ffffff';
    this.winTimeText.fontSize = 17;
    winStack.addControl(this.winTimeText);

    this.winFallsText = new TextBlock('winFallsText', '💥 TOTAL KOs: 0');
    this.winFallsText.height = '34px';
    this.winFallsText.color = '#f43f5e';
    this.winFallsText.fontSize = 17;
    winStack.addControl(this.winFallsText);

    this.winCountdownText = new TextBlock('winCountdownText', '🔄 RETURNING TO LOBBY IN: 6s');
    this.winCountdownText.height = '34px';
    this.winCountdownText.color = '#facc15';
    this.winCountdownText.fontSize = 15;
    this.winCountdownText.fontFamily = 'Impact, sans-serif';
    winStack.addControl(this.winCountdownText);

    const lobbyBtn = Button.CreateSimpleButton('returnLobbyBtn', '🏠 RETURN TO LOBBY NOW');
    lobbyBtn.width = '260px';
    lobbyBtn.height = '50px';
    lobbyBtn.color = '#ffffff';
    lobbyBtn.cornerRadius = 14;
    lobbyBtn.background = '#0284c7';
    lobbyBtn.fontSize = 17;
    lobbyBtn.fontFamily = 'Impact, sans-serif';
    lobbyBtn.top = '12px';
    lobbyBtn.onPointerUpObservable.add(() => {
      this.returnToLobby();
    });
    winStack.addControl(lobbyBtn);
  }

  private createLobbyUI(): void {
    this.lobbyModal = new Rectangle('lobbyModal');
    this.lobbyModal.width = '520px';
    this.lobbyModal.height = '390px';
    this.lobbyModal.cornerRadius = 24;
    this.lobbyModal.background = 'rgba(15, 23, 42, 0.96)';
    this.lobbyModal.color = '#38bdf8';
    this.lobbyModal.thickness = 3;
    this.lobbyModal.isVisible = true;
    this.uiTexture.addControl(this.lobbyModal);

    const lobbyStack = new StackPanel('lobbyStack');
    this.lobbyModal.addControl(lobbyStack);

    const lobbyTitle = new TextBlock('lobbyTitle', '⚡ STREET BRAWLER RUN ⚡');
    lobbyTitle.height = '65px';
    lobbyTitle.color = '#facc15';
    lobbyTitle.fontSize = 28;
    lobbyTitle.fontFamily = 'Impact, sans-serif';
    lobbyStack.addControl(lobbyTitle);

    const lobbySub = new TextBlock('lobbySub', 'SUNSET ROOFTOP & CO-OP BOSS BRAWL');
    lobbySub.height = '30px';
    lobbySub.color = '#38bdf8';
    lobbySub.fontSize = 16;
    lobbySub.fontFamily = 'Impact, sans-serif';
    lobbyStack.addControl(lobbySub);

    const lobbyDesc = new TextBlock('lobbyDesc', '• 100 HP Health Bar (5 Hits per Life) & 3 Lives\n• 1-Click Instant Friend Rescue: Summon friend right to your side!\n• Dodge Boss Plasma & Smart Auto-Aim Fireballs!');
    lobbyDesc.height = '75px';
    lobbyDesc.color = '#cbd5e1';
    lobbyDesc.fontSize = 13;
    lobbyDesc.fontFamily = 'sans-serif';
    lobbyDesc.textWrapping = true;
    lobbyStack.addControl(lobbyDesc);

    const controlsHint = new TextBlock('controlsHint', '🎮 [WASD/D-Pad] Move • [SPACE/JUMP] Jump • [F/FIRE] Shoot');
    controlsHint.height = '35px';
    controlsHint.color = '#f59e0b';
    controlsHint.fontSize = 13;
    controlsHint.fontFamily = 'Impact, sans-serif';
    lobbyStack.addControl(controlsHint);

    const startBtn = Button.CreateSimpleButton('startGameBtn', '⚡ START GAME ⚡');
    startBtn.width = '240px';
    startBtn.height = '54px';
    startBtn.color = '#0f172a';
    startBtn.cornerRadius = 14;
    startBtn.background = '#38bdf8';
    startBtn.fontSize = 20;
    startBtn.fontFamily = 'Impact, sans-serif';
    startBtn.top = '15px';

    startBtn.onPointerUpObservable.add(() => {
      console.log('🚀 [Lobby] Starting game and connecting to socket server...');
      this.lobbyModal.isVisible = false;
      this.isGameStarted = true;
      this.startTime = Date.now();
      this.connectMultiplayer();
    });
    lobbyStack.addControl(startBtn);
  }

  // ==========================================
  // 5. BOSS DAMAGE & EPIC VICTORY SEQUENCE
  // ==========================================
  private damageBoss(amount: number): void {
    if (!this.boss || !this.boss.isAlive) return;

    this.boss.health = Math.max(0, this.boss.health - amount);
    this.sounds.playHit();
    this.updateBossHUD();

    const bMat = this.boss.mesh.material as StandardMaterial;
    if (bMat) {
      const origDiff = bMat.diffuseColor.clone();
      const origEmiss = bMat.emissiveColor.clone();
      bMat.diffuseColor = new Color3(1.0, 0.2, 0.2);
      bMat.emissiveColor = new Color3(1.0, 0.6, 0.6);
      setTimeout(() => {
        if (this.boss && this.boss.mesh && !this.boss.mesh.isDisposed()) {
          bMat.diffuseColor = origDiff;
          bMat.emissiveColor = origEmiss;
        }
      }, 180);
    }

    this.hitParticles.emitter = this.boss.mesh.position.clone().add(new Vector3(0, 0, -1.0));
    this.hitParticles.manualEmitCount = 35;
    this.hitParticles.start();

    if (this.socket && this.isConnected) {
      this.socket.emit('bossDamage', {
        damage: amount,
        newHealth: this.boss.health,
      });
    }

    if (this.boss.health <= 0) {
      this.triggerBossVictory();
    }
  }

  private updateBossHUD(): void {
    const pct = Math.max(0, (this.boss.health / this.boss.maxHealth) * 100);
    this.bossHealthFill.width = `${pct}%`;
    this.bossHealthText.text = `👾 TITAN MECHA BOSS: ${this.boss.health} / ${this.boss.maxHealth} HP [TARGET LOCKED]`;
  }

  private triggerBossVictory(): void {
    if (this.hasWon || !this.boss || !this.boss.isAlive) return;
    this.hasWon = true;
    this.boss.isAlive = false;

    this.cameraShakeTimer = 1.2;
    this.sounds.playBossExplosion();

    this.hitParticles.emitter = this.boss.leftWing.getAbsolutePosition();
    this.hitParticles.manualEmitCount = 80;
    this.hitParticles.start();

    setTimeout(() => {
      if (this.boss && this.boss.rightWing && !this.boss.rightWing.isDisposed()) {
        this.hitParticles.emitter = this.boss.rightWing.getAbsolutePosition();
        this.hitParticles.manualEmitCount = 80;
        this.hitParticles.start();
      }
    }, 300);

    setTimeout(() => {
      if (this.boss && this.boss.mesh && !this.boss.mesh.isDisposed()) {
        this.bossExplosionParticles.emitter = this.boss.mesh.position.clone();
        this.bossExplosionParticles.manualEmitCount = 300;
        this.bossExplosionParticles.start();

        this.boss.mesh.dispose();
      }
      if (this.bossGateMesh && !this.bossGateMesh.isDisposed()) {
        this.bossGateMesh.dispose();
      }
      this.bossHUD.isVisible = false;
    }, 600);

    setTimeout(() => {
      this.sounds.playVictory();
      this.victoryParticles.start();

      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
      const secs = (elapsedSeconds % 60).toString().padStart(2, '0');

      this.winTimeText.text = `⏱️ TIME: ${mins}:${secs}`;
      this.winFallsText.text = `💥 TOTAL KOs: ${this.fallCount}`;
      this.winModal.isVisible = true;

      let countdown = 6;
      this.winCountdownText.text = `🔄 RETURNING TO LOBBY IN: ${countdown}s`;
      if (this.lobbyReturnTimer) clearInterval(this.lobbyReturnTimer);
      this.lobbyReturnTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          this.winCountdownText.text = `🔄 RETURNING TO LOBBY IN: ${countdown}s`;
        } else {
          clearInterval(this.lobbyReturnTimer);
          this.returnToLobby();
        }
      }, 1000);
    }, 1000);

    console.log('🏆 [Victory] Titan Mecha Boss destroyed! Victory Gate opened! Returning to lobby in 6s...');
  }

  private returnToLobby(): void {
    if (this.lobbyReturnTimer) {
      clearInterval(this.lobbyReturnTimer);
      this.lobbyReturnTimer = null;
    }

    this.hasWon = false;
    this.winModal.isVisible = false;
    this.victoryParticles.stop();
    this.startTime = Date.now();
    this.fallCount = 0;
    this.fallCountText.text = 'KOs: 0';
    this.health = this.maxHealth;
    this.lives = 3;
    this.isDowned = false;
    this.isRespawning = false;
    this.isGameStarted = false;
    this.currentCheckpoint = START_POSITION.clone();

    this.projectiles.forEach((p) => p.mesh.dispose());
    this.projectiles = [];
    this.bossProjectiles.forEach((bp) => bp.mesh.dispose());
    this.bossProjectiles = [];

    this.createBossMonster();
    this.createVictoryGate();

    this.playerAggregate.body.disablePreStep = false;
    this.playerAggregate.body.setLinearVelocity(Vector3.Zero());
    this.playerAggregate.body.setAngularVelocity(Vector3.Zero());
    this.playerMesh.rotation.z = 0;
    this.playerMesh.position.set(START_POSITION.x, START_POSITION.y, START_POSITION.z);
    this.playerAggregate.body.transformNode.position.set(START_POSITION.x, START_POSITION.y, START_POSITION.z);

    this.updateHUD();
    this.lobbyModal.isVisible = true;
    console.log('🏠 [Lobby] Returned to Lobby successfully!');
  }

  // ==========================================
  // MAIN RENDER LOOP & PER-FRAME UPDATES
  // ==========================================
  private setupGameLoop(): void {
    let lastTime = performance.now();

    this.scene.onBeforeRenderObservable.add(() => {
      const now = performance.now();
      const deltaSec = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const timeSec = now / 1000;

      // 1. Update Animated Moving Platforms
      this.movingPlatforms.forEach((p) => {
        const prevX = p.mesh.position.x;
        const prevZ = p.mesh.position.z;

        const offset = Math.sin(timeSec * p.speed) * p.distance;
        const targetX = p.axis === 'x' ? p.center.x + offset : p.center.x;
        const targetZ = p.axis === 'z' ? p.center.z + offset : p.center.z;

        const dx = targetX - prevX;
        const dz = targetZ - prevZ;
        p.delta.set(dx, 0, dz);

        if (deltaSec > 0) {
          p.velocity.set(dx / deltaSec, 0, dz / deltaSec);
        }

        p.mesh.position.set(targetX, p.center.y, targetZ);
        p.aggregate.body.transformNode.position.set(targetX, p.center.y, targetZ);
        p.aggregate.body.setLinearVelocity(p.velocity);
      });

      // 2. Update Rotating Pipe Obstacles
      this.rotatingObstacles.forEach((r) => {
        r.mesh.rotation.y += r.speed * deltaSec;
        r.aggregate.body.transformNode.rotationQuaternion = Quaternion.FromEulerAngles(
          r.mesh.rotation.x,
          r.mesh.rotation.y,
          r.mesh.rotation.z
        );
      });

      // 3. Update Boss Animation & Attacks
      if (this.boss && this.boss.isAlive) {
        const bossHover = Math.sin(timeSec * 2.0) * 0.8;
        const bossSway = Math.sin(timeSec * 1.2) * 5.0;
        this.boss.mesh.position.set(bossSway, 8.5 + bossHover, BOSS_ARENA_Z + 4);

        if (this.isGameStarted && this.playerMesh.position.z >= 140 && !this.isRespawning && !this.isDowned) {
          if (now - this.lastBossAttackTime > 2400) {
            this.lastBossAttackTime = now;
            this.triggerBossAttack();
          }
        }
      }

      // 4. Update Projectiles (Player & Boss)
      this.updateProjectiles(deltaSec);
      this.updateBossProjectiles(deltaSec);

      // 5. Update Player Physics, Movement & Checkpoints
      this.updatePlayer(deltaSec);

      // 6. Update Camera
      this.updateCamera(deltaSec);

      // 7. Update HUD Metrics
      this.updateHUD();

      // 8. Interpolate Remote Players
      this.updateRemotePlayers(deltaSec);

      // 9. Network Position Broadcast (Throttled ~30fps)
      if (this.isGameStarted && this.socket && this.isConnected && now - this.lastEmitTime > 32) {
        this.lastEmitTime = now;
        this.socket.emit('playerMovement', {
          x: Number(this.playerMesh.position.x.toFixed(3)),
          y: Number(this.playerMesh.position.y.toFixed(3)),
          z: Number(this.playerMesh.position.z.toFixed(3)),
          rotationY: Number(this.playerMesh.rotation.y.toFixed(3)),
        });
      }
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private updateProjectiles(deltaSec: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.mesh.position.addInPlace(proj.velocity.scale(deltaSec));
      proj.lifeTime -= deltaSec;

      if (this.boss && this.boss.isAlive) {
        const dist = Vector3.Distance(proj.mesh.position, this.boss.mesh.position);
        const isHit = dist < 5.5 || this.boss.mesh.intersectsMesh(proj.mesh, true) || this.boss.coreMesh.intersectsMesh(proj.mesh, true);
        if (isHit) {
          if (proj.isLocal) {
            this.damageBoss(25);
          }
          proj.mesh.dispose();
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (proj.lifeTime <= 0) {
        proj.mesh.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updatePlayer(deltaSec: number): void {
    if (this.isRespawning || this.isDowned) {
      if (this.isRespawning) {
        const safePos = this.currentCheckpoint.clone();
        safePos.y += 2.0;
        this.playerAggregate.body.disablePreStep = false;
        this.playerMesh.position.copyFrom(safePos);
        this.playerAggregate.body.transformNode.position.copyFrom(safePos);
      }
      this.playerAggregate.body.setLinearVelocity(Vector3.Zero());
      this.playerAggregate.body.setAngularVelocity(Vector3.Zero());
      return;
    }

    const playerPos = this.playerMesh.position;

    // Check Danger Fall into water (Y < -6.0)
    if (playerPos.y < DANGER_ZONE_Y) {
      this.playerHitOrFall(true);
      return;
    }

    if (!this.isGameStarted) return;

    // Downward Raycast for Ground Collision
    const ray = new Ray(playerPos, new Vector3(0, -1, 0), 1.25);
    const hit = this.scene.pickWithRay(ray, (mesh) => mesh !== this.playerMesh && mesh.isPickable);

    let activePlatform: MovingPlatform | null = null;
    if (hit && hit.hit && hit.pickedMesh) {
      activePlatform = this.movingPlatforms.find((p) => p.mesh === hit.pickedMesh) || null;
    }

    if (!activePlatform) {
      for (const p of this.movingPlatforms) {
        const pBox = p.mesh.getBoundingInfo().boundingBox;
        if (
          playerPos.x >= pBox.minimumWorld.x - 0.4 &&
          playerPos.x <= pBox.maximumWorld.x + 0.4 &&
          playerPos.z >= pBox.minimumWorld.z - 0.4 &&
          playerPos.z <= pBox.maximumWorld.z + 0.4 &&
          playerPos.y >= pBox.maximumWorld.y - 0.3 &&
          playerPos.y <= pBox.maximumWorld.y + 1.6
        ) {
          activePlatform = p;
          break;
        }
      }
    }

    const currentVel = this.playerAggregate.body.getLinearVelocity();
    this.isGrounded = Boolean(hit && hit.hit) || Boolean(activePlatform) || Math.abs(currentVel.y) < 0.25;

    // Player-Player Elastic Collision & Push
    this.remotePlayers.forEach((remote) => {
      if (!remote.isDowned) {
        const diff = playerPos.subtract(remote.mesh.position);
        diff.y = 0;
        const dist = diff.length();
        const minDistance = 1.1;
        if (dist < minDistance && dist > 0.001) {
          const overlap = minDistance - dist;
          const normal = diff.normalize();
          const pushForce = Math.min(overlap * 12.0, 5.0);

          playerPos.addInPlace(normal.scale(overlap * 0.5));
          this.playerAggregate.body.transformNode.position.addInPlace(normal.scale(overlap * 0.5));

          const curV = this.playerAggregate.body.getLinearVelocity();
          this.playerAggregate.body.setLinearVelocity(
            new Vector3(curV.x + normal.x * pushForce, curV.y, curV.z + normal.z * pushForce)
          );
        }
      }
    });

    // Input Movement
    let moveX = this.touchMoveX;
    let moveZ = this.touchMoveZ;

    if (this.inputKeys['KeyW'] || this.inputKeys['ArrowUp']) moveZ += 1;
    if (this.inputKeys['KeyS'] || this.inputKeys['ArrowDown']) moveZ -= 1;
    if (this.inputKeys['KeyA'] || this.inputKeys['ArrowLeft']) moveX -= 1;
    if (this.inputKeys['KeyD'] || this.inputKeys['ArrowRight']) moveX += 1;

    const moveVector = new Vector3(moveX, 0, moveZ);
    const moveSpeed = 9.0;

    const platformVx = activePlatform ? activePlatform.velocity.x : 0;
    const platformVz = activePlatform ? activePlatform.velocity.z : 0;

    if (moveVector.lengthSquared() > 0) {
      moveVector.normalize();
      const targetVx = moveVector.x * moveSpeed + platformVx;
      const targetVz = moveVector.z * moveSpeed + platformVz;

      const lerpFactor = this.isGrounded ? 16.0 : 6.0;
      const newVx = currentVel.x + (targetVx - currentVel.x) * Math.min(1.0, lerpFactor * deltaSec);
      const newVz = currentVel.z + (targetVz - currentVel.z) * Math.min(1.0, lerpFactor * deltaSec);

      this.playerAggregate.body.setLinearVelocity(new Vector3(newVx, currentVel.y, newVz));

      const targetRotationY = Math.atan2(moveVector.x, moveVector.z);
      this.playerMesh.rotation.y = targetRotationY;
    } else if (this.isGrounded) {
      if (activePlatform) {
        this.playerAggregate.body.setLinearVelocity(
          new Vector3(platformVx, currentVel.y, platformVz)
        );
      } else {
        this.playerAggregate.body.setLinearVelocity(
          new Vector3(currentVel.x * 0.75, currentVel.y, currentVel.z * 0.75)
        );
      }
    }

    this.playerLight.position.set(playerPos.x, playerPos.y + 1.8, playerPos.z);
  }

  private updateCamera(deltaSec: number): void {
    const playerPos = this.playerMesh.position;
    let targetCamPos = new Vector3(
      playerPos.x * 0.6,
      playerPos.y + 4.5,
      playerPos.z - 8.5
    );

    if (this.cameraShakeTimer > 0) {
      this.cameraShakeTimer -= deltaSec;
      const shakeMag = this.cameraShakeTimer * 0.6;
      targetCamPos.x += (Math.random() - 0.5) * shakeMag;
      targetCamPos.y += (Math.random() - 0.5) * shakeMag;
      targetCamPos.z += (Math.random() - 0.5) * shakeMag;
    }

    this.camera.position = Vector3.Lerp(this.camera.position, targetCamPos, 0.1);

    const lookTarget = new Vector3(playerPos.x, playerPos.y + 1.2, playerPos.z + 1.5);
    this.camera.setTarget(Vector3.Lerp(this.camera.getTarget(), lookTarget, 0.15));
  }

  private updateHUD(): void {
    const playerZ = this.playerMesh.position.z;

    const hpPct = Math.max(0, Math.min(100, (this.health / this.maxHealth) * 100));
    this.healthFill.width = `${hpPct}%`;
    this.healthFill.background = this.health > 50 ? '#22c55e' : this.health > 20 ? '#f59e0b' : '#ef4444';
    this.healthText.text = `HP: ${this.health} / ${this.maxHealth}`;

    let hearts = '';
    for (let i = 0; i < this.maxLives; i++) {
      hearts += i < this.lives ? '❤️ ' : '🖤 ';
    }
    this.livesText.text = `LIVES: ${hearts.trim()}`;
    this.livesText.color = this.lives > 1 ? '#22c55e' : this.lives === 1 ? '#f59e0b' : '#ef4444';

    const progress = Math.max(0, Math.min(100, Math.round((playerZ / LEVEL_GOAL_Z) * 100)));
    this.progressFill.width = `${progress}%`;
    this.progressPercentText.text = `${progress}%`;

    if (playerZ < 50) {
      this.zoneBadge.text = 'ZONE 1: DOWNTOWN';
      this.zoneBadge.color = '#38bdf8';
    } else if (playerZ < 100) {
      this.zoneBadge.text = 'ZONE 2: HIGHRISE';
      this.zoneBadge.color = '#facc15';
      if (this.currentCheckpoint.z < 52) {
        this.currentCheckpoint = new Vector3(0, 3.5, 52);
      }
    } else if (playerZ < 154) {
      this.zoneBadge.text = 'ZONE 3: ROOFTOPS';
      this.zoneBadge.color = '#ec4899';
      if (this.currentCheckpoint.z < 94) {
        this.currentCheckpoint = new Vector3(0, 4.5, 94);
      }
    } else if (playerZ < 205) {
      this.zoneBadge.text = '🔥 BOSS ARENA 🔥';
      this.zoneBadge.color = '#ef4444';
      if (this.currentCheckpoint.z < 154) {
        this.currentCheckpoint = new Vector3(0, 5.5, 154);
      }
      if (this.boss && this.boss.isAlive) {
        this.bossHUD.isVisible = true;
      }
    } else {
      this.zoneBadge.text = '🏆 CHAMPION PODIUM';
      this.zoneBadge.color = '#4ade80';
      this.bossHUD.isVisible = false;
    }
  }

  private updateRemotePlayers(deltaSec: number): void {
    this.remotePlayers.forEach((remote) => {
      remote.mesh.position = Vector3.Lerp(remote.mesh.position, remote.targetPosition, Math.min(1.0, 15 * deltaSec));
      remote.mesh.rotation.y = remote.mesh.rotation.y + (remote.targetRotationY - remote.mesh.rotation.y) * Math.min(1.0, 15 * deltaSec);
    });
  }
}

// Start Game
new StreetBrawlerGame();

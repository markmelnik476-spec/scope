import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Search, 
  Map, 
  BookOpen, 
  Compass, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 

  Edit, 
  X, 
  Globe, 
  Info,
  HelpCircle,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Sliders,
  Move,
  Orbit,
  Save,
  Upload,
  Brain,
  Plus,
  Lock,
  Unlock,
  LayoutGrid,
  Check,
  Zap,
  Expand,
  ZapOff,
  Sparkles,
  Circle
} from 'lucide-react';
import { useTerms } from './hooks/useTerms';
import { ClusterData, Subtopic, DetailTopic } from './data/archiveData';
import { clusterDescriptions } from './data/clusterDescriptions';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { DebugPanel, debugLog } from './DebugPanel';

import { getClusterTitleStyle, getSubtopicStyle } from './utils/hierarchy';

const PRESET_COLORS = [
  { value: "#ffffff", label: "⚪ Чистый Свет" },
  { value: "#94a3b8", label: "🔘 Серый Титан" },
  { value: "#ef4444", label: "🔴 Красный Карлик" },
  { value: "#f97316", label: "🟠 Оранжевое Пламя" },
  { value: "#f59e0b", label: "🟡 Солнечный Янтарь" },
  { value: "#eab308", label: "✨ Золотая Аура" },
  { value: "#22c55e", label: "🟢 Изумрудная Матрица" },
  { value: "#06b6d4", label: "🩵 Голубой Эфир" },
  { value: "#3b82f6", label: "🔵 Кобальтовая Синь" },
  { value: "#6366f1", label: "🌌 Индиго" },
  { value: "#a855f7", label: "🟣 Акаша" },
  { value: "#d946ef", label: "🩷 Кибер-Розовый" },
  { value: "#f43f5e", label: "💥 Рубиново-Алый" },
  { value: "#1e293b", label: "🌑 Бездна" }
];

const shortenTextCache: Record<string, string> = {};

function shortenText(text: string): string {
  if (!text) return text;
  const cached = shortenTextCache[text];
  if (cached) return cached;
  let res = text;
  const replacements: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /космическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'косм.' },
    { pattern: /секретн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'сек.' },
    { pattern: /информационн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'инф.' },
    { pattern: /политическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'полит.' },
    { pattern: /технологическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'техн.' },
    { pattern: /физическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'физ.' },
    { pattern: /химическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'хим.' },
    { pattern: /биологическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'биол.' },
    { pattern: /энергетическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'энерг.' },
    { pattern: /мистическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'мист.' },
    { pattern: /психологическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'псих.' },
    { pattern: /астрономическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'астро.' },
    { pattern: /историческ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'ист.' },
    { pattern: /экономическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'экон.' },
    { pattern: /автономн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'авт.' },
    { pattern: /национальн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'нац.' },
    { pattern: /виртуальн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'вирт.' },
    { pattern: /генераци(я|и|ям|ями)/gi, replacement: 'ген.' },
    { pattern: /генератор(ы|ов|ами)?/gi, replacement: 'ген.' },
    { pattern: /глобальн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'глоб.' },
    { pattern: /локальн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'лок.' },
    { pattern: /синтетическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'синт.' },
    { pattern: /искусственн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'иск.' },
    { pattern: /интеллект(а|у|ом|ы)?/gi, replacement: 'инт.' },
    { pattern: /генетическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'ген.' },
    { pattern: /разведк(а|и|ой|у)/gi, replacement: 'разв.' },
    { pattern: /аномальн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'аном.' },
    { pattern: /аномали(я|и|ю|ям)/gi, replacement: 'аном.' },
    { pattern: /структурн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'структ.' },
    { pattern: /документаци(я|и|ю)/gi, replacement: 'докум.' },
    { pattern: /документ(ы|ов|ами)?/gi, replacement: 'докум.' },
    { pattern: /классификаци(я|и|ю)/gi, replacement: 'класс.' },
    { pattern: /идентификаци(я|и|ю)/gi, replacement: 'идент.' },
    { pattern: /модификаци(я|и|ю)/gi, replacement: 'модиф.' },
    { pattern: /пространственн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'простр.' },
    { pattern: /территориальн(ая|ый|ое|ые|ую|ых|ым)/gi, replacement: 'терр.' },
    { pattern: /хронологическ(ая|ий|ое|ие|ую|их|им)/gi, replacement: 'хрон.' },
    { pattern: /исследовани(я|е|й|ям|ями)/gi, replacement: 'иссл.' },
  ];

  for (const { pattern, replacement } of replacements) {
    res = res.replace(pattern, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }
  const result = res.trim();
  shortenTextCache[text] = result;
  return result;
}

const COLOR_THEMES = [
  { id: 'default', name: 'Архивы', label: 'Оригинал' },
  { id: 'purple_cyan', name: 'Акаша', label: 'Акаша Пурпур', gradient: 'linear-gradient(135deg, #7028e4 0%, #30cfd0 100%)' },
  { id: 'crimson_gold', name: 'Вспышка', label: 'Алый Янтарь', gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
  { id: 'emerald_void', name: 'Матрица', label: 'Изумруд', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
  { id: 'cyber_pink', name: 'Неон', label: 'Кибер Розовый', gradient: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)' },
  { id: 'monochrome_white', name: 'Фантом', label: 'Белый Матрикс', gradient: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)' },
  { id: 'custom', name: 'Кастом', label: 'Выбор цвета' }
];

const SHAPE_PRESETS = [
  { id: 'circle', name: 'Круг', clipPath: 'none', useRoundness: true },
  { id: 'square', name: 'Квадрат', clipPath: 'none', forceRadius: '0%' },
  { id: 'rounded', name: 'Скругл.', clipPath: 'none', forceRadius: '22%' },
  { id: 'ellipse', name: 'Эллипс', clipPath: 'none', useRoundness: true, ellipse: true },
  { id: 'triangle', name: 'Треуг.', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
  { id: 'diamond', name: 'Ромб', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
  { id: 'hexagon', name: 'Шестиуг.', clipPath: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)' },
  { id: 'pentagon', name: 'Пятиуг.', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' },
  { id: 'star', name: 'Звезда', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
  { id: 'heart', name: 'Сердце', clipPath: 'path("M50,30 C50,20 35,10 25,20 C12,32 25,50 50,72 C75,50 88,32 75,20 C65,10 50,20 50,30 Z")' },
];

export default function App() {
  const {
    definitions,
    clusters,
    setClusters,
    isLoaded,
    updateDefinition,
    updateClusterTitle,
    addSubtopic,
    updateSubtopicColor,
    updateClusterColor,
    updateClusterPositionAndRadius,
    resetClustersLayout,
    addNewCluster,
    deleteCluster,
    arrangeClusterNodes
  } = useTerms();

  // Drag & Resize Photoshop mode
  const [isMoveMode, setIsMoveMode] = useState<boolean>(false);
  const [draggedClusterId, setDraggedClusterId] = useState<string | null>(null);
  const [resizedClusterId, setResizedClusterId] = useState<string | null>(null);

  // --- PLANETARY CELESTIAL PHYSICS STATE (PERSISTENT) ---
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('archive-physics-enabled-v5');
    return saved ? saved === 'true' : true;
  });
  const [physicsG, setPhysicsG] = useState<number>(() => {
    const saved = localStorage.getItem('archive-physics-g-v5');
    return saved ? parseFloat(saved) : 0.02;
  });
  const [physicsAnchor, setPhysicsAnchor] = useState<number>(() => {
    const saved = localStorage.getItem('archive-physics-anchor-v5');
    return saved ? parseFloat(saved) : 0.01;
  });
  const [physicsFriction, setPhysicsFriction] = useState<number>(() => {
    const saved = localStorage.getItem('archive-physics-friction-v5');
    return saved ? parseFloat(saved) : 0.03;
  });

  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showLoadToast, setShowLoadToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clusters, null, 2));
    const dt = new Date();
    const fileName = `Archive-Logos-${dt.toISOString().substring(0, 10)}.json`;
    const doc = document.createElement('a');
    doc.setAttribute("href", dataStr);
    doc.setAttribute("download", fileName);
    document.body.appendChild(doc);
    doc.click();
    document.body.removeChild(doc);
    
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleLoadData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          setClusters(parsed);
          setShowLoadToast(true);
          setTimeout(() => setShowLoadToast(false), 3000);
        }
      } catch (err) {
        console.error("Failed to parse log file", err);
        alert("Ошибка чтения файла логов.");
      }
    };
    reader.readAsText(file);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const velocitiesRef = useRef<Record<string, { vx: number; vy: number }>>({});
  const customAnchorRef = useRef<Record<string, { x: number; y: number }>>({});
  const editStartRef = useRef<{ mX: number; mY: number; cX: number; cY: number; cR: number }>({
    mX: 0,
    mY: 0,
    cX: 0,
    cY: 0,
    cR: 0
  });

  const handleClusterDragStart = (cluster: ClusterData, e: React.MouseEvent) => {
    if (!isMoveMode) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggedClusterId(cluster.id);
    editStartRef.current = {
      mX: e.clientX,
      mY: e.clientY,
      cX: cluster.x,
      cY: cluster.y,
      cR: cluster.radius
    };
  };

  const handleClusterResizeStart = (cluster: ClusterData, e: React.MouseEvent) => {
    if (!isMoveMode) return;
    e.stopPropagation();
    e.preventDefault();
    setResizedClusterId(cluster.id);
    editStartRef.current = {
      mX: e.clientX,
      mY: e.clientY,
      cX: cluster.x,
      cY: cluster.y,
      cR: cluster.radius
    };
  };

  // --- ETHER & RESONATOR ADJUSTMENTS STATE (PERSISTENT) ---
  const [sphereRadiusScale, setSphereRadiusScale] = useState<number>(() => {
    const saved = localStorage.getItem('archive-sphere-radius-scale-v5');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [spherePositionScale, setSpherePositionScale] = useState<number>(() => {
    const saved = localStorage.getItem('archive-sphere-position-scale-v5');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [topicsRadiusScale, setTopicsRadiusScale] = useState<number>(() => {
    const saved = localStorage.getItem('archive-topics-radius-scale-v1');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [flightSpeedMult, setFlightSpeedMult] = useState<number>(() => {
    const saved = localStorage.getItem('archive-flight-speed-mult-v5');
    return saved ? parseFloat(saved) : 0.6; // We start at a relaxed, beautiful tempo
  });
  const [sphereBaseColor, setSphereBaseColor] = useState<string>(() => {
    const saved = localStorage.getItem('archive-sphere-base-color-v5');
    return saved ? saved : 'default';
  });
  const [subtopicsColorMode, setSubtopicsColorMode] = useState<string>(() => {
    const saved = localStorage.getItem('archive-subtopics-color-mode-v1');
    return saved ? saved : 'match_sphere';
  });
  const [spheresColorHue, setSpheresColorHue] = useState<number>(() => {
    const saved = localStorage.getItem('archive-spheres-color-hue-v5');
    return saved ? parseInt(saved) : 0;
  });
  const [customColorHex, setCustomColorHex] = useState<string>(() => {
    const saved = localStorage.getItem('archive-custom-color-hex-v5');
    return saved ? saved : '#6366f1';
  });

  // --- PHOTOSHOP-STYLE SPHERE PARAMETERS (PERSISTENT) ---
  const [sphereShape, setSphereShape] = useState<string>(() => {
    return localStorage.getItem('archive-sphere-shape-v1') || 'circle';
  });
  const [sphereOpacity, setSphereOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('archive-sphere-opacity-v1');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [sphereBorderWidth, setSphereBorderWidth] = useState<number>(() => {
    const saved = localStorage.getItem('archive-sphere-border-width-v1');
    return saved ? parseFloat(saved) : 2;
  });
  const [sphereGlow, setSphereGlow] = useState<number>(() => {
    const saved = localStorage.getItem('archive-sphere-glow-v1');
    return saved ? parseFloat(saved) : 0;
  });
  const [sphereRoundness, setSphereRoundness] = useState<number>(() => {
    const saved = localStorage.getItem('archive-sphere-roundness-v1');
    return saved ? parseFloat(saved) : 50;
  });
  const [shapeDescInput, setShapeDescInput] = useState<string>('');
  // Procedurally generated clip-path (from free-text description -> coordinates)
  const [customShapeClipPath, setCustomShapeClipPath] = useState<string>(() => {
    return localStorage.getItem('archive-sphere-custom-clippath-v1') || '';
  });
  
  // --- BACKGROUND MAP STATE ---
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(() => {
    return localStorage.getItem('archive-bg-image-url-v1');
  });
  const [bgImageOpacity, setBgImageOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('archive-bg-image-opacity-v1');
    return saved ? parseFloat(saved) : 0.3;
  });
  const [bgImageScale, setBgImageScale] = useState<number>(() => {
    const saved = localStorage.getItem('archive-bg-image-scale-v1');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [bgImageX, setBgImageX] = useState<number>(() => {
    const saved = localStorage.getItem('archive-bg-image-x-v1');
    return saved ? parseFloat(saved) : 0;
  });
  const [bgImageY, setBgImageY] = useState<number>(() => {
    const saved = localStorage.getItem('archive-bg-image-y-v1');
    return saved ? parseFloat(saved) : 0;
  });

  // По умолчанию эффекты ОТКЛЮЧЕНЫ (true). Включаются только если пользователь явно сохранил 'false'.
  const [perfDisableBlur, setPerfDisableBlur] = useState<boolean>(() => localStorage.getItem('perf-blur-v1') !== 'false');
  const [perfDisableShadows, setPerfDisableShadows] = useState<boolean>(() => localStorage.getItem('perf-shadows-v1') !== 'false');
  const [perfDisableBg, setPerfDisableBg] = useState<boolean>(() => localStorage.getItem('perf-bg-v1') !== 'false');
  const [perfDisableAnimation, setPerfDisableAnimation] = useState<boolean>(() => localStorage.getItem('perf-anim-v1') !== 'false');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState<boolean>(false);
  const [isPerfSettingsOpen, setIsPerfSettingsOpen] = useState<boolean>(false);
  const [isSizeSettingsOpen, setIsSizeSettingsOpen] = useState<boolean>(false);
  const [isSphereSizeQuickOpen, setIsSphereSizeQuickOpen] = useState<boolean>(false);
  
  // HUD Panels Drag state
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const [isPanelsUnlocked, setIsPanelsUnlocked] = useState<boolean>(false);
  const [panelDraggingId, setPanelDraggingId] = useState<string | null>(null);
  const [panelLocks, setPanelLocks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('archive-panel-locks-v1');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* use defaults */ }
    }
    return {
      tophud: true,
      decryptor: true,
      parametris_efir: true,
      map: true,
      size: true,
      spheresize: true,
      perf: true,
      navigator: true,
      catalog: true,
    };
  });
  const [isCatalogMovable, setIsCatalogMovable] = useState<boolean>(false);
  
  const togglePanelLock = (panelId: string) => {
    setPanelLocks(prev => {
      const next = { ...prev, [panelId]: prev[panelId] === undefined ? false : !prev[panelId] };
      localStorage.setItem('archive-panel-locks-v1', JSON.stringify(next));
      return next;
    });
  };

  const isPanelLocked = (panelId: string) => panelLocks[panelId] === undefined ? true : panelLocks[panelId];

  const getDragProps = (panelId: string) => {
    const isDraggable = isPanelsUnlocked || !isPanelLocked(panelId);
    return {
      drag: isDraggable ? true as const : false as const,
      dragMomentum: false,
      dragElastic: 0,
      dragTransition: { bounceStiffness: 0, bounceDamping: 0, power: 0, timeConstant: 0 },
      dragConstraints: isDraggable ? false as const : undefined,
      style: isDraggable ? { cursor: 'move' } : {},
      transition: isDraggable ? { type: 'tween', duration: 0 } : undefined,
      whileDrag: isDraggable ? { transition: { duration: 0 } } : undefined,
      onDragStart: () => setPanelDraggingId(panelId),
      onDragEnd: () => setPanelDraggingId(null),
    };
  };

  const isPanelBeingDragged = (panelId: string) => panelDraggingId === panelId;

  const renderPanelLock = (panelId: string) => {
    const isLocked = !isPanelsUnlocked && isPanelLocked(panelId);
    return (
      <button
        onClick={(e) => { e.stopPropagation(); togglePanelLock(panelId); }}
        className={`w-fit p-0.5 rounded transition-colors flex-shrink-0 ${panelId === 'catalog' ? 'absolute bottom-[4px] left-[-32px] z-40' : 'self-start'} ${isLocked ? 'text-amber-400 hover:text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)]' : 'text-emerald-400 hover:text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}
        title={isLocked ? "Разблокировать панель" : "Заблокировать панель"}
      >
        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </button>
    );
  };

  // Sync ref with state on changes for high-performance use inside the requestAnimationFrame loop
  const settingsRef = useRef({
    flightSpeedMult,
    sphereRadiusScale,
    spherePositionScale,
    topicsRadiusScale,
    spheresColorHue,
    sphereBaseColor,
    subtopicsColorMode,
    customColorHex,
    isMoveMode,
    isPhysicsEnabled,
    physicsG,
    physicsAnchor,
    physicsFriction,
    draggedClusterId,
    resizedClusterId,
    perfDisableBlur,
    perfDisableShadows,
    perfDisableBg,
    perfDisableAnimation
  });

  // Separate ref sync (runs on all relevant state changes including drag) — no localStorage
  useEffect(() => {
    settingsRef.current = {
      flightSpeedMult,
      sphereRadiusScale,
      spherePositionScale,
      topicsRadiusScale,
      spheresColorHue,
      sphereBaseColor,
      subtopicsColorMode,
      customColorHex,
      isMoveMode,
      isPhysicsEnabled,
      physicsG,
      physicsAnchor,
      physicsFriction,
      draggedClusterId,
      resizedClusterId,
      perfDisableBlur,
      perfDisableShadows,
      perfDisableBg,
      perfDisableAnimation
    };
  });

  // Persist settings to localStorage (excludes drag state to avoid writes every frame)
  const localStorageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (localStorageTimerRef.current) clearTimeout(localStorageTimerRef.current);
    localStorageTimerRef.current = setTimeout(() => {
      localStorage.setItem('archive-sphere-radius-scale-v5', sphereRadiusScale.toString());
      localStorage.setItem('archive-sphere-position-scale-v5', spherePositionScale.toString());
      localStorage.setItem('archive-topics-radius-scale-v1', topicsRadiusScale.toString());
      localStorage.setItem('archive-flight-speed-mult-v5', flightSpeedMult.toString());
      localStorage.setItem('archive-sphere-base-color-v5', sphereBaseColor);
      localStorage.setItem('archive-subtopics-color-mode-v1', subtopicsColorMode);
      localStorage.setItem('archive-spheres-color-hue-v5', spheresColorHue.toString());
      localStorage.setItem('archive-custom-color-hex-v5', customColorHex);
      localStorage.setItem('archive-physics-enabled-v5', isPhysicsEnabled.toString());
      localStorage.setItem('archive-physics-g-v5', physicsG.toString());
      localStorage.setItem('archive-physics-anchor-v5', physicsAnchor.toString());
      localStorage.setItem('archive-physics-friction-v5', physicsFriction.toString());
      localStorage.setItem('perf-blur-v1', perfDisableBlur.toString());
      localStorage.setItem('perf-shadows-v1', perfDisableShadows.toString());
      localStorage.setItem('perf-bg-v1', perfDisableBg.toString());
      localStorage.setItem('perf-anim-v1', perfDisableAnimation.toString());
      
      if (bgImageUrl) localStorage.setItem('archive-bg-image-url-v1', bgImageUrl);
      else localStorage.removeItem('archive-bg-image-url-v1');
      localStorage.setItem('archive-bg-image-opacity-v1', bgImageOpacity.toString());
      localStorage.setItem('archive-bg-image-scale-v1', bgImageScale.toString());
      localStorage.setItem('archive-bg-image-x-v1', bgImageX.toString());
      localStorage.setItem('archive-bg-image-y-v1', bgImageY.toString());
      localStorage.setItem('archive-sphere-shape-v1', sphereShape);
      localStorage.setItem('archive-sphere-opacity-v1', sphereOpacity.toString());
      localStorage.setItem('archive-sphere-border-width-v1', sphereBorderWidth.toString());
      localStorage.setItem('archive-sphere-glow-v1', sphereGlow.toString());
      localStorage.setItem('archive-sphere-roundness-v1', sphereRoundness.toString());
      localStorage.setItem('archive-sphere-custom-clippath-v1', customShapeClipPath);
    }, 300);
  }, [
    flightSpeedMult, 
    sphereRadiusScale, 
    spherePositionScale, 
    topicsRadiusScale,
    spheresColorHue, 
    sphereBaseColor, 
    subtopicsColorMode,
    customColorHex, 
    isMoveMode,
    isPhysicsEnabled,
    physicsG,
    physicsAnchor,
    physicsFriction,
    bgImageUrl,
    bgImageOpacity,
    bgImageScale,
    bgImageX,
    bgImageY,
    perfDisableBlur,
    perfDisableShadows,
    perfDisableBg,
    perfDisableAnimation,
    sphereShape,
    sphereOpacity,
    sphereBorderWidth,
    sphereGlow,
    sphereRoundness,
    customShapeClipPath
  ]);

  const colorThemes = COLOR_THEMES;

  // --- SPHERE SHAPE SYSTEM (Photoshop-style) ---
  const shapePresets = SHAPE_PRESETS;

  // Parse a free-text description into a shape id (e.g. "квадрат", "круг", "звезда")
  const matchShapeFromDescription = (desc: string): string | null => {
    const d = desc.toLowerCase().trim();
    if (!d) return null;
    const map: { keys: string[]; id: string }[] = [
      { keys: ['квадрат', 'square', 'куб', 'квадратн'], id: 'square' },
      { keys: ['скругл', 'rounded', 'округл прям'], id: 'rounded' },
      { keys: ['эллипс', 'ellipse', 'овал', 'oval'], id: 'ellipse' },
      { keys: ['круг', 'circle', 'сфер', 'шар', 'round'], id: 'circle' },
      { keys: ['треуг', 'triangle', 'пирамид'], id: 'triangle' },
      { keys: ['ромб', 'diamond', 'алмаз'], id: 'diamond' },
      { keys: ['шестиуг', 'hexagon', 'гекс', 'соты', 'hex'], id: 'hexagon' },
      { keys: ['пятиуг', 'pentagon', 'pent'], id: 'pentagon' },
      { keys: ['звезд', 'star', 'звёзд'], id: 'star' },
      { keys: ['сердц', 'heart', 'любовь'], id: 'heart' },
    ];
    for (const m of map) {
      if (m.keys.some(k => d.includes(k))) return m.id;
    }
    return null;
  };

  // --- PROCEDURAL SHAPE GENERATORS (coordinate-based) ---
  // All return a CSS polygon() string with points in a 0..100 box.
  const fmt = (n: number) => `${Math.max(0, Math.min(100, n)).toFixed(2)}%`;

  // Regular N-gon (any number of sides), rotated so a flat/point sits on top.
  const genPolygon = (sides: number, rotationDeg = -90): string => {
    const n = Math.max(3, Math.round(sides));
    const rot = (rotationDeg * Math.PI) / 180;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = rot + (i * 2 * Math.PI) / n;
      const x = 50 + 50 * Math.cos(a);
      const y = 50 + 50 * Math.sin(a);
      pts.push(`${fmt(x)} ${fmt(y)}`);
    }
    return `polygon(${pts.join(', ')})`;
  };

  // Star with any number of points and configurable inner radius ratio.
  const genStar = (points: number, innerRatio = 0.42, rotationDeg = -90): string => {
    const n = Math.max(2, Math.round(points));
    const rot = (rotationDeg * Math.PI) / 180;
    const pts: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? 50 : 50 * innerRatio;
      const a = rot + (i * Math.PI) / n;
      const x = 50 + r * Math.cos(a);
      const y = 50 + r * Math.sin(a);
      pts.push(`${fmt(x)} ${fmt(y)}`);
    }
    return `polygon(${pts.join(', ')})`;
  };

  // Map written/numeric counts in RU/EN to a number.
  const parseCount = (d: string): number | null => {
    const words: Record<string, number> = {
      'тре': 3, 'three': 3, 'tri': 3,
      'четыр': 4, 'four': 4, 'квадрат': 4,
      'пят': 5, 'five': 5, 'penta': 5,
      'шест': 6, 'six': 6, 'hexa': 6,
      'семи': 7, 'семь': 7, 'seven': 7, 'hepta': 7,
      'восьм': 8, 'восем': 8, 'eight': 8, 'octa': 8,
      'девят': 9, 'nine': 9,
      'десят': 10, 'ten': 10, 'deca': 10,
      'двенадц': 12, 'twelve': 12,
    };
    const numMatch = d.match(/(\d+)/);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n >= 3 && n <= 60) return n;
    }
    for (const key of Object.keys(words)) {
      if (d.includes(key)) return words[key];
    }
    return null;
  };

  // Procedurally build a clip-path from ANY free-text description, by coordinates.
  // Returns null if even the procedural generator can't infer intent.
  const generateClipPathFromDescription = (desc: string): string | null => {
    const d = desc.toLowerCase().trim();
    if (!d) return null;

    const count = parseCount(d);

    // Stars: "звезда 7 лучей", "5-pointed star"
    if (d.includes('звезд') || d.includes('звёзд') || d.includes('star')) {
      const pts = count && count >= 3 ? count : 5;
      // sharper inner radius for more points
      const inner = pts <= 5 ? 0.42 : pts <= 8 ? 0.5 : 0.62;
      return genStar(pts, inner);
    }

    // Explicit polygon families by name
    if (d.includes('треуг') || d.includes('triangle') || d.includes('пирамид')) return genPolygon(3);
    if (d.includes('ромб') || d.includes('diamond') || d.includes('алмаз')) return genPolygon(4, -90);
    if (d.includes('пятиуг') || d.includes('penta')) return genPolygon(5);
    if (d.includes('шестиуг') || d.includes('hexa') || d.includes('гекс') || d.includes('соты')) return genPolygon(6);
    if (d.includes('семиуг') || d.includes('hepta')) return genPolygon(7);
    if (d.includes('восьмиуг') || d.includes('octa') || d.includes('октаг')) return genPolygon(8);
    if (d.includes('девятиуг')) return genPolygon(9);
    if (d.includes('десятиуг') || d.includes('deca')) return genPolygon(10);

    // Generic "N-угольник" / "N-gon" / "N sides"
    if ((d.includes('угольник') || d.includes('угол') || d.includes('gon') || d.includes('сторон') || d.includes('side')) && count) {
      return genPolygon(count);
    }

    // If user just typed a number, treat it as an N-gon.
    if (count && /^\s*\d+\s*$/.test(d)) {
      return genPolygon(count);
    }

    return null;
  };

  // Compute style fragment (borderRadius + clipPath) for the current global shape
  const getShapeStyle = (cluster?: ClusterData): { borderRadius: string; clipPath?: string } => {
    // A procedurally generated custom shape always wins when active.
    if (sphereShape === 'custom' && customShapeClipPath) {
      return { borderRadius: '0px', clipPath: customShapeClipPath };
    }
    const preset = shapePresets.find(p => p.id === sphereShape) || shapePresets[0];
    if (preset.clipPath && preset.clipPath !== 'none') {
      return { borderRadius: '0px', clipPath: preset.clipPath };
    }
    if (preset.forceRadius) {
      return { borderRadius: preset.forceRadius, clipPath: undefined };
    }
    // circle / ellipse use the roundness slider
    return { borderRadius: `${sphereRoundness}%`, clipPath: undefined };
  };

  // Apply a shape from the free-text description input.
  // 1) Try a known named preset (richest visuals: heart, etc.)
  // 2) Otherwise procedurally generate a clip-path by coordinates for ANY shape.
  const applyShapeDescription = () => {
    const raw = shapeDescInput;
    const d = raw.toLowerCase().trim();
    if (!d) return;

    // Prefer the richer named preset only when the description maps cleanly
    // to a non-procedural special shape (heart) or a plain primitive.
    const named = matchShapeFromDescription(d);

    // Procedural generation handles all polygons & stars by coordinates.
    const generated = generateClipPathFromDescription(d);

    if (generated) {
      setCustomShapeClipPath(generated);
      setSphereShape('custom');
      setShapeDescInput('');
      return;
    }

    if (named) {
      setCustomShapeClipPath('');
      setSphereShape(named);
      setShapeDescInput('');
      return;
    }

    window.alert('Не удалось распознать форму. Примеры: «круг», «квадрат», «эллипс», «треугольник», «7-угольник», «звезда 9 лучей», «12 сторон», «сердце».');
  };

  const getClusterColor = useCallback((cluster: ClusterData) => {
    if (sphereBaseColor === 'default') {
      return cluster.color;
    }
    if (sphereBaseColor === 'custom') {
      return customColorHex;
    }
    const theme = colorThemes.find(t => t.id === sphereBaseColor);
    return theme?.gradient || cluster.color;
  }, [sphereBaseColor, customColorHex, colorThemes]);

  const getClusterSolidColor = useCallback((cluster: ClusterData) => {
    let rawColor = cluster.color;
    if (sphereBaseColor === 'default') {
      rawColor = cluster.color;
    } else if (sphereBaseColor === 'custom') {
      rawColor = customColorHex;
    } else if (sphereBaseColor === 'purple_cyan') {
      return '#30cfd0';
    } else if (sphereBaseColor === 'crimson_gold') {
      return '#ff5858';
    } else if (sphereBaseColor === 'emerald_void') {
      return '#3cba92';
    } else if (sphereBaseColor === 'cyber_pink') {
      return '#ff4e50';
    } else if (sphereBaseColor === 'monochrome_white') {
      return '#cbd5e1';
    }

    const hexMatch = rawColor.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
    if (hexMatch) {
      return hexMatch[0];
    }
    return rawColor;
  }, [sphereBaseColor, customColorHex]);

  const getBrightenedColor = useCallback((hexOrStr: string) => {
    const hexMatch = hexOrStr.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
    if (!hexMatch) return '#ffffff'; // Fallback to white if no hex found
    let hex = hexMatch[0];
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    // Mix with white (60% white)
    r = Math.min(255, Math.floor(r + (255 - r) * 0.6));
    g = Math.min(255, Math.floor(g + (255 - g) * 0.6));
    b = Math.min(255, Math.floor(b + (255 - b) * 0.6));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }, []);

  const getSubtopicColors = useCallback((text: string, solidColor: string, overrideColor?: string) => {
    if (overrideColor) {
      return { textColor: overrideColor, glowColor: 'transparent', ambientColor: 'transparent' };
    }
    
    switch (subtopicsColorMode) {
      case 'white':
        return { textColor: '#ffffff', glowColor: 'transparent', ambientColor: 'transparent' };
      case 'neon_pink':
        return { textColor: '#ff2a85', glowColor: 'transparent', ambientColor: 'transparent' };
      case 'matrix_green':
        return { textColor: '#00ff41', glowColor: 'transparent', ambientColor: 'transparent' };
      case 'cyber_yellow':
        return { textColor: '#fcee0a', glowColor: 'transparent', ambientColor: 'transparent' };
      case 'random_bright': {
        // Deterministic hue based on text
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return { textColor: `hsl(${hue}, 100%, 65%)`, glowColor: 'transparent', ambientColor: 'transparent' };
      }
      case 'match_sphere':
      default:
        return { textColor: solidColor, glowColor: 'transparent', ambientColor: 'transparent' };
    }
  }, [subtopicsColorMode]);

  // ZUI Navigation States
  const [view, setViewState] = useState<{ zoom: number; pan: { x: number; y: number } }>({ zoom: 0.5, pan: { x: 0, y: 0 } });
  const { zoom, pan } = view;
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [focusedPoint, setFocusedPoint] = useState<{ x: number; y: number } | null>(null);
  const [isUiHidden, setIsUiHidden] = useState<boolean>(false);
   const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);

  // HUD Element state visibility controls
  const [isSearchHidden, setIsSearchHidden] = useState<boolean>(() => {
    return localStorage.getItem('archive-search-hidden-v5') === 'true';
  });
  const [isDecryptorHidden, setIsDecryptorHidden] = useState<boolean>(() => {
    return localStorage.getItem('archive-decryptor-hidden-v5') === 'true';
  });
  const [isLegendHidden, setIsLegendHidden] = useState<boolean>(false);
  const [isCatalogHidden, setIsCatalogHidden] = useState<boolean>(() => {
    return localStorage.getItem('archive-catalog-hidden-v5') === 'true';
  });
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('archive-search-hidden-v5', isSearchHidden.toString());
  }, [isSearchHidden]);
  useEffect(() => {
    setIsLegendHidden(false);
    localStorage.setItem('archive-legend-hidden-v5', 'false');
  }, []);
  useEffect(() => {
    setIsCatalogHidden(false);
    setIsCatalogOpen(true);
    localStorage.setItem('archive-catalog-hidden-v5', 'false');
  }, []);
  useEffect(() => {
    localStorage.setItem('archive-decryptor-hidden-v5', isDecryptorHidden.toString());
  }, [isDecryptorHidden]);
  useEffect(() => {
    localStorage.setItem('archive-legend-hidden-v5', isLegendHidden.toString());
  }, [isLegendHidden]);
  useEffect(() => {
    localStorage.setItem('archive-catalog-hidden-v5', isCatalogHidden.toString());
  }, [isCatalogHidden]);

  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false);
  const animationTimeoutRef = useRef<any>(null);
  const windowMousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      windowMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleGlobalMove);
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, []);
  
  // Custom HUD & Interactive state
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hoveredTermRef = useRef<string | null>(null);

  // --- ANIMATION ENGINE FOR TOPICS ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let globalT = 0;
    
    interface CachedNodeData {
      node: HTMLElement;
      cx: number;
      cy: number;
      dist: number;
      startAng: number;
      dir: number;
      radius: number;
      lineEl: SVGLineElement | null;
    }
    let cachedNodes: CachedNodeData[] | null = null;
    let lastNodeCount = -1;

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (settingsRef.current?.isMoveMode || settingsRef.current?.perfDisableAnimation) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const mult = settingsRef.current?.flightSpeedMult ?? 0.6;
      const currentZoom = viewRef.current?.zoom ?? 0.5;
      const zoomSlowdown = currentZoom > 0.6 ? (0.6 / currentZoom) : 1.0; 

      let closestDistSq = Infinity;
      const mouseX = windowMousePosRef.current?.x ?? -1000;
      const mouseY = windowMousePosRef.current?.y ?? -1000;
      const mouseCenterX = mouseX - window.innerWidth / 2;
      const mouseCenterY = mouseY - window.innerHeight / 2;
      
      const nodes = cachedNodes || [];
      if (nodes.length > 0) {
        for (let i = 0; i < nodes.length; i++) {
          const item = nodes[i];
          const currentAngRad = (item.startAng + globalT * item.dir) * (Math.PI / 180);
          const nx = item.cx + Math.cos(currentAngRad) * item.dist;
          const ny = item.cy + Math.sin(currentAngRad) * item.dist;
          const screenNodeX = panRef.current.x + nx * currentZoom;
          const screenNodeY = panRef.current.y + ny * currentZoom;
          const dx = mouseCenterX - screenNodeX;
          const dy = mouseCenterY - screenNodeY;
          const dSq = dx * dx + dy * dy;
          if (dSq < closestDistSq) closestDistSq = dSq;
        }
      }

      const closestDist = Math.sqrt(closestDistSq);
      let mouseSlowdown = 1.0;
      if (closestDist < 120) {
        mouseSlowdown = Math.max(0.1, Math.pow(closestDist / 120, 2));
      }

      globalT += dt * 15 * mult * zoomSlowdown * mouseSlowdown;

      // Simple caching mechanism: re-query if the length changes or occasionally
      const currentNodes = document.querySelectorAll<HTMLElement>('.anim-orbit-node');
      if (currentNodes.length !== lastNodeCount || !cachedNodes || Math.random() < 0.02) {
        cachedNodes = Array.from(currentNodes).map(node => {
          const cx = parseFloat(node.getAttribute('data-cx') || '0');
          const cy = parseFloat(node.getAttribute('data-cy') || '0');
          const dist = parseFloat(node.getAttribute('data-dist') || '0');
          const startAng = parseFloat(node.getAttribute('data-start-ang') || '0');
          const dir = parseFloat(node.getAttribute('data-dir') || '1');
          const radius = parseFloat(node.getAttribute('data-radius') || '0');
          const lineId = node.getAttribute('data-line-id') || 'none';
          const lineEl = lineId !== 'none' ? document.getElementById(lineId) as unknown as SVGLineElement | null : null;
          return {
            node,
            cx,
            cy,
            dist,
            startAng,
            dir,
            radius,
            lineEl
          };
        });
        lastNodeCount = currentNodes.length;
      }
      
      const activeNodes = cachedNodes;
      for (let i = 0; i < activeNodes.length; i++) {
        const item = activeNodes[i];
        if (!item.node.isConnected) {
            lastNodeCount = -1; // force re-query
            continue;
        }
        
        const currentAngRad = (item.startAng + globalT * item.dir) * (Math.PI / 180);
        
        const newX = item.cx + Math.cos(currentAngRad) * item.dist;
        const newY = item.cy + Math.sin(currentAngRad) * item.dist;

        item.node.style.transform = `translate(${newX}px, ${newY}px)`;

        if (item.lineEl) {
          item.lineEl.setAttribute('x2', newX.toString());
          item.lineEl.setAttribute('y2', newY.toString());
          if (item.radius > 0) {
            const rX = item.cx + Math.cos(currentAngRad) * item.radius;
            const rY = item.cy + Math.sin(currentAngRad) * item.radius;
            item.lineEl.setAttribute('x1', rX.toString());
            item.lineEl.setAttribute('y1', rY.toString());
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  // Create separate Tooltip Component to isolate render
  const TooltipLayer = React.memo(({ definitions }: { definitions: Record<string, string> }) => {
    const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
      const handleUpdate = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail) {
          setHoveredTerm(detail.term);
          setTooltipPos({ x: detail.x, y: detail.y });
        } else {
          setHoveredTerm(null);
        }
      };
      window.addEventListener('term-hover', handleUpdate);
      return () => window.removeEventListener('term-hover', handleUpdate);
    }, []);

    return (
      <AnimatePresence>
        {hoveredTerm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.57, y: 10 }}
            animate={{ opacity: 1, scale: 0.6, y: 0 }}
            exit={{ opacity: 0, scale: 0.57 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-[#04040d]/95 border border-indigo-400/40 p-4 rounded-xl max-w-sm pointer-events-none z-[100] shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-lg"
            style={{
              left: `${tooltipPos.x + 15}px`,
              top: `${tooltipPos.y + 15}px`,
              transformOrigin: 'top left'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <h4 className="font-display font-bold text-sm text-indigo-300">{hoveredTerm}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {definitions[hoveredTerm] 
                ? definitions[hoveredTerm].substring(0, 140) + '...' 
                : 'Без детального описания.'}
            </p>
            <div className="mt-2 text-[9px] text-slate-500 font-mono flex items-center justify-between">
              <span>Кликнит�� для деталей</span>
              <span>Архивы Предиктора</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  });
  
  // Editing state inside Modal
  const [isEditingDef, setIsEditingDesc] = useState<boolean>(false);
  const [editingText, setEditingText] = useState<string>('');

  // Sphere activation, highlighting and info states
  const [activeCluster, setActiveCluster] = useState<ClusterData | null>(null);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState<boolean>(false);
  const [isViewingClusterInfo, setIsViewingClusterInfo] = useState<boolean>(false);
  const [isEditingClusterDef, setIsEditingClusterDef] = useState<boolean>(false);
  const [editingClusterText, setEditingClusterText] = useState<string>('');
  const [isAddingSubtopic, setIsAddingSubtopic] = useState<boolean>(false);
  const [newSubtopicName, setNewSubtopicName] = useState<string>('');
  const [newSubtopicDesc, setNewSubtopicDesc] = useState<string>('');

  const [passportWidth, setPassportWidth] = useState<number>(550);
  const [passportHeight, setPassportHeight] = useState<number>(650);
  const [isResizingPassport, setIsResizingPassport] = useState(false);
  const resizeStartRef = useRef<{ w: number; h: number; x: number; y: number }>({ w: 550, h: 650, x: 0, y: 0 });
  const passportDragControls = useDragControls();

  const startPassportResize = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeStartRef.current = { w: passportWidth, h: passportHeight, x: clientX, y: clientY };
    setIsResizingPassport(true);
  };

  useEffect(() => {
    if (!isResizingPassport) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - resizeStartRef.current.x;
      const deltaY = clientY - resizeStartRef.current.y;
      
      const newW = Math.max(320, Math.min(window.innerWidth - 30, resizeStartRef.current.w + deltaX));
      const newH = Math.max(300, Math.min(window.innerHeight - 30, resizeStartRef.current.h + deltaY));
      
      setPassportWidth(newW);
      setPassportHeight(newH);
    };

    const handleMouseUp = () => {
      setIsResizingPassport(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizingPassport]);

  useEffect(() => {
    if (activeCluster) {
      const updated = clusters.find(c => c.id === activeCluster.id);
      if (updated && updated !== activeCluster) {
        setActiveCluster(updated);
      }
    }
  }, [clusters, activeCluster]);

  const [localClusterDefs, setLocalClusterDefs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('archive-custom-cluster-defs-v5');
    if (saved) {
      try {
        return { ...clusterDescriptions, ...JSON.parse(saved) };
      } catch {
        return clusterDescriptions;
      }
    }
    return clusterDescriptions;
  });

  const updateClusterDef = (clusterId: string, text: string) => {
    setLocalClusterDefs((prev) => {
      const updated = { ...prev, [clusterId]: text };
      localStorage.setItem('archive-custom-cluster-defs-v5', JSON.stringify(updated));
      return updated;
    });
  };

  const viewportRef = useRef<HTMLDivElement>(null);

  // Smooth centering zoom logic (prevent drift on target center point)
  const changeZoom = useCallback((delta: number) => {
    setViewState((prev) => {
      const nextZoom = Math.max(0.25, Math.min(4, prev.zoom + delta));
      let anchor = focusedPoint;
      if (!anchor) {
        // If no specific card is active, zoom centered on whatever is currently in viewport center
        anchor = { x: -prev.pan.x / prev.zoom, y: -prev.pan.y / prev.zoom };
      }
      return {
        zoom: nextZoom,
        pan: {
          x: prev.pan.x + anchor.x * (prev.zoom - nextZoom),
          y: prev.pan.y + anchor.y * (prev.zoom - nextZoom),
        },
      };
    });
  }, [focusedPoint]);

  // Wheel zoom handling
  const handleWheel = useCallback((e: WheelEvent) => {
    // If the target is inside a scrollable modal, do not intercept wheel events
    const target = e.target as HTMLElement;
    if (target.closest && target.closest('.prevent-wheel-zoom')) {
      return;
    }
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.06 : -0.06;
    changeZoom(delta);
  }, [changeZoom]);

  // Set wheel listener actively as passive: false
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        viewport.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Mouse Drag on Canvas to Pan
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const panRef = useRef(view.pan);

  useEffect(() => {
    panRef.current = view.pan;
    if (canvasWrapperRef.current) {
      canvasWrapperRef.current.style.transform = `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.zoom})`;
    }
  }, [view]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.subtopic-node') || 
      target.closest('.detail-node') || 
      target.closest('.hud-panel') ||
      target.closest('button') || 
      target.closest('input') ||
      target.closest('.cluster') ||
      target.closest('.resize-handle')
    ) {
      return;
    }
    // If clicking on empty canvas, clear active cluster
    if (activeCluster) {
      setActiveCluster(null);
      setIsViewingClusterInfo(false);
    }
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isMoveMode, activeCluster]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedClusterId) {
      const dx = (e.clientX - editStartRef.current.mX) / zoom;
      const dy = (e.clientY - editStartRef.current.mY) / zoom;
      const nextX = editStartRef.current.cX + dx / spherePositionScale;
      const nextY = editStartRef.current.cY + dy / spherePositionScale;
      customAnchorRef.current[draggedClusterId] = { x: nextX, y: nextY };
      updateClusterPositionAndRadius(draggedClusterId, nextX, nextY, editStartRef.current.cR);
      return;
    }

    if (resizedClusterId) {
      const dx = (e.clientX - editStartRef.current.mX) / zoom;
      const dr = dx / sphereRadiusScale;
      const nextR = Math.max(15, editStartRef.current.cR + dr);
      updateClusterPositionAndRadius(resizedClusterId, editStartRef.current.cX, editStartRef.current.cY, nextR);
      return;
    }

    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    
    panRef.current = { x: panRef.current.x + dx, y: panRef.current.y + dy };
    if (canvasWrapperRef.current) {
      canvasWrapperRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoom})`;
    }
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
    setFocusedPoint(null); // Clear focused zoom lock when dragging starts
  }, [draggedClusterId, resizedClusterId, isDragging, lastMousePos, zoom, spherePositionScale, sphereRadiusScale, updateClusterPositionAndRadius]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedClusterId(null);
    setResizedClusterId(null);
    setViewState(prev => ({ ...prev, pan: panRef.current }));
  }, []);

  // Global Key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTerm(null);
        setIsEditingDesc(false);
        setIsViewingClusterInfo(false);
        setIsEditingClusterDef(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Helper zoom buttons
  const zoomIn = () => changeZoom(0.25);
  const zoomOut = () => changeZoom(-0.25);
  
  const resetView = () => {
    setViewState({ zoom: 0.5, pan: { x: 0, y: 0 } });
    setSearchQuery('');
    setFocusedPoint(null);
    setActiveCluster(null);
    setIsViewingClusterInfo(false);
  };

  // Visibility threshold helpers
  const getVisibility = (zoomLevel: number, threshold: number) => zoomLevel >= threshold;

  // Polar coordinate mapping formulas
  const getItemDistance = (cluster: ClusterData, item: { isInner?: boolean }) => {
    const scaledRadius = cluster.radius * sphereRadiusScale;
    if (item.isInner) {
      return scaledRadius * 0.55;
    } else {
      return scaledRadius + 24;
    }
  };

  const getEffectiveDistance = (baseDistance: number, radius: number, scale: number) => {
    const adjustedDistance = baseDistance * topicsRadiusScale;
    if (adjustedDistance > radius) {
      // Bring them 40% closer to the surface
      const distanceFromSurface = adjustedDistance - radius;
      return (radius + distanceFromSurface * 0.6) * scale;
    }
    return adjustedDistance * scale;
  };

  const getSubtopicPosition = (cluster: ClusterData, subtopic: Subtopic) => {
    const rad = (subtopic.angle * Math.PI) / 180;
    const effectiveDistance = getItemDistance(cluster, subtopic);
    return {
      x: cluster.x * spherePositionScale + Math.cos(rad) * effectiveDistance,
      y: cluster.y * spherePositionScale + Math.sin(rad) * effectiveDistance,
    };
  };

  const getDetailPosition = (cluster: ClusterData, detail: DetailTopic) => {
    const rad = (detail.angle * Math.PI) / 180;
    const effectiveDistance = getItemDistance(cluster, detail);
    return {
      x: cluster.x * spherePositionScale + Math.cos(rad) * effectiveDistance,
      y: cluster.y * spherePositionScale + Math.sin(rad) * effectiveDistance,
    };
  };

  // General flight controller to center view with mathematically perfect zero drift
  const flyToPosition = useCallback((pos: { x: number; y: number }, targetZoom: number) => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setShouldAnimate(true);
    setViewState({
      zoom: targetZoom,
      pan: {
        x: -pos.x * targetZoom,
        y: -pos.y * targetZoom,
      },
    });
    setFocusedPoint(pos);
    animationTimeoutRef.current = setTimeout(() => {
      setShouldAnimate(false);
    }, 850);
  }, []);

  interface TermTarget {
    pos: { x: number; y: number };
    zoomLevel: number;
  }

  // Helper to locate any term in clusters, subtopics, or details with appropriate focus levels
  const findTermTarget = useCallback((term: string): TermTarget | null => {
    const trimmed = term.trim().toLowerCase();
    for (const cluster of clusters) {
      if (
        cluster.title.replace(/\n/g, ' ').toLowerCase() === trimmed || 
        cluster.title.toLowerCase() === trimmed
      ) {
        return { pos: { x: cluster.x * spherePositionScale, y: cluster.y * spherePositionScale }, zoomLevel: 1.15 };
      }
      for (const sub of cluster.subtopics) {
        if (sub.text.toLowerCase() === trimmed) {
          return { pos: getSubtopicPosition(cluster, sub), zoomLevel: 1.5 };
        }
      }
      for (const det of cluster.details) {
        if (det.text.toLowerCase() === trimmed) {
          return { pos: getDetailPosition(cluster, det), zoomLevel: 1.85 };
        }
      }
    }
    return null;
  }, [clusters, spherePositionScale, sphereRadiusScale]);

  // Term interactions
  const handleTermClick = (termText: string) => {
    const text = termText.trim();
    setSelectedTerm(text);
    setEditingText(definitions[text] || 'Определение для данного термина пока отсутствует в архивах.');
    setIsEditingDesc(false);
  };

  const saveEditedDefinition = () => {
    if (selectedTerm) {
      updateDefinition(selectedTerm, editingText);
      setIsEditingDesc(false);
    }
  };

  const handleTermHover = (termText: string, e: React.MouseEvent) => {
    // Dispatch custom event to Tooltip component
    hoveredTermRef.current = termText;
    window.dispatchEvent(new CustomEvent('term-hover', { detail: { term: termText, x: e.clientX, y: e.clientY } }));
  };

  const handleTermLeave = () => {
    hoveredTermRef.current = null;
    window.dispatchEvent(new CustomEvent('term-hover', { detail: null }));
  };

  // Handle cluster click: activate, highlight
  const handleClusterClick = (cluster: ClusterData) => {
    if (activeCluster?.id === cluster.id) {
      debugLog({ type: 'event', message: `Sphere deactivated: "${cluster.title}"` });
      setActiveCluster(null);
      setIsViewingClusterInfo(false);
    } else {
      debugLog({ type: 'event', message: `Sphere activated: "${cluster.title}"`, detail: `id=${cluster.id}` });
      setActiveCluster(cluster);
      setIsCatalogOpen(true);
    }
  };

  // Auto-pan viewport to a target cluster and lock centering zoom
  const flyToCluster = (cluster: ClusterData) => {
    setActiveCluster(cluster);
    setIsCatalogOpen(true);
    flyToPosition({ x: cluster.x * spherePositionScale, y: cluster.y * spherePositionScale }, 1.15);
  };

  // Filter clusters by search queries and evenly space angles to prevent connections overlapping
  const filteredClusters = useMemo(() => {
    let result = clusters;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = clusters.filter((cluster) => {
        const titleMatch = cluster.title.toLowerCase().includes(query);
        const subtopicMatch = cluster.subtopics.some(s => s.text.toLowerCase().includes(query));
        const detailsMatch = cluster.details.some(d => d.text.toLowerCase().includes(query));
        return titleMatch || subtopicMatch || detailsMatch;
      });
    }

    const maxOuter = 8;
    return result.map(cluster => {
      const c = { ...cluster };
      if (c.id === 'q-anon') {
        // Return without modifying angles if it's the specific q-anon cluster
        return c;
      }
      const subtopics = c.subtopics || [];
      const details = c.details || [];
      const subLen = subtopics.length;
      
      const outerSubtopicsCount = Math.min(subLen, maxOuter);
      const innerSubtopicsCount = subLen - outerSubtopicsCount;
      
      const maxOuterDetails = Math.max(0, maxOuter - subLen);
      const outerDetailsCount = Math.min(details.length, maxOuterDetails);
      const innerDetailsCount = details.length - outerDetailsCount;
      
      const totalOuter = outerSubtopicsCount + outerDetailsCount;
      const totalInner = innerSubtopicsCount + innerDetailsCount;
      
      let outerIndex = 0;
      let innerIndex = 0;
      
      const outerAngleStep = totalOuter > 0 ? 360 / totalOuter : 0;
      const innerAngleStep = totalInner > 0 ? 360 / totalInner : 0;
      const innerOffset = 22.5; // Offset inner items slightly to make them look nice and not align exactly with outer items
      
      c.subtopics = subtopics.map((sub, idx) => {
        const isInner = idx >= maxOuter;
        let angle = 0;
        if (!isInner) {
          angle = outerAngleStep * outerIndex;
          outerIndex++;
        } else {
          angle = innerAngleStep * innerIndex + innerOffset;
          innerIndex++;
        }
        return {
          ...sub,
          isInner,
          angle
        };
      });
      
      c.details = details.map((det, idx) => {
        const isInner = (subLen + idx) >= maxOuter;
        let angle = 0;
        if (!isInner) {
          angle = outerAngleStep * outerIndex;
          outerIndex++;
        } else {
          angle = innerAngleStep * innerIndex + innerOffset;
          innerIndex++;
        }
        return {
          ...det,
          isInner,
          angle
        };
      });
      
      return c;
    });
  }, [clusters, searchQuery]);

  // Memoize SVG connection lines to avoid recalculating on every render
  const connectionLines = useMemo(() => {
    return filteredClusters.flatMap((cluster) => {
      const cx = cluster.x * spherePositionScale;
      const cy = cluster.y * spherePositionScale;
      const color = getClusterSolidColor(cluster);
      const clusterScaledRadius = cluster.radius * sphereRadiusScale;
      const lines: React.ReactNode[] = [];
      
      cluster.subtopics.forEach((sub, i) => {
        const rad = (sub.angle * Math.PI) / 180;
        const dist = getItemDistance(cluster, sub);
        if (cluster.id === 'q-anon' || !sub.isInner) {
          const x1 = cx + Math.cos(rad) * clusterScaledRadius;
          const y1 = cy + Math.sin(rad) * clusterScaledRadius;
          const x2 = cx + Math.cos(rad) * dist;
          const y2 = cy + Math.sin(rad) * dist;
          lines.push(
            <line key={`sub-line-${cluster.id}-${i}`} id={`line-sub-${cluster.id}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
          );
        }
      });

      cluster.details.forEach((det, i) => {
        const rad = (det.angle * Math.PI) / 180;
        const dist = getItemDistance(cluster, det);
        if (cluster.id === 'q-anon' || !det.isInner) {
          const x1 = cx + Math.cos(rad) * clusterScaledRadius;
          const y1 = cy + Math.sin(rad) * clusterScaledRadius;
          const x2 = cx + Math.cos(rad) * dist;
          const y2 = cy + Math.sin(rad) * dist;
          lines.push(
            <line key={`det-line-${cluster.id}-${i}`} id={`line-det-${cluster.id}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.75" strokeOpacity="0.2" strokeDasharray="2 2" />
          );
        }
      });

      return lines;
    });
  }, [filteredClusters, spherePositionScale, sphereRadiusScale, sphereBaseColor, customColorHex]);

  return (
    <div ref={dragContainerRef} className="relative w-screen h-screen bg-[#02020a] overflow-hidden select-none font-sans text-slate-100">
      
      {/* Immersive Cosmic Star Dust Background */}
      {!perfDisableBg && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#1f1a4e_1px,transparent_1px)]" 
            style={{ backgroundSize: '24px 24px' }} 
          />
          <div 
            className="absolute inset-x-0 top-0 h-40 pointer-events-none bg-gradient-to-b from-indigo-950/20 to-transparent" 
          />
          <div 
            className="absolute inset-y-0 right-0 w-96 pointer-events-none bg-gradient-to-l from-[#0d0925]/40 to-transparent" 
          />
        </>
      )}

      {/* Main Map Viewport Canvas */}
      <div
        ref={viewportRef}
        className={`w-full h-full relative outline-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          ref={canvasWrapperRef}
          className={`absolute transform-gpu select-none ${
            shouldAnimate 
              ? 'transition-transform duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)]' 
              : ''
          }`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            willChange: 'transform',
            width: '2000px',
            height: '2000px',
            left: '50%',
            top: '50%',
            marginLeft: '-1000px',
            marginTop: '-1000px',
          }}
        >

          {/* Render Vector Background Map */}
          {bgImageUrl && (
            <div 
              className="absolute pointer-events-none z-[-1]" 
              style={{
                left: '50%', 
                top: '50%',
                transform: `translate(calc(-50% + ${bgImageX}px), calc(-50% + ${bgImageY}px)) scale(${bgImageScale})`,
                opacity: bgImageOpacity
              }}
            >
              <img src={bgImageUrl} alt="Background Map" className="max-w-none" />
            </div>
          )}

           {/* Render Connections Layer (Static Links) — memoized */}
          <div className="absolute inset-0 pointer-events-none z-0" style={{ left: '50%', top: '50%' }}>
            <svg style={{ overflow: 'visible', width: 0, height: 0 }}>
              {connectionLines}
            </svg>
          </div>

          {/* SVG Connection and Orbit Rays Overlay Removed */}


          {/* Render Clusters, Subtopics, and Details */}
          {filteredClusters.map((cluster, clusterIdx) => {
            const isHighlighted = searchQuery && cluster.title.toLowerCase().includes(searchQuery.toLowerCase());
            const isActive = activeCluster?.id === cluster.id;
            const isFadedOut = !isMoveMode && activeCluster && !isActive;
            
            return (
              <React.Fragment key={cluster.id}>
                
                {/* Active Cluster Cosmic Resonator Highlight Aura */}
                {isActive && !isMoveMode && !perfDisableShadows && (
                  <motion.div
                    className="absolute pointer-events-none mix-blend-screen z-0"
                    style={{
                      left: '50%',
                      top: '50%',
                      width: `${(cluster.radius * sphereRadiusScale) * 2 + 24}px`,
                      height: `${((cluster.radius * sphereRadiusScale) * 2 + 24) * (cluster.id === 'q-anon' ? 0.75 : 1)}px`,
                      marginLeft: `${cluster.x * spherePositionScale - (cluster.radius * sphereRadiusScale) - 12}px`,
                      marginTop: `${cluster.y * spherePositionScale - ((cluster.radius * sphereRadiusScale) * (cluster.id === 'q-anon' ? 0.75 : 1)) - 12}px`,
                      borderRadius: '50%',
                      border: '2px dashed rgba(6, 182, 212, 0.6)',
                      background: `radial-gradient(ellipse, ${getClusterColor(cluster).includes('gradient') ? 'rgba(6,182,212,0.3)' : getClusterColor(cluster)} 0%, transparent 70%)`,
                      boxShadow: '0 0 45px rgba(6, 182, 212, 0.5), inset 0 0 20px rgba(6, 182, 212, 0.3)',
                      filter: sphereBaseColor === 'default' && spheresColorHue !== 0 ? `hue-rotate(${spheresColorHue}deg)` : undefined
                    }}
                    animate={{
                      rotate: cluster.id === 'q-anon' ? 0 : [0, 360],
                      scale: [1, 1.04, 1],
                    }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 12, ease: "linear" },
                      scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                    }}
                  />
                )}

                {/* Primary Cluster Bubble */}
                <div
                  className={`cluster absolute flex flex-col items-center justify-center text-center font-display font-semibold border-2 select-none z-10 ${
                    isFadedOut ? 'opacity-10 grayscale hover:opacity-50 transition-opacity' : getVisibility(zoom, 0.3) ? 'opacity-100' : 'opacity-60 scale-95'
                  } ${
                    isMoveMode 
                      ? 'transition-none cursor-move border-cyan-400 border-dashed shadow-none'
                      : isActive
                        ? `transition-all duration-500 cursor-pointer border-cyan-400 ring-4 ring-cyan-400/30 ${perfDisableShadows ? 'shadow-none' : 'shadow-[0_0_60px_rgba(34,211,238,0.8)]'}`
                        : isHighlighted && !isFadedOut
                          ? `transition-all duration-500 cursor-pointer border-amber-400 ring-4 ring-amber-400/30 ${perfDisableShadows ? 'shadow-none' : 'shadow-[0_0_50px_rgba(245,158,11,0.6)]'}`
                          : 'transition-all duration-500 cursor-pointer border-white/20 shadow-none hover:border-white/40 hover:shadow-none'
                  }`}
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${(cluster.radius * sphereRadiusScale) * 2 * (cluster.shapeRatioX || 1.0)}px`,
                    height: `${(cluster.radius * sphereRadiusScale) * 2 * (cluster.shapeRatioY || (cluster.id === 'q-anon' ? 0.75 : 1))}px`,
                    marginLeft: `${cluster.x * spherePositionScale - (cluster.radius * sphereRadiusScale * (cluster.shapeRatioX || 1.0))}px`,
                    marginTop: `${cluster.y * spherePositionScale - (cluster.radius * sphereRadiusScale * (cluster.shapeRatioY || (cluster.id === 'q-anon' ? 0.75 : 1)))}px`,
                    ...getShapeStyle(cluster),
                    borderWidth: `${sphereBorderWidth}px`,
                    opacity: isFadedOut ? undefined : sphereOpacity,
                    background: getClusterColor(cluster),
                    boxShadow: !perfDisableShadows && sphereGlow > 0
                      ? `0 0 ${sphereGlow}px ${Math.round(sphereGlow / 2)}px rgba(34,211,238,0.55)`
                      : undefined,
                    filter: sphereBaseColor === 'default' && spheresColorHue !== 0 ? `hue-rotate(${spheresColorHue}deg)` : undefined
                  }}
                  onMouseDown={isMoveMode ? (e) => handleClusterDragStart(cluster, e) : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClusterClick(cluster);
                  }}
                  onDoubleClick={(e) => {
                    if (isMoveMode) {
                      e.stopPropagation();
                      setActiveCluster(cluster);
                      setIsViewingClusterInfo(true);
                      setIsCatalogOpen(false);
                    }
                  }}
                >
                  {/* Text hidden to require clicking to know the identity */}
          </div>

                {/* Photoshop Transform Bounding Box Outfit */}
                {isMoveMode && (
                  <div
                    className="absolute pointer-events-none border border-dashed border-cyan-400/80 z-20 animate-pulse"
                    style={{
                      left: '50%',
                      top: '50%',
                      width: `${(cluster.radius * sphereRadiusScale) * 2 * (cluster.shapeRatioX || 1.0) + 8}px`,
                      height: `${(cluster.radius * sphereRadiusScale) * 2 * (cluster.shapeRatioY || (cluster.id === 'q-anon' ? 0.75 : 1)) + 8}px`,
                      marginLeft: `${cluster.x * spherePositionScale - (cluster.radius * sphereRadiusScale * (cluster.shapeRatioX || 1.0)) - 4}px`,
                      marginTop: `${cluster.y * spherePositionScale - (cluster.radius * sphereRadiusScale * (cluster.shapeRatioY || (cluster.id === 'q-anon' ? 0.75 : 1))) - 4}px`,
                    }}
                  >
                    {/* Corner anchor node dots */}
                    <div className="absolute top-[-4px] left-[-4px] w-2 h-2 bg-cyan-400 border border-black rounded-sm shadow-md" />
                    <div className="absolute top-[-4px] right-[-4px] w-2 h-2 bg-cyan-400 border border-black rounded-sm shadow-md" />
                    <div className="absolute bottom-[-4px] left-[-4px] w-2 h-2 bg-cyan-400 border border-black rounded-sm shadow-md" />
                    <div className="absolute bottom-[-4px] right-[-4px] w-2 h-2 bg-cyan-400 border border-black rounded-sm shadow-md" />
                  </div>
                )}

                {/* Outer Resizing Edge Anchor Handle like Photoshop/Paint */}
                {isMoveMode && (
                  <div
                    className="resize-handle absolute w-5 h-5 bg-white border-2 border-cyan-400 rounded-full z-45 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.8)] cursor-ew-resize hover:scale-125 hover:bg-cyan-50 active:scale-95 transition-transform"
                    style={{
                      left: '50%',
                      top: '50%',
                      marginLeft: `${cluster.x * spherePositionScale + (cluster.radius * sphereRadiusScale * (cluster.shapeRatioX || 1.0)) - 10}px`,
                      marginTop: `${cluster.y * spherePositionScale - 10}px`,
                    }}
                    onMouseDown={(e) => handleClusterResizeStart(cluster, e)}
                    title="����еретяните в стороны для изменения радиуса сферы"
                  >
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  </div>
                )}

                 {/* Subtopic Labels (Layer 2) */}
                {cluster.subtopics.map((subtopic, idx) => {
                  const hasDef = definitions[subtopic.text] !== undefined;
                  const hStyle = getSubtopicStyle(subtopic.text);
                  const solidColor = getClusterSolidColor(cluster);
                  const colors = getSubtopicColors(subtopic.text, solidColor, subtopic.color);

                  let subtopicOpacity = isFadedOut ? 0 : 1;
                  let subtopicScale = isFadedOut ? 0.75 : 1;
                  let pointerEvents = 'none';

                  const isActiveCluster = activeCluster && activeCluster.id === cluster.id;

                  if (!isFadedOut) {
                    if (zoom >= 0.7 || isActiveCluster) {
                      subtopicOpacity = 1;
                      pointerEvents = 'auto';
                      subtopicScale = 1;
                    } else {
                      subtopicOpacity = Math.max(0.15, zoom / 0.7);
                      subtopicScale = Math.max(0.75, zoom / 0.7);
                      pointerEvents = 'auto';
                    }
                  }

                  const scaledRadius = cluster.radius * sphereRadiusScale;
                  const scaledDistance = getItemDistance(cluster, subtopic);
                  const isOutside = !subtopic.isInner;
                  const rad = (subtopic.angle * Math.PI) / 180;
                  const targetX = cluster.x * spherePositionScale + Math.cos(rad) * scaledDistance * (cluster.shapeRatioX || 1.0);
                  const targetY = cluster.y * spherePositionScale + Math.sin(rad) * scaledDistance * (cluster.shapeRatioY || (cluster.id === 'q-anon' ? 0.75 : 1.0));

                  return (
                    <div
                      key={`sub-wrap-${idx}`}
                      className={`absolute select-none z-20 hover:z-[100] anim-orbit-node cursor-pointer`}
                      data-line-id={isOutside ? `line-sub-${cluster.id}-${idx}` : 'none'}
                      data-radius={scaledRadius}
                      data-cx={cluster.x * spherePositionScale}
                      data-cy={cluster.y * spherePositionScale}
                      data-dist={scaledDistance}
                      data-start-ang={subtopic.angle}
                      data-dir={cluster.id === 'q-anon' ? 0 : (clusterIdx % 2 === 0 ? 1 : -1)}
                      onClick={() => { setActiveCluster(cluster); flyToCluster(cluster); }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(${targetX}px, ${targetY}px)`
                      }}
                    >
                      <div className="relative z-10 group/sub hover:z-50 transition-all duration-300" style={{ transform: `translate(-50%, -50%) scale(${subtopicScale})` }}>
                        <div
                          className={`subtopic-node font-bankgothic cursor-pointer select-none transition-all duration-300 text-center font-bold tracking-wider ${perfDisableAnimation ? 'hover:scale-[1.2]' : 'group-hover/sub:scale-[1.75]'}`}
                          style={{
                            opacity: subtopicOpacity,
                          pointerEvents: pointerEvents as 'auto' | 'none',
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: `1px solid ${colors.textColor}40`,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backdropFilter: perfDisableBlur ? 'none' : 'blur(2px)',
                          boxShadow: perfDisableShadows ? 'none' : '0 4px 12px rgba(0,0,0,0.5)',
                          color: colors.textColor,
                          WebkitTextStroke: perfDisableShadows ? 'none' : '0.2px rgba(0,0,0,0.5)',
                          textShadow: perfDisableShadows ? 'none' : '0 2px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)',
                          fontSize: hStyle.level === 5 ? '13px' : hStyle.level === 6 ? '11px' : '9px',
                          filter: sphereBaseColor === 'default' && spheresColorHue !== 0 ? `hue-rotate(${spheresColorHue}deg)` : 'none'
                        }}
                        onClick={() => handleTermClick(subtopic.text)}
                        onMouseEnter={(e) => handleTermHover(subtopic.text, e)}
                        onMouseLeave={handleTermLeave}
                        >
                          {shortenText(subtopic.text)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Detail Micro-Labels (Layer 3) */}
                {cluster.details.map((detail, idx) => {
                  const hasDef = definitions[detail.text] !== undefined;
                  const solidColor = getClusterSolidColor(cluster);
                  const colors = getSubtopicColors(detail.text, solidColor, detail.color);

                  let detailOpacity = isFadedOut ? 0 : 1;
                  let detailScale = isFadedOut ? 0.75 : 1;
                  let detailPointerEvents = 'auto';

                  const isActiveCluster = activeCluster && activeCluster.id === cluster.id;

                  if (!isFadedOut) {
                    if (zoom >= 1.25 || isActiveCluster) {
                      detailOpacity = 0.9;
                      detailScale = 1;
                    } else {
                      detailOpacity = Math.max(0.1, (zoom / 1.25) * 0.9);
                      detailScale = Math.max(0.7, zoom / 1.25);
                    }
                  }

                  const scaledRadius = cluster.radius * sphereRadiusScale;
                  const scaledDistance = getItemDistance(cluster, detail);
                  const isOutside = !detail.isInner;
                  const rad = (detail.angle * Math.PI) / 180;
                  const targetX = cluster.x * spherePositionScale + Math.cos(rad) * scaledDistance * (cluster.shapeRatioX || 1.0);
                  const targetY = cluster.y * spherePositionScale + Math.sin(rad) * scaledDistance * (cluster.shapeRatioY || (cluster.id === 'q-anon' ? 0.75 : 1.0));

                  return (
                    <div
                      key={`det-wrap-${idx}`}
                      className={`absolute select-none z-20 hover:z-[100] anim-orbit-node`}
                      data-line-id={isOutside ? `line-det-${cluster.id}-${idx}` : 'none'}
                      data-radius={scaledRadius}
                      data-cx={cluster.x * spherePositionScale}
                      data-cy={cluster.y * spherePositionScale}
                      data-dist={scaledDistance}
                      data-start-ang={detail.angle}
                      data-dir={cluster.id === 'q-anon' ? 0 : (clusterIdx % 2 === 0 ? 1 : -1)}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(${targetX}px, ${targetY}px)`
                      }}
                    >
                      <div className="relative z-10 group/det hover:z-50 transition-all duration-300" style={{ transform: `translate(-50%, -50%) scale(${detailScale})` }}>
                        <div
                          className={`detail-node font-stencil cursor-pointer select-none transition-all duration-300 whitespace-nowrap text-center font-semibold tracking-wide ${perfDisableAnimation ? 'hover:scale-[1.5]' : 'group-hover/det:scale-[2.5]'}`}
                          style={{
                            fontSize: '8px',
                            opacity: detailOpacity,
                          pointerEvents: detailPointerEvents as 'auto' | 'none',
                          background: 'rgba(0, 0, 0, 0.65)',
                          border: `1px solid ${colors.textColor}30`,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backdropFilter: perfDisableBlur ? 'none' : 'blur(2px)',
                          boxShadow: perfDisableShadows ? 'none' : '0 2px 8px rgba(0,0,0,0.5)',
                          color: colors.textColor,
                          WebkitTextStroke: perfDisableShadows ? 'none' : '0.2px rgba(0,0,0,0.5)',
                          textShadow: perfDisableShadows ? 'none' : '0 1px 3px rgba(0,0,0,1), 0 0 6px rgba(0,0,0,0.8)',
                          filter: sphereBaseColor === 'default' && spheresColorHue !== 0 ? `hue-rotate(${spheresColorHue}deg)` : 'none'
                        }}
                        onClick={() => handleTermClick(detail.text)}
                        onMouseEnter={(e) => handleTermHover(detail.text, e)}
                        onMouseLeave={handleTermLeave}
                        >
                          {shortenText(detail.text)}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </React.Fragment>
            );
          })}
        </div>
      </div>

{/* Minimized Search activator */}
      {isSearchHidden && (
        <motion.button
          initial={{ opacity: 0, x: -10, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 0.75 }}
          exit={{ opacity: 0, x: -10, scale: 0.8 }}
          onClick={() => setIsSearchHidden(false)}
          className="absolute top-0 left-0 z-40 p-2.5 bg-[#070716]/90 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-slate-900 rounded-xl backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center gap-2 cursor-pointer font-mono text-[9px] tracking-widest uppercase"
          title="Показать Поиск"
        >
          <Search className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">ПОКАЗАТЬ ПОИСК</span>
        </motion.button>
      )}

      {/* STANDALONE SEARCH: Top-left corner */}
      {!isSearchHidden && (
        <div
          className="absolute top-0 left-0 z-40"
          style={{ transformOrigin: 'top left', transform: 'scale(0.75)' }}
        >
          {!isSearchExpanded ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchExpanded(true);
              }}
              onPointerDownCapture={(e) => e.stopPropagation()}
              className={`hud-panel hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                searchQuery
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400'
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title="Поиск по Архиву"
            >
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <div className="hud-panel w-[28rem] max-w-[80vw] transition-all duration-300 flex items-center bg-[#070716]/80 backdrop-blur-xl border border-indigo-500/20 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.5)] h-9 shrink-0">
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="text-indigo-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Свернуть поиск"
              >
                <Search className="w-5 h-5 flex-shrink-0" />
              </button>
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent outline-none text-sm placeholder-slate-400 text-white font-medium"
                placeholder="Поиск по Архиву..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setIsSearchHidden(true); }}
                onPointerDownCapture={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                title="Скрыть Поиск"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ВЕРТИКАЛЬНАЯ КОЛОНКА ИКОНОК УПРАВЛЕНИЯ СЛЕВА - всегда активна, даже при скрытом интерфейсе */}
      <AnimatePresence>
        {true && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.6 }}
            animate={isPanelBeingDragged('tophud') ? { opacity: 1, scale: 0.75 } : { opacity: 1, x: 0, scale: 0.75 }}
            exit={{ opacity: 0, x: -20, scale: 0.6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'top left', ...getDragProps('tophud').style }}
            {...getDragProps('tophud')}
            className={`absolute top-[-42px] left-[-2px] flex flex-col items-start gap-1.5 z-50 max-h-[calc(100vh-36px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50 rounded-xl bg-emerald-950/20' : ''}`}
          >
            {renderPanelLock('tophud')}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hud-panel pointer-events-auto bg-[#070716]/80 hover:bg-slate-900 border border-emerald-500/20 text-emerald-400 hover:text-white hover:border-emerald-500/50 w-9 rounded-lg backdrop-blur-xl transition-all duration-200 shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer"
              title="Импорт Архива"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleLoadData}
                className="hidden"
                title="Загрузить JSON файл"
              />
            </button>
            <button
              onClick={handleSaveData}
              className="hud-panel pointer-events-auto bg-[#070716]/80 hover:bg-slate-900 border border-emerald-500/20 text-emerald-400 hover:text-white hover:border-emerald-500/50 w-9 rounded-lg backdrop-blur-xl transition-all duration-200 shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer"
              title="Экспорт Архива"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsMoveMode(!isMoveMode);
                setActiveCluster(null);
                setIsViewingClusterInfo(false);
                setSelectedTerm(null);
              }}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                isMoveMode 
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title={isMoveMode ? "Выход из перемещения" : "Включить перемещение"}
            >
              <Move className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                isSettingsOpen 
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' 
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title="Настройка резонаторов и эфира"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSizeSettingsOpen(!isSizeSettingsOpen)}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                isSizeSettingsOpen 
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' 
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title="Настройка размеров и дистанций"
            >
              <Expand className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSphereSizeQuickOpen(!isSphereSizeQuickOpen)}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                isSphereSizeQuickOpen 
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' 
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title="Размер сфер"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPerfSettingsOpen(!isPerfSettingsOpen)}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                isPerfSettingsOpen
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title="ФПС и Настройки Оптимизации"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const hasDisables = perfDisableBlur && perfDisableShadows && perfDisableBg && perfDisableAnimation;
                // If all disables are active, we now enable everything (so state is false for disables)
                // If some/none are active, we disable everything (so state is true for disables)
                const newState = !hasDisables;
                setPerfDisableBlur(newState);
                setPerfDisableShadows(newState);
                setPerfDisableBg(newState);
                setPerfDisableAnimation(newState);
              }}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                (perfDisableBlur && perfDisableShadows && perfDisableBg && perfDisableAnimation)
                  ? 'bg-[#070716]/80 border-amber-500/30 text-amber-500'
                  : 'bg-[#070716]/80 border-emerald-500/30 text-emerald-400'
              }`}
              title={(perfDisableBlur && perfDisableShadows && perfDisableBg && perfDisableAnimation) ? "Включить все эффекты" : "Отключить все эффекты"}
            >
              {(perfDisableBlur && perfDisableShadows && perfDisableBg && perfDisableAnimation) ? (
                <ZapOff className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsMapSettingsOpen(!isMapSettingsOpen)}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                isMapSettingsOpen 
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' 
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title="Ландшафт и Подложка"
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPanelsUnlocked(!isPanelsUnlocked)}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                isPanelsUnlocked 
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title={isPanelsUnlocked ? "Заблокировать панели UI" : "Разблокировать позицию панелей UI"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="hud-panel pointer-events-auto bg-[#070716]/80 hover:bg-slate-900 border border-indigo-500/20 text-indigo-300 hover:text-white w-9 rounded-lg backdrop-blur-xl transition-all duration-200 shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer"
              title="Информация о проекте и документация"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCatalogHidden(!isCatalogHidden)}
              className={`hud-panel pointer-events-auto hover:bg-slate-900 border transition-all duration-200 w-9 rounded-lg backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer ${
                !isCatalogHidden
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400'
                  : 'bg-[#070716]/80 border-indigo-500/20 text-indigo-300 hover:text-white'
              }`}
              title={isCatalogHidden ? "Показать Каталог Сфер" : "Скрыть Каталог Сфер"}
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsUiHidden(true)}
              className="hud-panel pointer-events-auto bg-[#070716]/80 hover:bg-slate-900 border border-indigo-500/20 text-indigo-300 hover:text-white w-9 rounded-lg backdrop-blur-xl transition-all duration-200 shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center justify-center h-9 shrink-0 cursor-pointer"
              title="Скрыть весь интерфейс"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`absolute inset-0 z-30 transition-opacity duration-300 ${isUiHidden ? 'opacity-5 cursor-pointer' : 'opacity-100 pointer-events-none'}`}
        onClick={() => isUiHidden && setIsUiHidden(false)}
        title="Кликните для показа интерфейса"
      >
      {/* Minimized Active Sphere Decryptor activator */}
      {isDecryptorHidden && (
        <motion.button
          initial={{ opacity: 0, x: 10, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 0.8 }}
          exit={{ opacity: 0, x: 10, scale: 0.8 }}
          onClick={() => setIsDecryptorHidden(false)}
          className="absolute top-0 right-[-15px] z-30 p-2.5 bg-[#070716]/90 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-slate-900 rounded-xl backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center gap-2 cursor-pointer font-mono text-[9px] tracking-widest uppercase"
          title="Показать Декриптор Сф��р"
        >
          <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">ПОКАЗАТЬ ДЕКРИПТОР</span>
        </motion.button>
      )}

      {/* TOP-RIGHT HUD: Active Sphere Decryptor / Status Panel */}
      <AnimatePresence>
        {!isDecryptorHidden && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('decryptor') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right', ...getDragProps('decryptor').style }}
            {...getDragProps('decryptor')}
            className={`hud-panel absolute top-[-20px] right-[-35px] w-64 max-h-screen bg-[#070716]/85 backdrop-blur-xl border border-white/5 p-3 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] z-30 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar prevent-wheel-zoom ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('decryptor')}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h2 className="font-mono font-medium text-[9px] tracking-widest text-slate-400 uppercase">ДЕКРИПТОР СФЕР</h2>
              </div>
              <button
                onClick={() => setIsDecryptorHidden(true)}
                className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/5 flex items-center justify-center"
                title="Скрыть Декриптор"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            {activeCluster ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                    style={{ backgroundColor: activeCluster.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Материнская сфера</span>
                    <span className="font-display font-bold text-sm tracking-wide text-white leading-snug">
                      {activeCluster.title.replace(/\n/g, ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300/90 leading-relaxed font-sans line-clamp-2">
                  {localClusterDefs[activeCluster.id] || "Нет данных для считывания."}
                </p>

                <div className="flex gap-1.5 w-full pt-0.5">
                  <button
                    onClick={() => flyToPosition({ x: activeCluster.x, y: activeCluster.y }, 1.15)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-400/50 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer select-none"
                  >
                    <ZoomIn className="w-3 h-3" />
                    Приблизить
                  </button>
                  <button
                    onClick={() => resetView()}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 hover:border-slate-400/60 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(148,163,184,0.1)] cursor-pointer select-none"
                  >
                    <ZoomOut className="w-3 h-3" />
                    Отдалить
                  </button>
                </div>

                <div className="border-t border-white/10 my-0.5"></div>

                {/* БЫСТРАЯ РЕГУЛИРОВКА РАЗМЕРА АКТИВНОЙ СФЕРЫ */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Circle className="w-3 h-3 text-cyan-400" />
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Размер сферы</span>
                    </div>
                    <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                      {Math.round(activeCluster.radius)}
                    </span>
                  </div>
                  <input 
                    type="range" min="20" max="400" step="1"
                    value={activeCluster.radius}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateClusterPositionAndRadius(activeCluster.id, activeCluster.x, activeCluster.y, val, activeCluster.shapeRatioX, activeCluster.shapeRatioY);
                      setActiveCluster(prev => prev ? { ...prev, radius: val } : prev);
                    }}
                    className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-slate-500 tracking-wider">Сжатие X: {(activeCluster.shapeRatioX || 1.0).toFixed(2)}</span>
                      <input 
                        type="range" min="0.3" max="2" step="0.05"
                        value={activeCluster.shapeRatioX || 1.0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateClusterPositionAndRadius(activeCluster.id, activeCluster.x, activeCluster.y, activeCluster.radius, val, activeCluster.shapeRatioY);
                          setActiveCluster(prev => prev ? { ...prev, shapeRatioX: val } : prev);
                        }}
                        className="w-full accent-indigo-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-slate-500 tracking-wider">Сжатие Y: {(activeCluster.shapeRatioY || 1.0).toFixed(2)}</span>
                      <input 
                        type="range" min="0.3" max="2" step="0.05"
                        value={activeCluster.shapeRatioY || 1.0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateClusterPositionAndRadius(activeCluster.id, activeCluster.x, activeCluster.y, activeCluster.radius, activeCluster.shapeRatioX, val);
                          setActiveCluster(prev => prev ? { ...prev, shapeRatioY: val } : prev);
                        }}
                        className="w-full accent-indigo-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 my-0.5"></div>

                <button
                  onClick={() => {
                    setEditingClusterText(localClusterDefs[activeCluster.id] || '');
                    setIsViewingClusterInfo(true);
                    setIsEditingClusterDef(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/60 text-cyan-300 hover:text-white rounded-lg text-[10px] font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] select-none cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  Читать о сфере
                </button>
              </div>
            ) : (
              <div className="py-1.5 flex flex-col gap-1 text-center sm:text-left">
                <span className="text-[11px] font-semibold text-slate-300">Сфера не активна</span>
                <p className="text-[9px] text-slate-500 leading-normal">
                  Нажмите на сферу или выберите в каталоге.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED ETHER ADJUSTMENT PANEL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('decryptor') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom right', ...getDragProps('parametris_efir').style }}
            {...getDragProps('parametris_efir')}
            className={`hud-panel absolute bottom-4 right-4 w-64 bg-[#070716]/92 backdrop-blur-2xl border border-cyan-500/20 p-3.5 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-30 flex flex-col gap-2.5 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar prevent-wheel-zoom ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('parametris_efir')}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <h2 className="font-mono font-semibold text-[9px] tracking-widest text-slate-300 uppercase">ПАРАМЕТРЫ ЭФИРА</h2>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Flight speed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Скорость Полета Тем</span>
                <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                  {flightSpeedMult.toFixed(2)}x
                </span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="2.5" 
                step="0.05"
                value={flightSpeedMult}
                onChange={(e) => setFlightSpeedMult(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Hue shifting spectrum */}
            {sphereBaseColor === 'default' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Спектр Градиентов (Hue)</span>
                  <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                    {spheresColorHue}°
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  step="5"
                  value={spheresColorHue}
                  onChange={(e) => setSpheresColorHue(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Theme Select Selection */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
              <span className="text-slate-400 font-medium">Свечение и Окрас Сфер</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSphereBaseColor(theme.id)}
                    className={`px-2 py-1 rounded text-[9px] font-semibold tracking-wide border transition-all text-center cursor-pointer truncate ${
                      sphereBaseColor === theme.id 
                        ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40' 
                        : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                    title={theme.label}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom color picker details */}
            {sphereBaseColor === 'custom' && (
              <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Цветовая Матрица:</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer outline-none"
                  />
                  <input
                    type="text"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-16 bg-transparent outline-none text-[10px] font-mono text-slate-200 border-b border-white/10"
                  />
                </div>
              </div>
            )}

            {/* Subtopics Coloring Mode */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
              <span className="text-slate-400 font-medium">Окрас Субтопиков</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {[ 
                  { id: 'match_sphere', label: 'В цвет сферы' },
                  { id: 'white', label: 'Белый Неон' }, 
                  { id: 'neon_pink', label: 'Розовый Неон' }, 
                  { id: 'cyber_yellow', label: 'Кибер Желтый' },
                  { id: 'matrix_green', label: 'Матрица Зеленый' },
                  { id: 'random_bright', label: 'Случайные цвета' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSubtopicsColorMode(mode.id)}
                    className={`px-2 py-1 rounded text-[9px] font-semibold tracking-wide border transition-all text-center cursor-pointer truncate ${
                      subtopicsColorMode === mode.id 
                        ? 'bg-amber-950/40 text-amber-300 border-amber-500/40' 
                        : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                    title={mode.label}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMapSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('decryptor') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right', ...getDragProps('map').style }}
            {...getDragProps('map')}
            className={`hud-panel absolute top-[120px] right-4 w-64 bg-[#070716]/92 backdrop-blur-2xl border border-indigo-500/20 p-3.5 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-30 flex flex-col gap-2.5 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar prevent-wheel-zoom ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('map')}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Expand className="w-3.5 h-3.5 text-indigo-400" />
                <h2 className="font-mono font-semibold text-[9px] tracking-widest text-slate-300 uppercase">КАРТА И НАВИГАЦИЯ</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMapSettingsOpen(false); }}
              >
                <X className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSizeSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('decryptor') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right', ...getDragProps('size').style }}
            {...getDragProps('size')}
            className={`hud-panel absolute top-[120px] right-4 w-64 bg-[#070716]/92 backdrop-blur-2xl border border-indigo-500/20 p-3.5 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-30 flex flex-col gap-2.5 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar prevent-wheel-zoom ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('size')}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Expand className="w-3.5 h-3.5 text-indigo-400" />
                <h2 className="font-mono font-semibold text-[9px] tracking-widest text-slate-300 uppercase">РАЗМЕРЫ И ДИСТАНЦИ��</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSizeSettingsOpen(false); }}
              >
                <X className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
            <div className="flex flex-col gap-2.5 items-center justify-center py-6">
              <span className="text-slate-500 text-xs font-mono">Настройки размера (в разработке)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isSphereSizeQuickOpen && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('decryptor') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right', ...getDragProps('spheresize').style }}
            {...getDragProps('spheresize')}
            className={`hud-panel absolute top-[120px] right-4 w-64 bg-[#070716]/92 backdrop-blur-2xl border border-indigo-500/20 p-3.5 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-30 flex flex-col gap-3 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar prevent-wheel-zoom ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('spheresize')}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Circle className="w-3.5 h-3.5 text-cyan-400" />
                <h2 className="font-mono font-semibold text-[9px] tracking-widest text-slate-300 uppercase">ПАРАМЕТРЫ СФЕР</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSphereSizeQuickOpen(false); }}
                className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Размер */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium text-xs">Размер</span>
                <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                  {sphereRadiusScale.toFixed(2)}x
                </span>
              </div>
              <input 
                type="range" min="0.4" max="2.2" step="0.05"
                value={sphereRadiusScale}
                onChange={(e) => setSphereRadiusScale(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Непрозра��ность */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium text-xs">Непрозрачность</span>
                <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                  {Math.round(sphereOpacity * 100)}%
                </span>
              </div>
              <input 
                type="range" min="0.1" max="1" step="0.05"
                value={sphereOpacity}
                onChange={(e) => setSphereOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Толщина обводки */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium text-xs">Обводка</span>
                <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                  {sphereBorderWidth}px
                </span>
              </div>
              <input 
                type="range" min="0" max="10" step="1"
                value={sphereBorderWidth}
                onChange={(e) => setSphereBorderWidth(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Свечение */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium text-xs">Свечение</span>
                <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                  {sphereGlow}px
                </span>
              </div>
              <input 
                type="range" min="0" max="80" step="2"
                value={sphereGlow}
                onChange={(e) => setSphereGlow(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Скругление (только для круга/эллипса) */}
            {(sphereShape === 'circle' || sphereShape === 'ellipse') && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium text-xs">Скругление</span>
                  <span className="text-cyan-400 font-mono font-semibold text-[10px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10">
                    {sphereRoundness}%
                  </span>
                </div>
                <input 
                  type="range" min="0" max="50" step="1"
                  value={sphereRoundness}
                  onChange={(e) => setSphereRoundness(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Выбор формы */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2.5">
              <span className="text-slate-400 font-medium text-xs">Форма сферы</span>
              <div className="grid grid-cols-3 gap-1.5">
                {shapePresets.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => setSphereShape(shape.id)}
                    className={`py-1.5 px-1 border rounded-lg font-mono text-[8px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      sphereShape === shape.id
                        ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {shape.name}
                  </button>
                ))}
                {customShapeClipPath && (
                  <button
                    onClick={() => setSphereShape('custom')}
                    className={`py-1.5 px-1 border rounded-lg font-mono text-[8px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      sphereShape === 'custom'
                        ? 'bg-fuchsia-950/50 border-fuchsia-500/50 text-fuchsia-300'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Сгенерированная форма по описанию"
                  >
                    Своя
                  </button>
                )}
              </div>
            </div>

            {/* Смена формы по описанию (процедурная генерация по координатам) */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2.5">
              <span className="text-slate-400 font-medium text-xs">Форма по описанию</span>
              <div className="flex items-center gap-1.5">
                <input 
                  type="text"
                  value={shapeDescInput}
                  onChange={(e) => setShapeDescInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyShapeDescription(); }}
                  placeholder="напр. 7-угольник, звезда 9..."
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  onClick={applyShapeDescription}
                  className="shrink-0 py-1.5 px-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/20 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  OK
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {['треугольник', '7-угольник', '12 сторон', 'звезда 6', 'звезда 9 лучей'].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setShapeDescInput(ex); }}
                    className="py-0.5 px-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 rounded font-mono text-[8px] transition-all duration-200 cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-slate-500 leading-relaxed font-mono">
                Любой многоугольник или звезда строятся по координатам: укажите число сторон/лучей.
              </p>
            </div>

            {/* Сброс всех параметров */}
            <button
              onClick={() => {
                setSphereRadiusScale(1);
                setSphereOpacity(1);
                setSphereBorderWidth(2);
                setSphereGlow(0);
                setSphereRoundness(50);
                setSphereShape('circle');
                setCustomShapeClipPath('');
              }}
              className="w-full py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/10 rounded-xl font-semibold tracking-wider font-mono text-[9px] uppercase transition-all duration-200 cursor-pointer text-center"
            >
              Сбросить параметры
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPerfSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('decryptor') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right', ...getDragProps('perf').style }}
            {...getDragProps('perf')}
            className={`hud-panel absolute top-[120px] right-4 w-64 bg-[#070716]/92 backdrop-blur-2xl border border-indigo-500/20 p-3.5 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-30 flex flex-col gap-2.5 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar prevent-wheel-zoom ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('perf')}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <h2 className="font-mono font-semibold text-[9px] tracking-widest text-slate-300 uppercase">ОПТИМИЗАЦИЯ И ИНТЕРФЕЙС</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPerfSettingsOpen(false); }}
                className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-slate-400 font-medium text-xs">Визуальные Эффекты</span>
              
              <button
                onClick={() => {
                  const newState = !(perfDisableBlur && perfDisableShadows && perfDisableBg && perfDisableAnimation);
                  setPerfDisableBlur(newState);
                  setPerfDisableShadows(newState);
                  setPerfDisableBg(newState);
                  setPerfDisableAnimation(newState);
                }}
                className={`mt-1 px-2 py-2 rounded-xl text-[10px] uppercase tracking-wider font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  (perfDisableBlur && perfDisableShadows && perfDisableBg && perfDisableAnimation) 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                    : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                }`}
              >
                <Zap className="w-4 h-4" />
                {(perfDisableBlur && perfDisableShadows && perfDisableBg && perfDisableAnimation) ? 'ВКЛЮЧИТЬ ВСЕ ЭФФЕКТЫ' : 'ОТКЛЮЧИТЬ ВСЕ ЭФФЕКТЫ'}
              </button>

              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => setPerfDisableBlur(!perfDisableBlur)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    perfDisableBlur 
                      ? 'bg-amber-950/20 text-amber-400 border-amber-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Без Размытия</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${perfDisableBlur ? 'border-amber-400 bg-amber-400/20' : 'border-slate-500 bg-transparent'}`} />
                </button>

                <button
                  onClick={() => setPerfDisableShadows(!perfDisableShadows)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    perfDisableShadows 
                      ? 'bg-amber-950/20 text-amber-400 border-amber-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Без Свечения</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${perfDisableShadows ? 'border-amber-400 bg-amber-400/20' : 'border-slate-500 bg-transparent'}`} />
                </button>

                <button
                  onClick={() => setPerfDisableBg(!perfDisableBg)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    perfDisableBg 
                      ? 'bg-amber-950/20 text-amber-400 border-amber-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Без Фона</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${perfDisableBg ? 'border-amber-400 bg-amber-400/20' : 'border-slate-500 bg-transparent'}`} />
                </button>

                <button
                  onClick={() => setPerfDisableAnimation(!perfDisableAnimation)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    perfDisableAnimation 
                      ? 'bg-amber-950/20 text-amber-400 border-amber-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Без Анимаций</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${perfDisableAnimation ? 'border-amber-400 bg-amber-400/20' : 'border-slate-500 bg-transparent'}`} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2.5 mt-1">
              <span className="text-slate-400 font-medium text-xs">Видимость Панелей HUD</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => setIsSearchHidden(!isSearchHidden)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    !isSearchHidden 
                      ? 'bg-cyan-950/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Поиск</span>
                  {!isSearchHidden ? <Eye className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                </button>

                <button
                  onClick={() => setIsDecryptorHidden(!isDecryptorHidden)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    !isDecryptorHidden 
                      ? 'bg-cyan-950/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Д��криптор</span>
                  {!isDecryptorHidden ? <Compass className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                </button>

                <button
                  onClick={() => setIsLegendHidden(!isLegendHidden)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    !isLegendHidden 
                      ? 'bg-cyan-950/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Навигатор</span>
                  {!isLegendHidden ? <HelpCircle className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                </button>

                <button
                  onClick={() => setIsCatalogHidden(!isCatalogHidden)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                    !isCatalogHidden 
                      ? 'bg-cyan-950/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate mr-1">Каталог</span>
                  {!isCatalogHidden ? <Database className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2 mt-1">
              <button
                onClick={() => {
                  setSphereRadiusScale(1.0);
                  setSpherePositionScale(1.0);
                  setFlightSpeedMult(0.6);
                  setSphereBaseColor('default');
                  setSpheresColorHue(0);
                  setCustomColorHex('#6366f1');
                  setIsSearchHidden(false);
                  setIsDecryptorHidden(false);
                  setIsLegendHidden(false);
                  setIsCatalogHidden(false);
                  setIsMoveMode(false);
                  setIsPhysicsEnabled(true);
                  setPhysicsG(0.02);
                  setPhysicsAnchor(0.01);
                  setPhysicsFriction(0.03);
                }}
                className="w-full py-1.5 bg-white/5 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20 text-slate-400 border border-white/5 rounded-xl font-semibold tracking-wider font-mono text-[9px] uppercase transition-all duration-200 cursor-pointer text-center"
              >
                СБРОСИТЬ ПО УМОЛЧАНИЮ ВСЕ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMapSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.65 }}
            animate={isPanelBeingDragged('map') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 20, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right', ...getDragProps('map').style }}
            {...getDragProps('map')}
            className={`hud-panel absolute top-[120px] right-4 w-64 bg-[#070716]/92 backdrop-blur-2xl border border-indigo-500/20 p-3.5 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] z-30 flex flex-col gap-2.5 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar prevent-wheel-zoom ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('map')}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-indigo-400" />
                <h2 className="font-mono font-semibold text-[9px] tracking-widest text-slate-300 uppercase">ЛАНДШАФТ И КАРТА</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMapSettingsOpen(false); }}
                className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-400 font-medium">Ландшафт Подложки (Карта)</span>
              
              <div className="flex items-center gap-2 mt-1">
                <label className="flex-1 text-center py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/60 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold transition-all duration-300 cursor-pointer">
                  Загрузить Карту
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setBgImageUrl(ev.target.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
                {bgImageUrl && (
                  <button 
                    onClick={() => setBgImageUrl(null)}
                    className="py-1.5 px-2 bg-red-400/10 hover:bg-red-400/20 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    Удалить
                  </button>
                )}
              </div>

              {bgImageUrl && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Масштаб: {bgImageScale.toFixed(2)}x</span>
                    </div>
                    <input type="range" min="0.1" max="5.0" step="0.05" value={bgImageScale} onChange={(e) => setBgImageScale(parseFloat(e.target.value))} className="w-full accent-indigo-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Прозрачность: {bgImageOpacity.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0.0" max="1.0" step="0.05" value={bgImageOpacity} onChange={(e) => setBgImageOpacity(parseFloat(e.target.value))} className="w-full accent-indigo-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400">Ось X</span>
                      <input type="number" value={bgImageX} onChange={(e) => setBgImageX(parseFloat(e.target.value) || 0)} className="bg-slate-900 border border-slate-700 rounded-md p-1 pl-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400">Ось Y</span>
                      <input type="number" value={bgImageY} onChange={(e) => setBgImageY(parseFloat(e.target.value) || 0)} className="bg-slate-900 border border-slate-700 rounded-md p-1 pl-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Navigator Legend activator */}
      {isLegendHidden && (
<motion.button
          initial={{ opacity: 0, x: 10, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 0.8 }}
          exit={{ opacity: 0, x: 10, scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsLegendHidden(false);
          }}
          className="absolute bottom-0 right-[-15px] z-30 p-2.5 bg-[#070716]/90 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-slate-900 rounded-xl backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center gap-2 cursor-pointer font-mono text-[9px] tracking-widest uppercase"
          title="Показать Навигатор Архива"
        >
          <Compass className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline">ПОКАЗАТЬ НАВИГАТОР</span>
        </motion.button>
      )}

      {/* BOTTOM-RIGHT: Navigation Legend & Instructions */}
      <AnimatePresence>
        {!isLegendHidden && (
          <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('decryptor') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom right', ...getDragProps('navigator').style }}
            {...getDragProps('navigator')}
            className={`hud-panel absolute bottom-[-45px] right-[-35px] w-60 bg-[#070716]/85 backdrop-blur-xl border border-white/5 p-3.5 rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.7)] z-20 ${isPanelsUnlocked ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {renderPanelLock('navigator')}
            <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-400" />
                <h2 className="font-display font-medium text-xs text-slate-200 tracking-wider">НАВИГАТОР АРХИВА</h2>
              </div>
<button
                 onClick={(e) => {
                   e.stopPropagation();
                   setIsLegendHidden(true);
                 }}
                 className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/5 flex items-center justify-center animate-none"
                 title="Скрыть Навигатор"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300/80 leading-relaxed font-sans">
              <p>• <span className="font-semibold text-slate-100">Колёсико мыши</span> — приблизить / отдалить карту</p>
              <p>• <span className="font-semibold text-slate-100">Левая кнопка мыши + тащить</span> — навигация панорамы</p>
              <p>• <span className="font-semibold text-slate-100">Клик на термин</span> — открыть полную расшифровку теории</p>
              <p>• <span className="font-semibold text-slate-100">Zoom-уровни</span> — открой {zoom * 100 < 70 ? '① Кластеры' : zoom * 100 < 125 ? '② Субтопики' : '③ Полная Детализация'}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-purple-400" />
              <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                v5.3 Live
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>

<div className={`absolute inset-0 z-40 transition-opacity duration-300 pointer-events-none ${isUiHidden ? 'opacity-5' : ''}`}>

      {/* Catalog activator moved to left vertical toolbar icon */}

      {/* Minimized Catalog activator */}
      {isCatalogHidden && (
        <motion.button
          initial={{ opacity: 0, x: -10, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 0.7 }}
          exit={{ opacity: 0, x: -10, scale: 0.8 }}
          onClick={() => setIsCatalogHidden(false)}
          className="absolute bottom-1.5 left-0 z-40 p-2.5 bg-[#070716]/90 border border-indigo-500/30 text-indigo-400 hover:text-white hover:bg-slate-900 rounded-xl backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center gap-2 cursor-pointer font-mono text-[9px] tracking-widest uppercase pointer-events-auto"
          title="Показать Каталог Сфер"
        >
          <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">ПОКАЗАТЬ КАТАЛОГ</span>
        </motion.button>
      )}

      {/* LEFT HUD: Sidebar Cluster List (Framer Motion enabled) */}
      <AnimatePresence>
        {!isCatalogHidden && (
          <>
            {renderPanelLock('catalog')}
            <motion.div
            initial={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            animate={isPanelBeingDragged('catalog') ? { opacity: 1, scale: 0.7 } : { opacity: 1, x: 0, y: 0, scale: 0.7 }}
            exit={{ opacity: 0, x: 25, y: -25, scale: 0.65 }}
            transition={(isCatalogMovable || getDragProps('catalog').drag) ? { type: 'tween', duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom left', ...(isCatalogMovable ? { cursor: 'move' } : getDragProps('catalog').style) }}
            drag={isCatalogMovable || getDragProps('catalog').drag}
            dragMomentum={false}
            dragElastic={0}
            dragTransition={{ bounceStiffness: 0, bounceDamping: 0, power: 0, timeConstant: 0 }}
            onDragStart={() => setPanelDraggingId('catalog')}
            onDragEnd={() => setPanelDraggingId(null)}
            whileDrag={{ transition: { duration: 0 } }}
            className={`hud-panel absolute bottom-[6px] left-0 w-64 max-h-[calc(100vh-80px)] overflow-hidden flex flex-col bg-[#070716] border border-white/20 rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.9)] z-40 opacity-100 ${isCatalogOpen ? 'h-[320px]' : 'h-[40px]'} pointer-events-auto ${isPanelsUnlocked || isCatalogMovable ? 'ring-2 ring-emerald-500/50' : ''} ${isPanelBeingDragged('catalog') ? '' : 'transition-all duration-300'} z-40 pointer-events-auto ${isPanelsUnlocked || isCatalogMovable ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            {activeCluster ? (
              <>
                <div
                  className="flex items-center justify-between px-3 py-2 border-b border-white/5 flex-shrink-0"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <h3 className="font-display font-medium text-[9px] text-slate-300 tracking-wider truncate max-w-[130px]">
                      ТЕМЫ: {activeCluster.title.toUpperCase()}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCatalogMovable(v => !v);
                      }}
                      className={`transition-colors cursor-pointer p-0.5 rounded flex items-center justify-center ${isCatalogMovable ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400 hover:text-emerald-400 hover:bg-white/5'}`}
                      title={isCatalogMovable ? "Зафиксировать панель" : "Перемещать панель по экрану"}
                    >
                      <Move className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCatalogHidden(true);
                      }}
                      className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-white/5 flex items-center justify-center"
                      title="Скрыть Каталог"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {isCatalogOpen && (
                  <div className="overflow-y-auto flex-1 divide-y divide-white/5 py-1 prevent-wheel-zoom">
                    {[...activeCluster.subtopics, ...activeCluster.details].map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 hover:bg-white/5 transition-colors duration-150 group cursor-default"
                        onClick={() => handleTermClick(topic.text)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-semibold text-slate-200 select-none truncate group-hover:text-white cursor-pointer">
                            {topic.text}
                          </span>
                        </div>
                      </div>
                    ))}
                    {activeCluster.subtopics.length === 0 && activeCluster.details.length === 0 && (
                      <div className="p-6 text-center text-[11px] text-slate-500">
                        Темы не найдены
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  className="flex items-center justify-between px-3 py-2 border-b border-white/5 flex-shrink-0 pointer-events-auto"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Database className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <h3 className="font-display font-medium text-[10px] text-white tracking-wider">
                      КАТАЛОГ СФЕР ({filteredClusters.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addNewCluster();
                        if (!isCatalogOpen) setIsCatalogOpen(true);
                        setIsCatalogHidden(false);
                      }}
                      className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/5 flex items-center justify-center mr-1"
                      title="Добавить Новую Сферу"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCatalogHidden(true);
                      }}
                      className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/5 flex items-center justify-center"
                      title="Скрыть Каталог"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {isCatalogOpen && (
                  <div className="overflow-y-auto flex-1 divide-y divide-white/5 py-1 prevent-wheel-zoom">
                    {filteredClusters.map((cluster) => (
                      <div
                        key={cluster.id}
                        className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors duration-150 group cursor-default"
                        onClick={() => flyToCluster(cluster)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ background: cluster.color }} 
                          />
                          <span className="text-xs font-semibold text-slate-200 select-none truncate group-hover:text-white cursor-pointer">
                            {cluster.title.replace(/\n/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredClusters.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-500">
                        Совпадений не обнаружено
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>

      {/* ALWAYS VISIBLE UI TOGGLE BUTTON */}
      <AnimatePresence>
        {true && (
          <motion.button
            initial={{ opacity: 0, scale: 0.48 }}
            animate={{ opacity: 1, scale: 0.6 }}
            exit={{ opacity: 0, scale: 0.48 }}
            whileHover={{ scale: 0.65 }}
            onClick={() => setIsUiHidden(prev => !prev)}
            style={{ transformOrigin: 'top right' }}
            className="absolute top-[104px] right-6 z-50 p-3 bg-[#070716]/90 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl backdrop-blur-xl transition-colors duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer"
            title={isUiHidden ? "Показать интерфейс" : "Скрыть интерфейс"}
          >
            {isUiHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            <span className="ml-2 text-xs font-semibold tracking-wider font-sans hidden sm:inline">
              {isUiHidden ? 'ПОКАЗАТЬ ИНТЕРФЕЙС' : 'СКРЫТЬ ИНТЕРФЕЙС'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* FLOATING HOVER TOOLTIP */}
      <TooltipLayer definitions={definitions} />

      {/* DETAILED MODAL DIALOG WITH EDITABLE DEFINITIONS */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#060613]/95 border-2 border-indigo-500/30 rounded-2xl max-w-lg w-full shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-indigo-950/40 via-[#070719]/90 to-transparent border-b border-indigo-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span className="font-mono text-[10px] uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    РАСШИФРОВКА ТЕРМИНА
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent((selectedTerm || '') + ' значение тайная космическая программа великое пробуждение эзотерика')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
                    title="Искать в Google"
                  >
                    <Search className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://www.perplexity.ai/search?q=${encodeURIComponent('Подробно объясни термин: ' + (selectedTerm || '') + ' в контексте тем: тайная космическая программа, великое пробуждение, нью-эйдж, ��зотерика')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
                    title="Искать в Perplexity"
                  >
                    <Brain className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setSelectedTerm(null)}
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Core Area */}
              <div className="p-6">
                <h2 className="text-2xl font-display font-extrabold tracking-wide text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                  {selectedTerm}
                </h2>

                {isEditingDef ? (
                  <div className="space-y-4">
                    <label className="block text-xs font-mono text-purple-400 tracking-wide uppercase">
                      Редактор описания (сохраняется в локальном хранилище):
                    </label>
                    <textarea
                      className="w-full bg-[#03030a] border border-indigo-500/30 rounded-xl p-4 text-slate-100 text-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none leading-relaxed transition-all font-sans"
                      rows={6}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      placeholder="Введите новое описание..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingDesc(false)}
                        className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={saveEditedDefinition}
                        className="px-4 py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400/70 tracking-widest uppercase mb-1">
                      АРХИВНОЕ ОПРЕДЕЛЕНИЕ СИСТЕМЫ:
                    </label>
                    <div className="bg-[#03030a] border border-white/5 rounded-xl p-5 leading-relaxed text-sm md:text-base text-slate-200">
                      {definitions[selectedTerm] || 'Определение для данного термина пока отсутствует в архивах.'}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingText(definitions[selectedTerm] || '');
                          setIsEditingDesc(true);
                        }}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium bg-indigo-500/5 hover:bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/15"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Редактировать ар��ив
                      </button>
                      <span className="text-[10px] font-mono text-slate-500">
                        Индекс: {selectedTerm.substring(0, 3).toUpperCase()}-11
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Overlay Trigger hint */}
              <div className="px-6 py-4 bg-slate-950/40 border-t border-white/5 text-center text-[10px] text-slate-500 tracking-wider">
                Кликните за пределами окна или нажмите Esc для закрытия
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED ACTIVE SPHERE MODAL WITH EDITABLE CLUSTER DESCRIPTION */}
      <AnimatePresence>
        {isViewingClusterInfo && activeCluster && (
          <motion.div
            drag
            dragControls={passportDragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            dragTransition={{ bounceStiffness: 0, bounceDamping: 0, power: 0, timeConstant: 0 }}
            onDragStart={() => setPanelDraggingId('passport')}
            onDragEnd={() => setPanelDraggingId(null)}
            whileDrag={{ transition: { duration: 0 } }}
            initial={{ scale: 0.92, y: 15, opacity: 0 }}
            animate={isPanelBeingDragged('passport') ? { scale: 1, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bg-[#050510]/95 border-2 border-cyan-500/30 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col prevent-wheel-zoom z-[110] max-h-[90vh]"
            style={{ 
              width: passportWidth, 
              height: passportHeight, 
              left: `calc(50vw - ${passportWidth / 2}px)`, 
              top: '10vh',
              touchAction: "none" 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              onPointerDown={(e) => passportDragControls.start(e)}
              className="px-6 py-5 bg-gradient-to-r from-cyan-950/40 via-[#050514]/90 to-transparent border-b border-cyan-500/10 flex items-center justify-between shrink-0 cursor-move select-none"
            >
              <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase text-cyan-400 tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    ПАСПОРТ АКТИВНОЙ СФЕРЫ
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(activeCluster.title.replace(/\n/g, ' ') + ' значение тайная космическая программа великое пробуждение э��отерика')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
                    title="Искать в Google"
                  >
                    <Search className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://www.perplexity.ai/search?q=${encodeURIComponent('Подробно объясни концепцию: ' + activeCluster.title.replace(/\n/g, ' ') + ' в контексте тем: тайная космическая программа, конспирология, великое пробуждение, нью-эйдж, эзотерика')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
                    title="Искать в Perplexity"
                  >
                    <Brain className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setIsViewingClusterInfo(false)}
                    className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Core Area */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 prevent-wheel-zoom">
                <div className="flex items-center gap-2.5 mb-3">
                  <span 
                    className="w-3.5 h-3.5 rounded-full relative bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" 
                    style={{ backgroundColor: activeCluster.color }}
                  />
                  <input 
                    type="text"
                    className="w-full bg-transparent text-2xl font-display font-extrabold tracking-wide text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 rounded px-1 -ml-1 border border-transparent focus:bg-[#03030b] hover:bg-white/5 transition-colors"
                    value={activeCluster.title.replace(/\n/g, ' ')}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setActiveCluster(prev => prev ? { ...prev, title: newTitle } : prev);
                      updateClusterTitle(activeCluster.id, newTitle);
                      setHasUnsavedEdits(true);
                    }}
                  />
                </div>

                {isEditingClusterDef ? (
                  <div className="space-y-4">
                    <label className="block text-xs font-mono text-cyan-400 tracking-wide uppercase">
                      Редактировать описание сферы:
                    </label>
                    <textarea
                      className="w-full bg-[#03030b]/90 border border-cyan-500/30 rounded-xl p-4 text-slate-100 text-sm focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none leading-relaxed transition-all font-sans"
                      rows={6}
                      value={editingClusterText}
                      onChange={(e) => {
                        setEditingClusterText(e.target.value);
                        setHasUnsavedEdits(true);
                      }}
                      placeholder="Введите новое описание сферы..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1.5">
                      Информационная модель Логоса:
                    </label>
                    <div className="bg-[#020207] border border-cyan-500/10 rounded-xl p-5 leading-relaxed text-sm md:text-base text-slate-200 max-h-56 overflow-y-auto prevent-wheel-zoom">
                      {localClusterDefs[activeCluster.id] || "Сведения временно недоступн��."}
                    </div>

                    {/* Subtopics and details of this sphere as quick-jump tags */}
                    {((activeCluster.subtopics && activeCluster.subtopics.length > 0) || (activeCluster.details && activeCluster.details.length > 0) || isMoveMode) ? (
                      <div className="mt-5">
                        <label className="block text-[10px] font-mono text-indigo-400 tracking-widest uppercase mb-2">
                          Связанные темы и детали:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[...((activeCluster.subtopics || []).map(s => ({ ...s, isDetail: false }))), ...((activeCluster.details || []).map(d => ({ ...d, isDetail: true })))].map((sub, idx) => (
                            <div key={`sub-tag-${idx}`} className="flex items-stretch gap-0 border border-indigo-500/20 rounded-lg overflow-hidden group">
                              {isMoveMode && (
                                <input
                                  type="color"
                                  value={sub.color || '#ffffff'}
                                  onChange={(e) => {
                                    updateSubtopicColor(activeCluster.id, sub.text, e.target.value, sub.isDetail);
                                    setHasUnsavedEdits(true);
                                  }}
                                  className="w-6 border-0 bg-indigo-500/5 cursor-pointer outline-none self-stretch p-0 block h-auto aspect-square m-0 rounded-none border-r border-indigo-500/20 opacity-70 group-hover:opacity-100 transition-opacity"
                                  title="Цвет подтемы"
                                />
                              )}
                              <button
                                onClick={() => {
                                  if (!isMoveMode) {
                                    handleTermClick(sub.text);
                                    setIsViewingClusterInfo(false);
                                  }
                                }}
                                className={`text-[10px] font-semibold bg-indigo-500/5 ${!isMoveMode ? 'hover:bg-indigo-500/20 cursor-pointer' : 'cursor-default'} px-2.5 py-1 text-indigo-300 ${!isMoveMode ? 'hover:text-white' : ''} transition-all border-none block`}
                              >
                                {sub.text}
                              </button>
                            </div>
                          ))}
                        </div>
                        {isMoveMode && (
                          <div className="mt-4 flex flex-col gap-3 p-3 bg-indigo-950/20 rounded-lg border border-indigo-500/20">
                            <span className="text-indigo-300 text-[10px] font-mono uppercase tracking-widest">ФОРМА СФЕРЫ:</span>
                            <div className="flex flex-col gap-3 shadow-inner">
                              <label className="flex flex-col gap-1.5">
                                <span className="text-slate-400 text-xs font-semibold">Радиус: {activeCluster.radius}</span>
                                <input 
                                  type="range" 
                                  min="20" max="600" step="5"
                                  className="accent-indigo-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                  value={activeCluster.radius}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    updateClusterPositionAndRadius(activeCluster.id, activeCluster.x, activeCluster.y, val);
                                    setActiveCluster(prev => prev ? { ...prev, radius: val } : prev);
                                    setHasUnsavedEdits(true);
                                  }}
                                />
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <label className="flex flex-col gap-1.5">
                                  <span className="text-slate-400 text-xs font-semibold">Сжатие X: {activeCluster.shapeRatioX || 1.0}</span>
                                  <input 
                                    type="range" 
                                    min="0.1" max="3.0" step="0.05"
                                    className="accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                    value={activeCluster.shapeRatioX || 1.0}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      updateClusterPositionAndRadius(activeCluster.id, activeCluster.x, activeCluster.y, activeCluster.radius, val, activeCluster.shapeRatioY);
                                      setActiveCluster(prev => prev ? { ...prev, shapeRatioX: val } : prev);
                                      setHasUnsavedEdits(true);
                                    }}
                                  />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                  <span className="text-slate-400 text-xs font-semibold">Сжатие Y: {activeCluster.shapeRatioY || 1.0}</span>
                                  <input 
                                    type="range" 
                                    min="0.1" max="3.0" step="0.05"
                                    className="accent-cyan-400 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                    value={activeCluster.shapeRatioY || 1.0}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      updateClusterPositionAndRadius(activeCluster.id, activeCluster.x, activeCluster.y, activeCluster.radius, activeCluster.shapeRatioX, val);
                                      setActiveCluster(prev => prev ? { ...prev, shapeRatioY: val } : prev);
                                      setHasUnsavedEdits(true);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                        {isMoveMode && (
                          <div className="mt-4 flex flex-col gap-3 p-3 bg-indigo-950/20 rounded-lg border border-indigo-500/20">
                            <span className="text-indigo-300 text-[10px] font-mono uppercase tracking-widest">ЦВЕТА УЗЛА:</span>
                            
                            <div className="flex flex-col gap-2 shadow-inner">
                              <label className="flex flex-col gap-1.5">
                                <span className="text-slate-400 text-xs font-semibold">Цвет Сферы:</span>
                                <select 
                                  className="bg-slate-900 border border-slate-700 rounded-md p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                  onChange={(e) => {
                                    updateClusterColor(activeCluster.id, e.target.value);
                                    setHasUnsavedEdits(true);
                                  }}
                                  value={activeCluster.color || "#ffffff"}
                                >
                                  {PRESET_COLORS.map(c => (
                                    <option key={`sphere-${c.value}`} value={c.value}>{c.label}</option>
                                  ))}
                                </select>
                              </label>

                              <label className="flex flex-col gap-1.5 mt-2">
                                <span className="text-slate-400 text-xs font-semibold">Цвет Подтем / Детал��й:</span>
                                <select 
                                  className="bg-slate-900 border border-slate-700 rounded-md p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                      activeCluster.subtopics?.forEach(s => updateSubtopicColor(activeCluster.id, s.text, val, false));
                                      activeCluster.details?.forEach(d => updateSubtopicColor(activeCluster.id, d.text, val, true));
                                      e.target.value = ""; // reset selection to visual indication
                                      setHasUnsavedEdits(true);
                                    }
                                  }}
                                  defaultValue=""
                                >
                                  <option value="" disabled>-- Выберите цвет --</option>
                                  {PRESET_COLORS.map(c => (
                                    <option key={`subs-${c.value}`} value={c.value}>{c.label}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </div>
                        )}
                        {isMoveMode && (
                          <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                            {!isAddingSubtopic ? (
                              <button
                                onClick={() => setIsAddingSubtopic(true)}
                                className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-md text-xs font-semibold cursor-pointer border border-indigo-500/20 transition-all font-sans"
                              >
                                + Добавить подтему
                              </button>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={newSubtopicName}
                                  onChange={(e) => setNewSubtopicName(e.target.value)}
                                  placeholder="Название подтемы..."
                                  className="bg-slate-800 border border-indigo-500/30 rounded p-2 text-xs text-white"
                                />
                                <textarea
                                  value={newSubtopicDesc}
                                  onChange={(e) => setNewSubtopicDesc(e.target.value)}
                                  placeholder="Описание подтемы..."
                                  className="bg-slate-800 border border-indigo-500/30 rounded p-2 text-xs text-white resize-none h-16"
                                />
                                <div className="flex gap-2 justify-end mt-1">
                                  <button
                                    onClick={() => {
                                      setIsAddingSubtopic(false);
                                      setNewSubtopicName('');
                                      setNewSubtopicDesc('');
                                    }}
                                    className="px-3 py-1.5 text-[10px] bg-slate-700 hover:bg-slate-600 text-white rounded cursor-pointer transition-colors font-sans"
                                  >
                                    Отмена
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (newSubtopicName.trim() !== '') {
                                        addSubtopic(activeCluster.id, newSubtopicName.trim());
                                        if (newSubtopicDesc.trim() !== '') {
                                          updateDefinition(newSubtopicName.trim(), newSubtopicDesc.trim());
                                        }
                                        setIsAddingSubtopic(false);
                                        setNewSubtopicName('');
                                        setNewSubtopicDesc('');
                                        setHasUnsavedEdits(true);
                                      }
                                    }}
                                    className="px-3 py-1.5 text-[10px] bg-indigo-500 hover:bg-indigo-600 text-white rounded cursor-pointer transition-colors font-sans"
                                  >
                                    Добавить
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-indigo-500/20">
                              <span className="text-indigo-300 text-[10px] font-mono uppercase tracking-widest block mb-2">ПОСТРОЕНИЕ СВЯЗЕЙ:</span>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => {
                                    arrangeClusterNodes(activeCluster.id, 'perimeter');
                                    setHasUnsavedEdits(true);
                                  }}
                                  className="px-2 py-1.5 text-[9px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded cursor-pointer border border-indigo-500/20 transition-colors uppercase font-mono tracking-wider"
                                >
                                  По Окружности
                                </button>
                                <button
                                  onClick={() => {
                                    arrangeClusterNodes(activeCluster.id, 'inside');
                                    setHasUnsavedEdits(true);
                                  }}
                                  className="px-2 py-1.5 text-[9px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded cursor-pointer border border-indigo-500/20 transition-colors uppercase font-mono tracking-wider"
                                >
                                  Внутри Сферы
                                </button>
                                <button
                                  onClick={() => {
                                    arrangeClusterNodes(activeCluster.id, 'chaotic');
                                    setHasUnsavedEdits(true);
                                  }}
                                  className="px-2 py-1.5 text-[9px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded cursor-pointer border border-indigo-500/20 transition-colors uppercase font-mono tracking-wider"
                                >
                                  Хаотично
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-red-500/20">
                              <button
                                onClick={() => {
                                  if (confirm("Вы уверены, что хотите удалить эту сферу?")) {
                                    deleteCluster(activeCluster.id);
                                    setIsViewingClusterInfo(false);
                                    setActiveCluster(null);
                                    setHasUnsavedEdits(true);
                                  }
                                }}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-red-950/20 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-white rounded-lg text-xs font-semibold xl transition-colors cursor-pointer"
                              >
                                🗑️ Удалить Сферу
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingClusterText(localClusterDefs[activeCluster.id] || '');
                          setIsEditingClusterDef(true);
                        }}
                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium bg-cyan-500/5 hover:bg-cyan-500/10 px-3 py-2 rounded-lg border border-cyan-500/15 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Редактировать описание сферы
                      </button>
                      <span className="text-[10px] font-mono text-cyan-500">
                        ID: SPHERE-{activeCluster.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Overlay Trigger hint */}
              <div className="px-6 py-4 bg-slate-950/40 border-t border-white/5 text-center text-[10px] text-slate-500 tracking-wider">
                Нажмите Esc или крестик для закрытия
              </div>

              {/* Resizer Handle */}
              <div
                onMouseDown={startPassportResize}
                onTouchStart={startPassportResize}
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1.5 z-[120] hover:bg-cyan-500/10 active:bg-cyan-500/20 rounded-bl-xl transition-colors"
                title="Изменить размер окна"
              >
                <svg 
                  className="w-3 h-3 text-cyan-400 opacity-60 hover:opacity-100 transition-opacity" 
                  viewBox="0 0 10 10" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="8" y1="2" x2="2" y2="8" />
                  <line x1="8" y1="5" x2="5" y2="8" />
                </svg>
              </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasUnsavedEdits && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[200] w-[90%] max-w-sm pointer-events-auto"
          >
            <div className="bg-gradient-to-t from-[#050514]/95 to-slate-900/90 border border-green-500/30 p-2 rounded-2xl shadow-[0_15px_40px_rgba(34,197,94,0.3)] backdrop-blur-xl">
              <button
                onClick={() => {
                  setHasUnsavedEdits(false);
                  setShowSaveToast(true);
                  setTimeout(() => setShowSaveToast(false), 3000);
                  
                  // Instantly commit clusters to localStorage
                  localStorage.setItem('archive-clusters-state-v5', JSON.stringify(clusters));

                  if (isEditingClusterDef && activeCluster) {
                    updateClusterDef(activeCluster.id, editingClusterText);
                    setIsEditingClusterDef(false);
                  } else if (activeCluster) {
                    // Update any existing custom definitions 
                    const updatedClusterDefs = { ...localClusterDefs, [activeCluster.id]: localClusterDefs[activeCluster.id] || "" };
                    localStorage.setItem('archive-custom-cluster-defs-v5', JSON.stringify(updatedClusterDefs));
                  }
                }}
                className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold tracking-widest text-xs uppercase shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse hover:animate-none"
              >
                <Check className="w-5 h-5" />
                Сохранить изменения
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documentation and Project Info Modal */}
      <AnimatePresence>
        {isDocModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDocModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020207]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0a0a1a] border max-h-[85vh] overflow-y-auto custom-scrollbar prevent-wheel-zoom border-indigo-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/40 sticky top-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-semibold tracking-wide text-white uppercase font-mono">Архив Логоса — Документация</h3>
                </div>
                <button
                  onClick={() => setIsDocModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 pb-12 space-y-8">
                
                {/* Intro Section */}
                <section>
                  <h4 className="text-xl font-bold text-white mb-2 tracking-tight">О проекте</h4>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                    <p>
                      <strong>Архив Логоса</strong> — это передовая визуальная нода для исследования и структурирования сложных эзотерических, исторических и конспирологических данных. Проект объединяет разрозненные элементы в единое глобальное древо знаний. 
                    </p>
                    <p>
                      Постр����н на базе современного стека технологий, что обеспечивает плавную симуляцию косми��еской среды: гравитации кластеров, динамических орбит подтем и плавных переходов камеры.
                    </p>
                  </div>
                </section>

                {/* Tech Stack */}
                <section>
                  <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Стек Технологий</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></div>
                      <div>
                        <strong className="text-white block">React 18 + Vite</strong>
                        <span className="text-xs text-slate-400">Производительный интерфейс и сборка</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                      <div>
                        <strong className="text-white block">Framer Motion</strong>
                        <span className="text-xs text-slate-400">Плавная анимация окон, списков и элементов HUD</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></div>
                      <div>
                        <strong className="text-white block">Tailwind CSS</strong>
                        <span className="text-xs text-slate-400">Утилитарная стилизация, эффекты стекла и теней</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></div>
                      <div>
                        <strong className="text-white block">Lucide Icons</strong>
                        <span className="text-xs text-slate-400">Векторные иконки инте��фе������</span>
                      </div>
                    </li>
                  </ul>
                </section>

                {/* Features */}
                <section>
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Основные возможности</h4>
                  <ul className="space-y-4 text-sm text-slate-300">
                    <li className="flex flex-col gap-1">
                      <strong className="text-white">Движок Планетарной Физики (Cosmic Engine)</strong>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Реализует базовые законы физики: гравитационное притяжение между сферами (основанное на их массе/радиусе), трение космического эфира и упругое столкновение объектов. Сферы имеют склонность возвращаться в свои узлы (позиции) для поддержания структуры созвездий.
                      </p>
                    </li>
                    <li className="flex flex-col gap-1">
                      <strong className="text-white">Бесконечный Canvas с ZUI</strong>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Слоистый интерфейс ZUI (Zoomable User Interface) плавно скрывает элементы информации в зависимости от масштабирования (уровня погружения слоя), помогая сохранить визу��льную чистоту карты и фокусировку на объектах исследования.
                      </p>
                    </li>
                    <li className="flex flex-col gap-1">
                      <strong className="text-white">Глубокая кастомизация среды</strong>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Пользователи могут менять размер сфер, орбиты, скорость полета между кластерами и активировать уникальные цветовые схемы (например, «Космический Свет», «Кибер-Розовый», и другие) для персонализации пространства.
                      </p>
                    </li>
                    <li className="flex flex-col gap-1">
                      <strong className="text-white">Режим перемещения сущностей</strong>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        В этом режиме гравитация отключается, а пространственно-временной континуум фиксируется, позволяя пользователю вручную перетаскивать планетарные кластеры в новые точки и редактировать их размер.
                      </p>
                    </li>
                  </ul>
                </section>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-950/90 border border-emerald-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Save className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">Система логгирования</span>
              <span className="font-sans font-medium text-white text-sm">Данные Архива сохранены!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOAD TOAST NOTIFICATION */}
      <AnimatePresence>
        {showLoadToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-950/90 border border-emerald-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-md flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">Система л��ггирования</span>
              <span className="font-sans font-medium text-white text-sm">Данные Архива успешно загружены!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DebugPanel />

    </div>
  );
}

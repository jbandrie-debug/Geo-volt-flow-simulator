/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CircuitComponent, SolverResult, Wire } from '../types/circuit';
import { CircuitModel } from '../services/circuitSolver';
import { ToolMode } from './Toolbar';
import { i18n } from '../services/i18n';
import {
  RotateCw,
  Copy,
  Trash2,
  ToggleRight,
  ToggleLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Hand,
  MousePointer,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Move,
} from 'lucide-react';

interface CircuitCanvasProps {
  model: CircuitModel;
  solverResult: SolverResult;
  currentTool: ToolMode;
  selectedId: string | null;
  onSelectComponent: (id: string | null) => void;
  onSelectWire: (wireId: string | null) => void;
  onComponentMoved: () => void;
  onToggleSwitch: (componentId: string) => void;
  onAddWire: (fromTerminalId: string, toTerminalId: string) => void;
  onAddComponent: (type: any, position: { x: number; y: number }) => void;
  onDeleteElement: (id: string) => void;
  onRotateComponent?: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onSelectTool?: (tool: ToolMode) => void;
}

interface Particle {
  id: number;
  routeIndex: number;
  progress: number;
  direction: number;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  model,
  solverResult,
  currentTool,
  selectedId,
  onSelectComponent,
  onSelectWire,
  onComponentMoved,
  onToggleSwitch,
  onAddWire,
  onAddComponent,
  onDeleteElement,
  onRotateComponent,
  onDuplicateComponent,
  onSelectTool,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Canvas Zoom and Pan transformation state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [showPanDpad, setShowPanDpad] = useState<boolean>(false);

  // Spacebar tracking for holding Space to pan on desktop
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    const handleBlur = () => {
      setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Manual Nudge Pan for D-pad buttons
  const nudgePan = useCallback((dx: number, dy: number) => {
    setPan((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  // References for panning & multi-touch pinch-to-zoom
  const panStartRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number }>({
    clientX: 0,
    clientY: 0,
    panX: 0,
    panY: 0,
  });
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1.0);
  const pinchCenterRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });
  const pinchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging state for components
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wire drawing state
  const [wireStartTerminal, setWireStartTerminal] = useState<string | null>(null);
  const [tempPointerPos, setTempPointerPos] = useState<{ x: number; y: number } | null>(null);

  // Hovered terminal for visual snapping feedback
  const [hoveredTerminal, setHoveredTerminal] = useState<string | null>(null);

  // Particles for charge flow animation
  const [particles, setParticles] = useState<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Convert client coordinate to Canvas World coordinate (accounts for pan & zoom)
  const getSVGPoint = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom,
      };
    },
    [pan.x, pan.y, zoom]
  );

  // Zoom by factor centered on the canvas center
  const zoomBy = useCallback((factor: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const screenX = rect.width / 2;
    const screenY = rect.height / 2;

    setZoom((prevZoom) => {
      const nextZoom = Math.min(3.0, Math.max(0.35, Number((prevZoom * factor).toFixed(2))));
      if (nextZoom === prevZoom) return prevZoom;

      setPan((prevPan) => ({
        x: Math.round(screenX - (screenX - prevPan.x) * (nextZoom / prevZoom)),
        y: Math.round(screenY - (screenY - prevPan.y) * (nextZoom / prevZoom)),
      }));

      return nextZoom;
    });
  }, []);

  // Fit all circuit components to the current view with nice padding
  const handleFitToView = useCallback(() => {
    const components = Array.from(model.components.values());
    if (!svgRef.current || components.length === 0) {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    components.forEach((comp) => {
      const w = comp.type === 'battery' || comp.type === 'acSource' ? 80 : 80;
      const h = comp.type === 'battery' || comp.type === 'acSource' ? 80 : 40;
      minX = Math.min(minX, comp.position.x);
      minY = Math.min(minY, comp.position.y);
      maxX = Math.max(maxX, comp.position.x + w);
      maxY = Math.max(maxY, comp.position.y + h);
    });

    const rect = svgRef.current.getBoundingClientRect();
    const contentWidth = Math.max(80, maxX - minX);
    const contentHeight = Math.max(60, maxY - minY);
    const padding = 70;

    const scaleX = (rect.width - padding * 2) / contentWidth;
    const scaleY = (rect.height - padding * 2) / contentHeight;
    const fitZoom = Math.min(2.0, Math.max(0.4, Math.min(scaleX, scaleY)));

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    const newPanX = rect.width / 2 - contentCenterX * fitZoom;
    const newPanY = rect.height / 2 - contentCenterY * fitZoom;

    setZoom(Number(fitZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [model.components]);

  // Reset view to default 100% at origin
  const handleResetView = useCallback(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom centered at cursor pointer - only when Ctrl is held or Pan tool is active
  // This prevents accidental auto-zooming or scrolling when moving over the working panel!
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      // Require Ctrl/Cmd key or active Pan tool for wheel zoom
      const isZoomAllowed = e.ctrlKey || e.metaKey || currentTool === 'pan';
      if (!isZoomAllowed) return;

      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.15 : 0.87;

      setZoom((prevZoom) => {
        const nextZoom = Math.min(3.0, Math.max(0.35, Number((prevZoom * factor).toFixed(3))));
        if (nextZoom === prevZoom) return prevZoom;

        setPan((prevPan) => ({
          x: Math.round(screenX - (screenX - prevPan.x) * (nextZoom / prevZoom)),
          y: Math.round(screenY - (screenY - prevPan.y) * (nextZoom / prevZoom)),
        }));

        return nextZoom;
      });
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [currentTool]);

  // Compute multi-segment routes for particles based on solver result paths
  const getRoutes = useCallback(() => {
    const paths = solverResult.paths && solverResult.paths.length > 0
      ? solverResult.paths
      : solverResult.path
      ? [solverResult.path]
      : [];

    return paths.map((path) => {
      const segments: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const fromPos = model.getTerminalPosition(path[i]);
        const toPos = model.getTerminalPosition(path[i + 1]);
        if (fromPos && toPos) {
          segments.push({ from: fromPos, to: toPos });
        }
      }
      return segments;
    }).filter((s) => s.length > 0);
  }, [model, solverResult.paths, solverResult.path]);

  // Initialize particles when conduction path is active
  useEffect(() => {
    const routes = getRoutes();
    if (solverResult.valid && routes.length > 0 && (solverResult.current || 0) > 0.001) {
      const newParticles: Particle[] = [];
      let pId = 0;
      routes.forEach((route, rIdx) => {
        const count = Math.max(3, Math.min(8, route.length * 2));
        for (let i = 0; i < count; i++) {
          newParticles.push({
            id: pId++,
            routeIndex: rIdx,
            progress: i / count,
            direction: 1,
          });
        }
      });
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [solverResult.valid, solverResult.current, solverResult.path, solverResult.paths, getRoutes]);

  // Animation loop
  useEffect(() => {
    const isAC = solverResult.sourceType === 'ac';
    const speed = 0.004;

    const tick = () => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev.map((p) => {
          let nextProg = p.progress + speed * (isAC ? p.direction : 1);
          let nextDir = p.direction;

          if (isAC) {
            if (nextProg >= 1) {
              nextProg = 1;
              nextDir = -1;
            } else if (nextProg <= 0) {
              nextProg = 0;
              nextDir = 1;
            }
          } else {
            if (nextProg >= 1) {
              nextProg -= 1;
            }
          }

          return {
            ...p,
            progress: nextProg,
            direction: nextDir,
          };
        });
      });
      animFrameRef.current = requestAnimationFrame(tick);
    };

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [particles.length, solverResult.sourceType]);

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Track active pointers for multi-touch pinch-to-zoom
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    // Multi-touch pinch gesture detected (2+ fingers)
    if (activePointersRef.current.size >= 2) {
      const pts = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      pinchStartZoomRef.current = zoom;
      pinchCenterRef.current = {
        clientX: (pts[0].clientX + pts[1].clientX) / 2,
        clientY: (pts[0].clientY + pts[1].clientY) / 2,
      };
      pinchStartPanRef.current = { ...pan };

      // Cancel any ongoing component or wire interaction
      setDraggedCompId(null);
      setWireStartTerminal(null);
      setTempPointerPos(null);
      setIsPanning(false);
      return;
    }

    // Check if manual pan is triggered:
    // 1. Explicit Hand/Pan tool mode
    // 2. Spacebar held down on desktop
    // 3. Middle mouse button (button === 1)
    const isManualPanActive = currentTool === 'pan' || isSpacePressed || e.button === 1;

    if (isManualPanActive) {
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      (e.currentTarget as SVGElement).setPointerCapture?.(e.pointerId);
      return;
    }

    const pt = getSVGPoint(e);
    const target = e.target as SVGElement;
    // Scale tolerance slightly with zoom for comfortable snapping
    const terminalSnapTolerance = Math.max(22, Math.min(48, 30 / zoom));
    const terminalId = model.findTerminalAt(pt.x, pt.y, terminalSnapTolerance);

    // If Wire tool or clicking on terminal
    if (currentTool === 'wire' || (currentTool === 'select' && terminalId)) {
      if (terminalId) {
        setWireStartTerminal(terminalId);
        setTempPointerPos(pt);
        target.setPointerCapture?.(e.pointerId);
        return;
      }
    }

    // Delete tool
    if (currentTool === 'delete') {
      const compEl = target.closest('[data-component-id]') as HTMLElement;
      const wireEl = target.closest('[data-wire-id]') as HTMLElement;
      if (compEl) {
        onDeleteElement(compEl.dataset.componentId!);
      } else if (wireEl) {
        onDeleteElement(wireEl.dataset.wireId!);
      }
      return;
    }

    // Placing new component
    if (['battery', 'acSource', 'resistor', 'capacitor', 'inductor', 'switch', 'bulb', 'appliance', 'utilityBox', 'ground'].includes(currentTool)) {
      onAddComponent(currentTool, { x: Math.round(pt.x - 40), y: Math.round(pt.y - 20) });
      return;
    }

    // Select mode
    if (currentTool === 'select') {
      // Check switch toggle
      const switchControl = target.closest('[data-switch-control]') as HTMLElement;
      if (switchControl) {
        onToggleSwitch(switchControl.dataset.switchControl!);
        return;
      }

      // Check component click
      const compEl = target.closest('[data-component-id]') as HTMLElement;
      if (compEl) {
        const id = compEl.dataset.componentId!;
        onSelectComponent(id);
        const comp = model.getComponent(id);
        if (comp) {
          setDraggedCompId(id);
          setDragOffset({
            x: pt.x - comp.position.x,
            y: pt.y - comp.position.y,
          });
          target.setPointerCapture?.(e.pointerId);
        }
        return;
      }

      // Check wire click
      const wireEl = target.closest('[data-wire-id]') as HTMLElement;
      if (wireEl) {
        onSelectWire(wireEl.dataset.wireId!);
        return;
      }

      // Clicked on empty space: simply deselect.
      // NOTE: Auto-drag is removed! Panning is manual only via Hand Tool ✋ or Spacebar.
      onSelectComponent(null);
      onSelectWire(null);
      setIsPanning(false);
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // Update pointer position in active map
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    // Handle 2-finger pinch-to-zoom & pan
    if (activePointersRef.current.size >= 2 && pinchStartDistRef.current && svgRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      const ratio = dist / pinchStartDistRef.current;
      const nextZoom = Math.min(3.0, Math.max(0.35, Number((pinchStartZoomRef.current * ratio).toFixed(3))));

      const rect = svgRef.current.getBoundingClientRect();
      const currentCenterX = (pts[0].clientX + pts[1].clientX) / 2 - rect.left;
      const currentCenterY = (pts[0].clientY + pts[1].clientY) / 2 - rect.top;
      const initialCenterX = pinchCenterRef.current.clientX - rect.left;
      const initialCenterY = pinchCenterRef.current.clientY - rect.top;

      const newPanX = currentCenterX - (initialCenterX - pinchStartPanRef.current.x) * (nextZoom / pinchStartZoomRef.current);
      const newPanY = currentCenterY - (initialCenterY - pinchStartPanRef.current.y) * (nextZoom / pinchStartZoomRef.current);

      setZoom(nextZoom);
      setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
      return;
    }

    // Handle canvas background dragging / panning
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
      return;
    }

    const pt = getSVGPoint(e);

    // Terminal hover detection for magnetic snap with adaptive tolerance
    const terminalSnapTolerance = Math.max(22, Math.min(48, 28 / zoom));
    const hoveredTerm = model.findTerminalAt(pt.x, pt.y, terminalSnapTolerance);
    setHoveredTerminal(hoveredTerm);

    // Component Dragging in Canvas World Coordinates
    if (draggedCompId && currentTool === 'select') {
      const comp = model.getComponent(draggedCompId);
      if (comp) {
        comp.position.x = Math.round(pt.x - dragOffset.x);
        comp.position.y = Math.round(pt.y - dragOffset.y);
        onComponentMoved();
      }
      return;
    }

    // Temporary Wire line
    if (wireStartTerminal) {
      setTempPointerPos(pt);
    }
  };

  // Pointer Up / Cancel
  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }

    const target = e.target as SVGElement;
    try {
      target.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore if not captured
    }

    if (isPanning) {
      setIsPanning(false);
    }

    if (draggedCompId) {
      setDraggedCompId(null);
      onComponentMoved();
    }

    if (wireStartTerminal) {
      const pt = getSVGPoint(e);
      const terminalSnapTolerance = Math.max(22, Math.min(48, 30 / zoom));
      const endTerminal = model.findTerminalAt(pt.x, pt.y, terminalSnapTolerance);
      if (endTerminal && endTerminal !== wireStartTerminal) {
        onAddWire(wireStartTerminal, endTerminal);
      }
      setWireStartTerminal(null);
      setTempPointerPos(null);
    }
  };

  const wireStartPos = wireStartTerminal ? model.getTerminalPosition(wireStartTerminal) : null;
  const routes = getRoutes();

  // Helper to interpolate position along route segments
  const getParticlePos = (segments: { from: { x: number; y: number }; to: { x: number; y: number } }[], prog: number) => {
    if (!segments || segments.length === 0) return { x: 0, y: 0 };
    const totalSegs = segments.length;
    const segIdx = Math.min(Math.floor(prog * totalSegs), totalSegs - 1);
    const segProg = (prog * totalSegs) % 1;
    const seg = segments[segIdx] || segments[0];
    return {
      x: seg.from.x + (seg.to.x - seg.from.x) * segProg,
      y: seg.from.y + (seg.to.y - seg.from.y) * segProg,
    };
  };

  return (
    <div className="relative flex-1 w-full h-full bg-[#141925] overflow-hidden select-none">
      {/* Wire creation guidance toast */}
      {wireStartTerminal && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-cyan-950/90 text-cyan-200 border border-cyan-500/50 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-medium flex items-center gap-2 backdrop-blur-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Tap target terminal to connect wire</span>
        </div>
      )}

      {/* Pan Mode Banner Notification */}
      {currentTool === 'pan' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-emerald-950/95 text-emerald-200 border border-emerald-500/50 px-4 py-1.5 rounded-full shadow-xl text-xs font-medium flex items-center gap-2.5 backdrop-blur-md animate-in fade-in">
          <Hand className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{i18n.getLanguage() === 'ceb' ? 'Manwal nga Drag / Pan Mode' : 'Manual Canvas Drag (Hand Tool)'}</span>
          {onSelectTool && (
            <button
              onClick={() => onSelectTool('select')}
              className="ml-1 px-2.5 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition shadow-sm"
            >
              {i18n.getLanguage() === 'ceb' ? 'Balik sa Select ↖' : 'Select Tool ↖'}
            </button>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        id="circuit-canvas"
        className={`w-full h-full block touch-none select-none transition-colors ${
          isPanning
            ? 'cursor-grabbing'
            : currentTool === 'pan' || isSpacePressed
            ? 'cursor-grab'
            : currentTool === 'select'
            ? 'cursor-default'
            : currentTool === 'wire'
            ? 'cursor-crosshair'
            : currentTool === 'delete'
            ? 'cursor-pointer'
            : 'cursor-crosshair'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          {/* Engineering dot grid pattern scaled and translated with zoom & pan */}
          <pattern
            id="grid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          >
            <circle cx="15" cy="15" r="1.2" fill="#2d374d" />
          </pattern>
          {/* Bulb glow gradient */}
          <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffae0" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* ZOOM & PAN TRANSFORMED CIRCUIT SCENE */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* WIRES LAYER */}
          <g className="wires-layer">
          {model.wires.map((wire) => {
            const fromPos = model.getTerminalPosition(wire.from);
            const toPos = model.getTerminalPosition(wire.to);
            if (!fromPos || !toPos) return null;
            const isSelected = selectedId === wire.id;

            return (
              <g key={wire.id} data-wire-id={wire.id} className="cursor-pointer group">
                {/* 24px transparent hit target */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="transparent"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                {/* Visual wire outline glow when selected */}
                {isSelected && (
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke="#ffa502"
                    strokeWidth="8"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                  />
                )}
                {/* Visible conductor line */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isSelected ? '#ffa502' : '#38bdf8'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="transition-colors group-hover:stroke-sky-300"
                />
              </g>
            );
          })}
        </g>

        {/* TEMPORARY WIRE BEING DRAWN */}
        {wireStartPos && tempPointerPos && (
          <line
            x1={wireStartPos.x}
            y1={wireStartPos.y}
            x2={tempPointerPos.x}
            y2={tempPointerPos.y}
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6,4"
            strokeLinecap="round"
          />
        )}

        {/* ANIMATED CHARGE FLOW PARTICLES */}
        <g className="particles-layer pointer-events-none">
          {particles.map((p) => {
            const route = routes[p.routeIndex];
            if (!route) return null;
            const pos = getParticlePos(route, p.progress);
            return (
              <circle
                key={p.id}
                cx={pos.x}
                cy={pos.y}
                r="3.5"
                fill={solverResult.sourceType === 'ac' ? '#38bdf8' : '#fbbf24'}
                filter="drop-shadow(0 0 4px rgba(251,191,36,0.8))"
              />
            );
          })}
        </g>

        {/* COMPONENTS LAYER */}
        <g className="components-layer">
          {Array.from(model.components.values()).map((comp) => {
            const isSelected = selectedId === comp.id;
            const compResult = solverResult.componentResults.get(comp.id);
            const isEnergized = Boolean(compResult && compResult.current > 0.005);
            const center = model.getComponentCenter(comp.type);
            const rot = comp.rotation || 0;

            return (
              <g
                key={comp.id}
                data-component-id={comp.id}
                transform={`translate(${comp.position.x}, ${comp.position.y})`}
                className="cursor-move"
              >
                {/* Selection border bounding box */}
                {isSelected && (
                  <rect
                    x="-6"
                    y="-6"
                    width={comp.type === 'battery' || comp.type === 'acSource' ? 92 : 92}
                    height={comp.type === 'battery' || comp.type === 'acSource' ? 92 : 52}
                    rx="8"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                )}

                {/* Floating Quick Action Toolbar over selected component */}
                {isSelected && (
                  <g transform="translate(0, -38)" className="cursor-default select-none pointer-events-auto">
                    <foreignObject x="-10" y="0" width="160" height="36" className="overflow-visible">
                      <div className="flex items-center gap-1 bg-[#182030]/95 backdrop-blur-md border border-blue-500/60 rounded-xl px-1.5 py-1 shadow-2xl text-white">
                        {comp.type === 'switch' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSwitch(comp.id);
                            }}
                            title="Toggle Switch State"
                            className="p-1.5 rounded-lg hover:bg-slate-700/80 text-violet-400 hover:text-white transition cursor-pointer"
                          >
                            {comp.properties.closed ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRotateComponent?.(comp.id);
                          }}
                          title="Rotate 90°"
                          className="p-1.5 rounded-lg hover:bg-slate-700/80 text-blue-400 hover:text-white transition cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateComponent?.(comp.id);
                          }}
                          title="Duplicate Component"
                          className="p-1.5 rounded-lg hover:bg-slate-700/80 text-emerald-400 hover:text-white transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteElement(comp.id);
                          }}
                          title="Delete Component"
                          className="p-1.5 rounded-lg hover:bg-red-700/80 text-red-400 hover:text-white transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </foreignObject>
                  </g>
                )}

                {/* Render specific component SVG symbol with rotation */}
                <g transform={`rotate(${rot}, ${center.x}, ${center.y})`}>
                  {renderComponentSymbol(comp, isEnergized)}
                </g>

                {/* Terminals with generous hit targets */}
                {comp.terminals.map((t) => {
                  const isHovered = hoveredTerminal === t.id;
                  const isPositive = t.type === 'positive';
                  const isNegative = t.type === 'negative';
                  const absPos = model.getTerminalPosition(t.id);
                  const relX = absPos ? absPos.x - comp.position.x : t.position.x;
                  const relY = absPos ? absPos.y - comp.position.y : t.position.y;

                  return (
                    <g key={t.id} transform={`translate(${relX}, ${relY})`}>
                      {/* 28px invisible hit target */}
                      <circle cx="0" cy="0" r="14" fill="transparent" />
                      {/* Outer snap feedback ring */}
                      {isHovered && (
                        <circle cx="0" cy="0" r="10" fill="none" stroke="#38bdf8" strokeWidth="2" />
                      )}
                      {/* Visible terminal pin */}
                      <circle
                        cx="0"
                        cy="0"
                        r="5"
                        fill={isPositive ? '#ef4444' : isNegative ? '#3b82f6' : '#f59e0b'}
                        stroke="#1a2030"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </g>
    </svg>

    {/* FLOATING ZOOM & MANUAL PAN HUD */}
    <div className="absolute bottom-20 right-3 md:bottom-6 md:right-6 z-20 flex flex-col items-end gap-2 select-none pointer-events-auto">
      {/* Optional Popout Manual Pan Directional Nudge D-Pad */}
      {showPanDpad && (
        <div className="bg-[#182030]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Move className="w-3 h-3 text-cyan-400" />
            <span>{i18n.getLanguage() === 'ceb' ? 'Manwal Pan' : 'Manual Pan'}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              onClick={() => nudgePan(0, 70)}
              title={i18n.t('pan-up')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/90 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white transition cursor-pointer shadow-sm"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div />

            <button
              onClick={() => nudgePan(70, 0)}
              title={i18n.t('pan-left')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/90 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white transition cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title={i18n.t('zoom-reset')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => nudgePan(-70, 0)}
              title={i18n.t('pan-right')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/90 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white transition cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div />
            <button
              onClick={() => nudgePan(0, -70)}
              title={i18n.t('pan-down')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/90 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white transition cursor-pointer shadow-sm"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div />
          </div>
        </div>
      )}

      {/* Main HUD Bar */}
      <div className="flex flex-col items-center bg-[#182030]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-2xl space-y-1">
        {/* Pointer / Hand Tool Toggle in HUD for 1-tap switching */}
        {onSelectTool && (
          <div className="flex flex-col gap-1 p-0.5 bg-slate-900/60 rounded-xl">
            <button
              onClick={() => onSelectTool('select')}
              title={i18n.t('tool-select')}
              className={`w-9 h-8 flex items-center justify-center rounded-lg transition active:scale-95 cursor-pointer ${
                currentTool === 'select'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTool('pan')}
              title={i18n.t('tool-pan')}
              className={`w-9 h-8 flex items-center justify-center rounded-lg transition active:scale-95 cursor-pointer ${
                currentTool === 'pan'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Hand className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="w-6 h-[1px] bg-slate-700/60 my-0.5" />

        {/* Zoom In button */}
        <button
          onClick={() => zoomBy(1.2)}
          disabled={zoom >= 3.0}
          title={i18n.t('zoom-in')}
          aria-label="Zoom In"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-blue-600 active:scale-95 text-slate-200 hover:text-white transition disabled:opacity-40 disabled:hover:bg-slate-800/80 cursor-pointer shadow-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Percent / Reset 100% button */}
        <button
          onClick={handleResetView}
          title={i18n.t('zoom-reset')}
          aria-label="Reset Zoom to 100%"
          className="w-9 py-1 px-0.5 text-[11px] font-bold font-mono text-center rounded-lg hover:bg-slate-700/80 active:scale-95 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom Out button */}
        <button
          onClick={() => zoomBy(1 / 1.2)}
          disabled={zoom <= 0.35}
          title={i18n.t('zoom-out')}
          aria-label="Zoom Out"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-blue-600 active:scale-95 text-slate-200 hover:text-white transition disabled:opacity-40 disabled:hover:bg-slate-800/80 cursor-pointer shadow-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-6 h-[1px] bg-slate-700/60 my-0.5" />

        {/* Manual Pan D-pad Toggle */}
        <button
          onClick={() => setShowPanDpad((prev) => !prev)}
          title={showPanDpad ? 'Hide Pan Arrows' : 'Show Manual Pan Arrows'}
          aria-label="Manual Pan Controls"
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition active:scale-95 cursor-pointer shadow-sm ${
            showPanDpad
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Move className="w-4 h-4" />
        </button>

        {/* Fit to View button */}
        <button
          onClick={handleFitToView}
          title={i18n.t('zoom-fit')}
          aria-label="Fit to View"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white transition cursor-pointer shadow-sm"
        >
          <Maximize2 className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Reset Origin button */}
        <button
          onClick={handleResetView}
          title={i18n.t('zoom-reset')}
          aria-label="Reset View"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Manual Drag guidance pill */}
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800/90 text-[10px] text-slate-400 backdrop-blur-sm shadow-md pointer-events-none whitespace-nowrap">
        <Hand className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>{i18n.t('zoom-pan-hint')}</span>
      </div>
    </div>

    {/* Empty State Banner if canvas is empty */}
    {model.components.size === 0 && (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
        <div className="bg-[#1a2030]/90 backdrop-blur-sm border border-[#2d374d] p-6 rounded-2xl max-w-md shadow-2xl space-y-3">
          <div className="text-3xl">⚡</div>
          <h2 className="text-lg font-bold text-slate-100">{i18n.t('empty-state-title')}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{i18n.t('empty-state-desc')}</p>
          <div className="pt-2 text-[11px] text-amber-400/90 font-medium">
            👉 {i18n.t('drag-wire-hint')}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

// Helper renderer for SVG symbols
function renderComponentSymbol(comp: CircuitComponent, isEnergized: boolean) {
  const p = comp.properties;

  switch (comp.type) {
    case 'battery':
      return (
        <g>
          {/* Main battery body */}
          <rect x="25" y="10" width="30" height="60" rx="4" fill="#252e44" stroke="#4ade80" strokeWidth="2" />
          <line x1="40" y1="0" x2="40" y2="10" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="40" y1="70" x2="40" y2="80" stroke="#3b82f6" strokeWidth="2.5" />
          {/* Battery cell plates */}
          <line x1="30" y1="30" x2="50" y2="30" stroke="#4ade80" strokeWidth="3" />
          <line x1="34" y1="38" x2="46" y2="38" stroke="#4ade80" strokeWidth="2" />
          <line x1="30" y1="46" x2="50" y2="46" stroke="#4ade80" strokeWidth="3" />
          <line x1="34" y1="54" x2="46" y2="54" stroke="#4ade80" strokeWidth="2" />
          {/* Polarity signs */}
          <text x="40" y="22" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">+</text>
          <text x="40" y="66" fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">−</text>
          <text x="75" y="44" fill="#e2e8f0" fontSize="11" fontWeight="bold" fontFamily="monospace">
            {p.voltage ?? 9}V
          </text>
        </g>
      );

    case 'acSource':
      return (
        <g>
          <line x1="40" y1="0" x2="40" y2="15" stroke="#06b6d4" strokeWidth="2.5" />
          <line x1="40" y1="65" x2="40" y2="80" stroke="#06b6d4" strokeWidth="2.5" />
          <circle cx="40" cy="40" r="25" fill="#252e44" stroke="#06b6d4" strokeWidth="2" />
          {/* Sine wave symbol */}
          <path d="M 28 40 Q 34 26 40 40 T 52 40" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
          <text x="75" y="38" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {p.voltageRms ?? 120}V~
          </text>
          <text x="75" y="50" fill="#94a3b8" fontSize="9" fontFamily="monospace">
            {p.frequency ?? 60}Hz
          </text>
        </g>
      );

    case 'resistor':
      return (
        <g>
          <line x1="0" y1="20" x2="15" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="65" y1="20" x2="80" y2="20" stroke="#94a3b8" strokeWidth="2" />
          {/* Zigzag resistor teeth */}
          <path
            d="M 15 20 L 21 10 L 29 30 L 37 10 L 45 30 L 53 10 L 59 30 L 65 20"
            fill="none"
            stroke="#fb923c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="40" y="42" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {p.resistance ?? 10} Ω
          </text>
        </g>
      );

    case 'bulb':
      return (
        <g>
          <line x1="0" y1="20" x2="25" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="55" y1="20" x2="80" y2="20" stroke="#94a3b8" strokeWidth="2" />
          {/* Glow backdrop when energized */}
          {isEnergized && (
            <circle cx="40" cy="20" r="28" fill="url(#bulbGlow)" className="animate-pulse" />
          )}
          {/* Glass bulb circle */}
          <circle
            cx="40"
            cy="20"
            r="16"
            fill={isEnergized ? '#fef08a' : '#1e2638'}
            stroke={isEnergized ? '#facc15' : '#64748b'}
            strokeWidth="2"
          />
          {/* Filament cross */}
          <path
            d="M 32 28 L 48 12 M 32 12 L 48 28"
            stroke={isEnergized ? '#dc2626' : '#94a3b8'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text x="40" y="48" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {p.resistance ?? 5} Ω
          </text>
        </g>
      );

    case 'switch':
      return (
        <g>
          {/* Terminal connecting leads */}
          <line x1="0" y1="20" x2="20" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="60" y1="20" x2="80" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="20" cy="20" r="3" fill="#a78bfa" />
          <circle cx="60" cy="20" r="3" fill="#a78bfa" />

          {/* Generous 30px transparent touch target for toggling on mobile & desktop */}
          <rect
            data-switch-control={comp.id}
            x="15"
            y="0"
            width="50"
            height="35"
            fill="transparent"
            className="cursor-pointer"
          />

          {/* Switch blade lever */}
          {p.closed ? (
            <line
              data-switch-control={comp.id}
              x1="20"
              y1="20"
              x2="60"
              y2="20"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              className="cursor-pointer"
            />
          ) : (
            <line
              data-switch-control={comp.id}
              x1="20"
              y1="20"
              x2="55"
              y2="2"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              className="cursor-pointer"
            />
          )}
          <text x="40" y="38" fill={p.closed ? '#4ade80' : '#f87171'} fontSize="10" fontWeight="bold" textAnchor="middle">
            {p.closed ? 'CLOSED' : 'OPEN'}
          </text>
        </g>
      );

    case 'capacitor':
      return (
        <g>
          <line x1="0" y1="20" x2="35" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="45" y1="20" x2="80" y2="20" stroke="#94a3b8" strokeWidth="2" />
          {/* Parallel plates */}
          <line x1="35" y1="8" x2="35" y2="32" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="45" y1="8" x2="45" y2="32" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          <text x="40" y="44" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {((p.value ?? 1e-6) * 1e6).toFixed(1)} µF
          </text>
        </g>
      );

    case 'inductor':
      return (
        <g>
          <line x1="0" y1="20" x2="16" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="64" y1="20" x2="80" y2="20" stroke="#94a3b8" strokeWidth="2" />
          {/* Coiled loops */}
          <path
            d="M 16 20 A 6 8 0 0 1 28 20 A 6 8 0 0 1 40 20 A 6 8 0 0 1 52 20 A 6 8 0 0 1 64 20"
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.5"
          />
          <text x="40" y="40" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {((p.value ?? 0.01) * 1e3).toFixed(1)} mH
          </text>
        </g>
      );

    case 'appliance':
      return (
        <g>
          <line x1="0" y1="20" x2="15" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <line x1="65" y1="20" x2="80" y2="20" stroke="#94a3b8" strokeWidth="2" />
          <rect
            x="15"
            y="5"
            width="50"
            height="30"
            rx="5"
            fill="#252e44"
            stroke={isEnergized ? '#fb7185' : '#64748b'}
            strokeWidth="2"
          />
          <text x="40" y="20" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle">
            APPLIANCE
          </text>
          <text x="40" y="30" fill="#e2e8f0" fontSize="8" textAnchor="middle" fontFamily="monospace">
            {p.ratedPower ?? 100}W
          </text>
        </g>
      );

    case 'utilityBox':
      return (
        <g>
          <rect x="0" y="0" width="60" height="60" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          <text x="30" y="34" fill="#60a5fa" fontSize="9" fontWeight="bold" textAnchor="middle">
            JUNCTION
          </text>
        </g>
      );

    case 'ground':
      return (
        <g>
          <line x1="10" y1="0" x2="10" y2="12" stroke="#34d399" strokeWidth="2" />
          <line x1="0" y1="12" x2="20" y2="12" stroke="#34d399" strokeWidth="2" />
          <line x1="4" y1="17" x2="16" y2="17" stroke="#34d399" strokeWidth="2" />
          <line x1="8" y1="22" x2="12" y2="22" stroke="#34d399" strokeWidth="2" />
        </g>
      );

    default:
      return null;
  }
}

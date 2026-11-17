import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TopNav from './components/TopNav/TopNav';
import { Select, Type, Image, Filters } from 'lucide-react'
import LeftToolbar from './components/LeftToolbar/LeftToolbar';
import CanvasEditor from './components/Editor/CanvasEditor';
import PropertiesPanel from './components/Editor/PropertiesPanel';
import LayersPanel from './components/Editor/LayersPanel';
import AIMagic from './components/AI/AIMagic';
import ToastContainer from './components/UI/ToastContainer';
import AuthModal from './components/UI/AuthModal';
import SettingsModal from './components/UI/SettingsModal';
import ExportModal from './components/UI/ExportModal';
import { showToast } from './utils/toast';
import { createDemoImageData } from './utils/imageProcessing';
import { exportEditedImage } from './utils/exportImage';
import type { Adjustments, EditorLayer, FilterName, ToolName } from './types/editor';

const defaultAdjustments: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 100,
  temperature: 100,
  sharpness: 100,
  blur: 0,
};

type Snapshot = {
  imageSrc: string | null;
  layers: EditorLayer[];
  adjustments: Adjustments;
  filter: FilterName;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  compareMode: boolean;
  comparePosition: number;
};

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('pixelforge-demo.png');
  const [imageMeta, setImageMeta] = useState({ width: 1200, height: 800 });
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolName>('select');
  const [pickedColor, setPickedColor] = useState('#8b5cf6');
  const [adjustments, setAdjustments] = useState<Adjustments>(defaultAdjustments);
  const [filter, setFilter] = useState<FilterName>('Original');
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState<number>(0.92);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const captureSnapshot = useCallback((): Snapshot => ({
    imageSrc,
    layers,
    adjustments,
    filter,
    rotation,
    flipX,
    flipY,
    compareMode,
    comparePosition,
  }), [adjustments, compareMode, comparePosition, filter, flipX, flipY, imageSrc, layers, rotation]);

  const commit = useCallback((next: Partial<Snapshot>) => {
    const snapshot = captureSnapshot();
    setHistory((prev) => [...prev, snapshot]);
    setFuture([]);
    if (next.imageSrc !== undefined) setImageSrc(next.imageSrc);
    if (next.layers !== undefined) setLayers(next.layers);
    if (next.adjustments !== undefined) setAdjustments(next.adjustments);
    if (next.filter !== undefined) setFilter(next.filter);
    if (next.rotation !== undefined) setRotation(next.rotation);
    if (next.flipX !== undefined) setFlipX(next.flipX);
    if (next.flipY !== undefined) setFlipY(next.flipY);
    if (next.compareMode !== undefined) setCompareMode(next.compareMode);
    if (next.comparePosition !== undefined) setComparePosition(next.comparePosition);
  }, [captureSnapshot]);

  const undo = useCallback(() => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setFuture((prev) => [captureSnapshot(), ...prev]);
    setHistory((prev) => prev.slice(0, -1));
    setImageSrc(previous.imageSrc);
    setLayers(previous.layers);
    setAdjustments(previous.adjustments);
    setFilter(previous.filter);
    setRotation(previous.rotation);
    setFlipX(previous.flipX);
    setFlipY(previous.flipY);
    setCompareMode(previous.compareMode);
    setComparePosition(previous.comparePosition);
  }, [captureSnapshot, history]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setHistory((prev) => [...prev, captureSnapshot()]);
    setFuture((prev) => prev.slice(1));
    setImageSrc(next.imageSrc);
    setLayers(next.layers);
    setAdjustments(next.adjustments);
    setFilter(next.filter);
    setRotation(next.rotation);
    setFlipX(next.flipX);
    setFlipY(next.flipY);
    setCompareMode(next.compareMode);
    setComparePosition(next.comparePosition);
  }, [captureSnapshot, future]);

  const handleToolSelection = useCallback((tool: ToolName) => {
    setActiveTool(tool);

    switch (tool) {
      case 'crop':
        if (!imageSrc) {
          showToast('Upload an image to crop it', 2200);
          return;
        }
        setImageMeta((prev) => ({ width: Math.max(320, Math.round(prev.width * 0.9)), height: Math.max(240, Math.round(prev.height * 0.9)) }));
        showToast('Crop preset applied', 1800);
        break;
      case 'resize':
        if (imageSrc) {
          setImageMeta({ width: 1080, height: 1080 });
          showToast('Canvas resized to 1080 × 1080', 1800);
        }
        break;
      case 'rotate':
        setRotation((prev) => (prev + 90) % 360);
        showToast('Canvas rotated 90°', 1600);
        break;
      case 'blur':
        if (!imageSrc) {
          showToast('Upload an image to blur it', 2200);
          return;
        }
        setAdjustments((prev) => ({ ...prev, blur: Math.min(20, prev.blur + 2) }));
        showToast('Blur increased', 1600);
        break;
      case 'pixelate':
        if (!imageSrc) {
          showToast('Upload an image to pixelate it', 2200);
          return;
        }
        setAdjustments((prev) => ({ ...prev, sharpness: Math.min(200, prev.sharpness + 15) }));
        showToast('Pixelation effect applied', 1600);
        break;
      case 'colorpicker': {
        const colorInput = document.getElementById('global-color-picker') as HTMLInputElement | null;
        if (colorInput) {
          colorInput.focus();
          colorInput.click();
        }
        showToast('Color picker opened', 1600);
        break;
      }
      case 'text':
        showToast('Click on the canvas to place text', 1800);
        break;
      case 'rect':
      case 'ellipse':
      case 'triangle':
      case 'diamond':
      case 'star':
      case 'line':
      case 'arrow':
        showToast(`${tool[0].toUpperCase()}${tool.slice(1)} tool ready`, 1600);
        break;
      default:
        break;
    }
  }, [imageSrc, setAdjustments, setImageMeta, setRotation]);

  const loadImageFromFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid file type. Please upload JPG, JPEG, PNG, or WEBP.', 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const snapshot = captureSnapshot();
        setHistory((prev) => [...prev, snapshot]);
        setFuture([]);
        setOriginalImageSrc(dataUrl);
        setImageSrc(dataUrl);
        setImageName(file.name || 'uploaded-image.png');
        setImageMeta({ width: img.width, height: img.height });
        setLayers([]);
        setSelectedLayerId(null);
        setAdjustments(defaultAdjustments);
        setFilter('Original');
        setRotation(0);
        setFlipX(false);
        setFlipY(false);
        showToast('Image uploaded successfully', 2200);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [captureSnapshot]);

  const loadDemoImage = useCallback(() => {
    const dataUrl = createDemoImageData();
    const img = new Image();
    img.onload = () => {
      const snapshot = captureSnapshot();
      setHistory((prev) => [...prev, snapshot]);
      setFuture([]);
      setOriginalImageSrc(dataUrl);
      setImageSrc(dataUrl);
      setImageMeta({ width: img.width, height: img.height });
      setImageName('pixelforge-demo.png');
      setLayers([]);
      setSelectedLayerId(null);
      setAdjustments(defaultAdjustments);
      setFilter('Original');
      setRotation(0);
      setFlipX(false);
      setFlipY(false);
      showToast('Demo image loaded', 2200);
    };
    img.src = dataUrl;
  }, [captureSnapshot]);

  const resetAdjustments = useCallback(() => {
    commit({ adjustments: defaultAdjustments, filter: 'Original' });
    showToast('Adjustments reset');
  }, [commit]);

  const addTextLayer = useCallback((x: number, y: number) => {
    const id = `text-${Date.now()}`;
    const nextLayer: EditorLayer = {
      id,
      name: 'Text Layer',
      type: 'text',
      visible: true,
      opacity: 1,
      text: 'PixelForge AI',
      x,
      y,
      fontSize: 52,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 700,
      italic: false,
      color: pickedColor,
      align: 'left',
    };
    const nextLayers = [...layers, nextLayer];
    commit({ layers: nextLayers });
    setSelectedLayerId(id);
    setActiveTool('select');
    showToast('Text layer added', 1800);
  }, [commit, layers, pickedColor]);

  const addShapeLayer = useCallback((shape: 'rect' | 'ellipse' | 'triangle' | 'diamond' | 'star' | 'line' | 'arrow' | 'circle', start: { x: number; y: number }, end: { x: number; y: number }) => {
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const id = `shape-${Date.now()}`;
    const alphaHex = pickedColor.length === 7 ? pickedColor + '33' : pickedColor;
    const layer: EditorLayer = {
      id,
      name: `${shape[0].toUpperCase()}${shape.slice(1)} shape`,
      type: 'shape',
      visible: true,
      opacity: 1,
      shape: shape === 'circle' ? 'ellipse' : shape,
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width,
      height,
      fill: alphaHex,
      stroke: pickedColor,
      strokeWidth: 3,
    };
    commit({ layers: [...layers, layer] });
    setSelectedLayerId(id);
    showToast('Shape added', 1800);
  }, [commit, layers, pickedColor]);

  const exportCurrentImage = useCallback(async () => {
    if (!imageSrc) {
      showToast('Upload an image before exporting', 2500);
      return;
    }

    const url = await exportEditedImage({
      imageSrc,
      layers,
      adjustments,
      filter,
      rotation,
      flipX,
      flipY,
      width: imageMeta.width,
      height: imageMeta.height,
      format: exportFormat,
      quality: exportQuality,
    });

    if (!url) {
      showToast('Export failed', 2500);
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelforge-edited.${exportFormat === 'jpg' ? 'jpg' : exportFormat}`;
    a.click();
    showToast('Export complete', 2200);
    setExportOpen(false);
  }, [adjustments, exportFormat, exportQuality, filter, flipX, flipY, imageMeta.height, imageMeta.width, imageSrc, layers, rotation]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setExportOpen(true);
      }
      if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) {
          setActiveTool('select');
        }
      }
      if (event.key === 'Delete' && selectedLayerId) {
        const next = layers.filter((layer) => layer.id !== selectedLayerId);
        commit({ layers: next });
        setSelectedLayerId(null);
      }
      if (event.key === 'Escape') {
        setActiveTool('select');
        setExportOpen(false);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [commit, layers, redo, selectedLayerId, undo]);

  useEffect(() => {
    const handleUpload = (event: Event) => {
      const custom = event as CustomEvent<File>;
      const file = custom.detail;
      if (file) loadImageFromFile(file);
    };

    const handleOpenFile = () => {
      fileInputRef.current?.click();
    };

    const handleDemoImage = () => {
      loadDemoImage();
    };

    window.addEventListener('pixelforge-upload', handleUpload as EventListener);
    window.addEventListener('pixelforge-open-file', handleOpenFile);
    window.addEventListener('pixelforge-demo-image', handleDemoImage);

    return () => {
      window.removeEventListener('pixelforge-upload', handleUpload as EventListener);
      window.removeEventListener('pixelforge-open-file', handleOpenFile);
      window.removeEventListener('pixelforge-demo-image', handleDemoImage);
    };
  }, [loadDemoImage, loadImageFromFile]);

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) || null,
    [layers, selectedLayerId],
  );

  return (
    <div className="app-shell">
      <ToastContainer />
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) loadImageFromFile(file);
          event.currentTarget.value = '';
        }}
      />

      <TopNav
        onNew={() => {
          const next = captureSnapshot();
          setHistory((prev) => [...prev, next]);
          setFuture([]);
          setImageSrc(null);
          setOriginalImageSrc(null);
          setLayers([]);
          setSelectedLayerId(null);
          setAdjustments(defaultAdjustments);
          setFilter('Original');
          setRotation(0);
          setFlipX(false);
          setFlipY(false);
          showToast('New project started', 2000);
        }}
        onOpen={() => fileInputRef.current?.click()}
        onUndo={undo}
        onRedo={redo}
        onBeforeAfter={() => setCompareMode((prev) => !prev)}
        onExport={() => setExportOpen(true)}
        onZoomIn={() => setZoom((prev) => Math.min(2.5, Number((prev + 0.1).toFixed(2)) ))}
        onZoomOut={() => setZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2)) ))}
        onAuthOpen={(m) => { setAuthMode(m || 'login'); setAuthOpen(true) }}
        onSettingsOpen={()=> setSettingsOpen(true)}
      />

      <AuthModal open={authOpen} mode={authMode} onClose={()=>setAuthOpen(false)} onAuthSuccess={(user)=>{ showToast(`Welcome ${user.email}`, 2000) }} />
      <SettingsModal open={settingsOpen} onClose={()=>setSettingsOpen(false)} onApply={(s)=>{ showToast('Settings saved', 1400) }} />

      <div className="toolbar-content-shell">
        <div className="left-tools-wrap">
          <LeftToolbar
            currentTool={activeTool}
            onTool={handleToolSelection}
          />
        </div>

        <main className="editor-panel-wrap">
          <CanvasEditor
            imageSrc={imageSrc}
            originalImageSrc={originalImageSrc}
            layers={layers}
            setLayers={setLayers}
            activeTool={activeTool}
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
            zoom={zoom}
            setZoom={setZoom}
            adjustments={adjustments}
            filter={filter}
            rotation={rotation}
            flipX={flipX}
            flipY={flipY}
            compareMode={compareMode}
            comparePosition={comparePosition}
            pan={{ x: panX, y: panY }}
            setPan={(value) => {
              setPanX(value.x);
              setPanY(value.y);
            }}
            onUploadImage={() => fileInputRef.current?.click()}
            onDemoImage={loadDemoImage}
            onAddTextLayer={addTextLayer}
            onAddShapeLayer={addShapeLayer}
          />
        </main>

        <aside className="right-sidebar-stack">
          <PropertiesPanel
            imageSrc={imageSrc}
            imageMeta={imageMeta}
            adjustments={adjustments}
            setAdjustments={setAdjustments}
            filter={filter}
            setFilter={setFilter}
            selectedLayer={selectedLayer}
            layers={layers}
            setLayers={setLayers}
            pickedColor={pickedColor}
            setPickedColor={setPickedColor}
            rotation={rotation}
            setRotation={setRotation}
            flipX={flipX}
            setFlipX={setFlipX}
            flipY={flipY}
            setFlipY={setFlipY}
            resetAdjustments={resetAdjustments}
            onResize={(width, height) => {
              if (!imageSrc) return;
              const updated = { ...imageMeta, width, height };
              setImageMeta(updated);
            }}
            onSmartCrop={(ratio: number) => {
              if (!imageSrc) return;
              const naturalW = imageMeta.width || 1200;
              const naturalH = imageMeta.height || 700;
              const cropHeight = Math.min(naturalH, naturalW / ratio);
              const cropWidth = cropHeight * ratio;
              setImageMeta({ width: Math.round(cropWidth), height: Math.round(cropHeight) });
              showToast('Smart crop suggested', 1800);
            }}
          />

          <LayersPanel
            layers={layers}
            setLayers={setLayers}
            selectedLayerId={selectedLayerId}
            setSelectedLayerId={setSelectedLayerId}
          />
        </aside>
      </div>

      {/* Mobile bottom toolbar */}
      <div className="mobile-bottom-toolbar fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-[95%] max-w-3xl flex items-center justify-between p-2"> 
        <div className="flex gap-2 w-full justify-between">
          <button className="action-btn" onClick={()=> handleToolSelection('select')}>Select</button>
          <button className="action-btn" onClick={()=> handleToolSelection('text')}>Text</button>
          <button className="action-btn" onClick={()=> handleToolSelection('rect')}>Shape</button>
          <button className="action-btn" onClick={()=> handleToolSelection('pixelate')}>Filters</button>
          <button className="action-btn primary" onClick={()=> setExportOpen(true)}>Export</button>
        </div>
      </div>

      <AIMagic
        imageSrc={imageSrc}
        onAutoEnhance={() => {
          if (!imageSrc) return showToast('Upload an image to enhance');
          setAdjustments({
            brightness: 110,
            contrast: 120,
            saturation: 125,
            exposure: 115,
            temperature: 105,
            sharpness: 120,
            blur: 0,
          });
          setFilter('Cinematic');
          showToast('AI auto enhance applied', 2200);
        }}
        onRemoveBackground={() => {
          if (!imageSrc) return showToast('Upload an image to remove the background');
          showToast('Connect an AI background-removal API to enable this feature.', 3000);
        }}
        onDescribe={() => {
          if (!imageSrc) return showToast('Upload an image to describe it');
          showToast('A modern and vibrant image with strong composition and balanced lighting.', 2600);
        }}
        onResizePreset={(preset) => {
          if (!imageSrc) return;
          if (preset === 'Instagram Post') setImageMeta({ width: 1080, height: 1080 });
          if (preset === 'Instagram Story') setImageMeta({ width: 1080, height: 1920 });
          if (preset === 'YouTube Thumbnail') setImageMeta({ width: 1280, height: 720 });
          if (preset === 'YouTube Shorts') setImageMeta({ width: 1080, height: 1920 });
          if (preset === 'Profile Picture') setImageMeta({ width: 512, height: 512 });
          showToast(`${preset} sizing applied`, 1800);
        }}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        format={exportFormat}
        setFormat={setExportFormat}
        quality={exportQuality}
        setQuality={setExportQuality}
        onExport={exportCurrentImage}
      />

      <div className="demo-actions-row">
        <button className="small-action" onClick={loadDemoImage}>Try Demo Image</button>
        <button className="small-action" onClick={() => fileInputRef.current?.click()}>Upload Image</button>
      </div>
    </div>
  );
}

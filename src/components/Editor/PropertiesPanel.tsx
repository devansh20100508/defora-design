import React from 'react';
import type { Adjustments, EditorLayer, FilterName } from '../../types/editor';

type PropertiesPanelProps = {
  imageSrc: string | null;
  imageMeta: { width: number; height: number };
  adjustments: Adjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<Adjustments>>;
  filter: FilterName;
  setFilter: React.Dispatch<React.SetStateAction<FilterName>>;
  selectedLayer: EditorLayer | null;
  layers: EditorLayer[];
  setLayers: React.Dispatch<React.SetStateAction<EditorLayer[]>>;
  pickedColor: string;
  setPickedColor: React.Dispatch<React.SetStateAction<string>>;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  flipX: boolean;
  setFlipX: React.Dispatch<React.SetStateAction<boolean>>;
  flipY: boolean;
  setFlipY: React.Dispatch<React.SetStateAction<boolean>>;
  resetAdjustments: () => void;
  onResize: (width: number, height: number) => void;
  onSmartCrop: (ratio: number) => void;
};

const filterOptions: FilterName[] = ['Original', 'Cinematic', 'Vintage', 'Black & White', 'Warm', 'Cool', 'Dramatic', 'Faded', 'High Contrast'];

export default function PropertiesPanel({
  imageSrc,
  imageMeta,
  adjustments,
  setAdjustments,
  filter,
  setFilter,
  selectedLayer,
  layers,
  setLayers,
  pickedColor,
  setPickedColor,
  rotation,
  setRotation,
  flipX,
  setFlipX,
  flipY,
  setFlipY,
  resetAdjustments,
  onResize,
  onSmartCrop,
}: PropertiesPanelProps) {
  const updateAdjustment = (key: keyof Adjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const updateSelectedText = (text: string) => {
    if (!selectedLayer || selectedLayer.type !== 'text') return;
    setLayers((prev) => prev.map((layer) => layer.id === selectedLayer.id ? { ...layer, text } : layer));
  };

  const updateSelectedTextColor = (color: string) => {
    if (!selectedLayer) return;
    setPickedColor(color);
    setLayers((prev) => prev.map((layer) => {
      if (layer.id !== selectedLayer.id) return layer;
      if (layer.type === 'text') return { ...layer, color };
      return layer;
    }));
  };

  const updateSelectedShapeColor = (fill: string, stroke: string) => {
    if (!selectedLayer || selectedLayer.type !== 'shape') return;
    setPickedColor(stroke);
    setLayers((prev) => prev.map((layer) => layer.id === selectedLayer.id ? { ...layer, fill, stroke } : layer));
  };

  const getShapeFillValue = (fill: string) => {
    if (!fill || fill === 'transparent') return '#8b5cf6';
    return fill.startsWith('#') ? fill.slice(0, 7) : '#8b5cf6';
  };

  const getShapeStrokeValue = (stroke: string) => {
    if (!stroke || stroke === 'transparent') return '#8b5cf6';
    return stroke.startsWith('#') ? stroke.slice(0, 7) : '#8b5cf6';
  };

  return (
    <aside className="properties-panel glass-panel">
      <div className="panel-section">
        <div className="section-title">Adjustments</div>

        {[
          ['brightness', 'Brightness', 0, 200],
          ['contrast', 'Contrast', 0, 200],
          ['saturation', 'Saturation', 0, 200],
          ['exposure', 'Exposure', 0, 200],
          ['temperature', 'Temperature', 0, 200],
          ['sharpness', 'Sharpness', 0, 200],
          ['blur', 'Blur', 0, 20],
        ].map(([key, label, min, max]) => {
          const adjustmentKey = key as keyof Adjustments;
          return (
            <div key={key} className="slider-group">
              <div className="slider-meta">
                <span>{label}</span>
                <strong>{adjustments[adjustmentKey]}</strong>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={adjustments[adjustmentKey]}
                onChange={(event) => updateAdjustment(adjustmentKey, Number(event.target.value))}
              />
            </div>
          );
        })}

        <button className="action-btn primary" onClick={resetAdjustments}>Reset adjustments</button>
      </div>

      <div className="panel-section">
        <div className="section-title">Filters</div>
        <div className="filter-grid">
          {filterOptions.map((option) => (
            <button
              key={option}
              className={`filter-chip ${filter === option ? 'active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-title">Color</div>
        <div className="slider-group" style={{ marginBottom: 12 }}>
          <div className="slider-meta">
            <span>Current color</span>
            <strong>{pickedColor}</strong>
          </div>
          <input
            id="global-color-picker"
            type="color"
            value={pickedColor}
            onChange={(event) => setPickedColor(event.target.value)}
            style={{ width: '100%', height: 40, border: 'none', background: 'transparent' }}
          />
        </div>
        {selectedLayer && (selectedLayer.type === 'text' || selectedLayer.type === 'shape') && (
          <button
            className="action-btn"
            onClick={() => {
              if (selectedLayer.type === 'text') updateSelectedTextColor(pickedColor);
              if (selectedLayer.type === 'shape') updateSelectedShapeColor(pickedColor + '33', pickedColor);
            }}
          >
            Apply color to selected layer
          </button>
        )}
      </div>

      <div className="panel-section">
        <div className="section-title">Transform</div>
        <div className="transform-grid">
          <button className="action-btn" onClick={() => setRotation((prev) => (prev + 90) % 360)}>Rotate +90°</button>
          <button className="action-btn" onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}>Rotate -90°</button>
          <button className="action-btn" onClick={() => setFlipX((prev) => !prev)}>Flip X</button>
          <button className="action-btn" onClick={() => setFlipY((prev) => !prev)}>Flip Y</button>
        </div>

        <div className="slider-group" style={{ marginTop: 12 }}>
          <div className="slider-meta">
            <span>Rotation</span>
            <strong>{rotation}°</strong>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={rotation}
            onChange={(event) => setRotation(Number(event.target.value))}
          />
        </div>
      </div>

      <div className="panel-section">
        <div className="section-title">Canvas</div>
        <div className="transform-grid">
          <button className="action-btn" onClick={() => onResize(Math.max(640, imageMeta.width), Math.max(480, imageMeta.height))}>Fit</button>
          <button className="action-btn" onClick={() => onResize(1080, 1080)}>Instagram</button>
          <button className="action-btn" onClick={() => onResize(1080, 1920)}>Story</button>
          <button className="action-btn" onClick={() => onResize(1280, 720)}>YouTube</button>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-title">Smart crop</div>
        <div className="ratio-buttons">
          {[1 / 1, 4 / 5, 16 / 9, 9 / 16, 3 / 2].map((ratio) => (
            <button key={ratio} className="action-btn" onClick={() => onSmartCrop(ratio)}> {ratio === 1 / 1 ? '1:1' : ratio === 4 / 5 ? '4:5' : ratio === 16 / 9 ? '16:9' : ratio === 9 / 16 ? '9:16' : '3:2'} </button>
          ))}
        </div>
      </div>

      {selectedLayer && selectedLayer.type === 'text' && (
        <div className="panel-section">
          <div className="section-title">Text</div>
          <textarea
            value={selectedLayer.text}
            onChange={(event) => updateSelectedText(event.target.value)}
            rows={3}
            placeholder="Text content"
          />
          <div style={{ marginTop: 10 }}>
            <label className="text-xs">Font family</label>
            <select className="w-full p-2 rounded mt-1 bg-black/10" value={(selectedLayer as any).fontFamily || 'Inter, sans-serif'} onChange={(e)=>{
              const ff = e.target.value;
              setLayers((prev)=> prev.map(l=> l.id === selectedLayer.id ? { ...l, fontFamily: ff } : l))
            }}>
              {['Inter, sans-serif','Roboto, sans-serif','Poppins, sans-serif','Playfair Display, serif','Lora, serif','Merriweather, serif','Oswald, sans-serif','Arial, sans-serif','Georgia, serif'].map(f=> <option key={f} value={f}>{f.split(',')[0]}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button className={`action-btn ${ (selectedLayer as any).fontWeight >= 700 ? 'active' : '' }`} onClick={()=> setLayers((prev)=> prev.map(l=> l.id===selectedLayer.id ? { ...l, fontWeight: ((l as any).fontWeight >=700 ? 400 : 700) } : l))}>B</button>
            <button className={`action-btn ${ (selectedLayer as any).italic ? 'active' : '' }`} onClick={()=> setLayers((prev)=> prev.map(l=> l.id===selectedLayer.id ? { ...l, italic: !(l as any).italic } : l))}>I</button>
          </div>
          <div className="slider-group" style={{ marginTop: 12 }}>
            <div className="slider-meta">
              <span>Text color</span>
              <strong>{selectedLayer.color}</strong>
            </div>
            <input
              type="color"
              value={selectedLayer.color}
              onChange={(event) => updateSelectedTextColor(event.target.value)}
              style={{ width: '100%', height: 40, border: 'none', background: 'transparent' }}
            />
          </div>
          <div className="slider-group" style={{ marginTop: 12 }}>
            <div className="slider-meta">
              <span>Font size</span>
              <strong>{selectedLayer.fontSize}px</strong>
            </div>
            <input
              type="range"
              min={12}
              max={160}
              value={selectedLayer.fontSize}
              onChange={(event) => {
                const nextFontSize = Number(event.target.value);
                setLayers((prev) => prev.map((layer) => layer.id === selectedLayer.id ? { ...layer, fontSize: nextFontSize } : layer));
              }}
            />
          </div>
        </div>
      )}

      {selectedLayer && selectedLayer.type === 'shape' && (
        <div className="panel-section">
          <div className="section-title">Shape</div>
          <div className="slider-group">
            <div className="slider-meta">
              <span>Fill</span>
              <strong>{selectedLayer.fill === 'transparent' ? 'No fill' : selectedLayer.fill}</strong>
            </div>
            <input
              type="color"
              value={getShapeFillValue(selectedLayer.fill)}
              onChange={(event) => updateSelectedShapeColor(event.target.value, selectedLayer.stroke)}
              style={{ width: '100%', height: 40, border: 'none', background: 'transparent' }}
            />
            <button
              className="action-btn"
              onClick={() => updateSelectedShapeColor('transparent', selectedLayer.stroke)}
              style={{ marginTop: 8 }}
            >
              No fill
            </button>
          </div>
          <div className="slider-group" style={{ marginTop: 12 }}>
            <div className="slider-meta">
              <span>Stroke</span>
              <strong>{selectedLayer.stroke}</strong>
            </div>
            <input
              type="color"
              value={getShapeStrokeValue(selectedLayer.stroke)}
              onChange={(event) => updateSelectedShapeColor(selectedLayer.fill, event.target.value)}
              style={{ width: '100%', height: 40, border: 'none', background: 'transparent' }}
            />
          </div>
          <div className="slider-group" style={{ marginTop: 12 }}>
            <div className="slider-meta">
              <span>Width</span>
              <strong>{selectedLayer.width}px</strong>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              value={selectedLayer.width}
              onChange={(event) => {
                const width = Number(event.target.value);
                setLayers((prev) => prev.map((layer) => layer.id === selectedLayer.id ? { ...layer, width } : layer));
              }}
            />
          </div>
          <div className="slider-group" style={{ marginTop: 12 }}>
            <div className="slider-meta">
              <span>Height</span>
              <strong>{selectedLayer.height}px</strong>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              value={selectedLayer.height}
              onChange={(event) => {
                const height = Number(event.target.value);
                setLayers((prev) => prev.map((layer) => layer.id === selectedLayer.id ? { ...layer, height } : layer));
              }}
            />
          </div>
          <div className="slider-group" style={{ marginTop: 12 }}>
            <div className="slider-meta">
              <span>Stroke width</span>
              <strong>{selectedLayer.strokeWidth}px</strong>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={selectedLayer.strokeWidth}
              onChange={(event) => {
                const strokeWidth = Number(event.target.value);
                setLayers((prev) => prev.map((layer) => layer.id === selectedLayer.id ? { ...layer, strokeWidth } : layer));
              }}
            />
          </div>
        </div>
      )}

      <div className="panel-section quick-actions">
        <div className="section-title">Quick actions</div>
        <div className="transform-grid">
          <button className="action-btn" onClick={() => window.dispatchEvent(new CustomEvent('pixelforge-demo-image'))}>Try Demo</button>
          <button className="action-btn primary" onClick={() => window.dispatchEvent(new Event('pixelforge-open-file'))}>Upload</button>
        </div>
      </div>

      {!imageSrc && (
        <div className="panel-section">
          <div className="section-title">Ready</div>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Upload an image to begin editing.</p>
        </div>
      )}
    </aside>
  );
}

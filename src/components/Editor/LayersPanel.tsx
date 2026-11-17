import React from 'react';
import type { EditorLayer } from '../../types/editor';

type LayersPanelProps = {
  layers: EditorLayer[];
  setLayers: React.Dispatch<React.SetStateAction<EditorLayer[]>>;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
};

export default function LayersPanel({ layers, setLayers, selectedLayerId, setSelectedLayerId }: LayersPanelProps) {
  function toggleVisibility(id: string) {
    setLayers((prev) => prev.map((layer) => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
  }

  function moveLayer(id: string, direction: 'up' | 'down') {
    setLayers((prev) => {
      const index = prev.findIndex((layer) => layer.id === id);
      if (index < 0) return prev;
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function updateOpacity(id: string, opacity: number) {
    setLayers((prev) => prev.map((layer) => layer.id === id ? { ...layer, opacity } : layer));
  }

  function renameLayer(id: string) {
    const nextName = window.prompt('Layer name');
    if (!nextName) return;
    setLayers((prev) => prev.map((layer) => layer.id === id ? { ...layer, name: nextName } : layer));
  }

  function removeLayer(id: string) {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  }

  return (
    <aside className="layers-panel glass-panel">
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Layers</span>
        <button
          className="tool-icon-btn"
          onClick={() => {
            setLayers([]);
            setSelectedLayerId(null);
          }}
          aria-label="Clear layers"
        >
          Clear
        </button>
      </div>

      <div className="layer-list">
        {layers.length === 0 ? (
          <div className="panel-section">No layers yet</div>
        ) : (
          [...layers].reverse().map((layer) => (
            <div
              key={layer.id}
              className={`layer-item ${selectedLayerId === layer.id ? 'selected' : ''}`}
              onClick={() => setSelectedLayerId(layer.id)}
            >
              <input
                className="layer-visibility"
                type="checkbox"
                checked={layer.visible}
                onChange={() => toggleVisibility(layer.id)}
                onClick={(event) => event.stopPropagation()}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="layer-name">{layer.name}</div>
                <div className="layer-meta">{layer.type}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 80 }}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={layer.opacity}
                  onChange={(event) => updateOpacity(layer.id, Number(event.target.value))}
                  onClick={(event) => event.stopPropagation()}
                />
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                <button className="tool-icon-btn" onClick={(event) => { event.stopPropagation(); renameLayer(layer.id); }}>✎</button>
                <button className="tool-icon-btn" onClick={(event) => { event.stopPropagation(); moveLayer(layer.id, 'up'); }}>↑</button>
                <button className="tool-icon-btn" onClick={(event) => { event.stopPropagation(); moveLayer(layer.id, 'down'); }}>↓</button>
                <button className="tool-icon-btn" onClick={(event) => { event.stopPropagation(); removeLayer(layer.id); }}>×</button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

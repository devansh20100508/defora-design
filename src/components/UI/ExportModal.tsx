import React from 'react';

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  format: 'png' | 'jpg' | 'webp';
  setFormat: React.Dispatch<React.SetStateAction<'png' | 'jpg' | 'webp'>>;
  quality: number;
  setQuality: React.Dispatch<React.SetStateAction<number>>;
  onExport: () => void;
};

export default function ExportModal({
  isOpen,
  onClose,
  format,
  setFormat,
  quality,
  setQuality,
  onExport,
}: ExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal glass-panel" onClick={(event) => event.stopPropagation()}>
        <div className="section-title">Export</div>

        <div className="export-row">
          {(['png', 'jpg', 'webp'] as const).map((option) => (
            <button
              key={option}
              className={`export-format-btn ${format === option ? 'active' : ''}`}
              onClick={() => setFormat(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="slider-group">
          <div className="slider-meta">
            <span>Quality</span>
            <strong>{quality.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
        </div>

        <div className="layer-row" style={{ marginTop: 16 }}>
          <button className="action-btn" onClick={onClose}>Cancel</button>
          <button className="action-btn primary" onClick={onExport}>Export</button>
        </div>
      </div>
    </div>
  );
}

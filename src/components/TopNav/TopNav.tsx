import React from 'react';
import { Download, FolderPlus, FolderOpen, Redo2, RotateCcw, Settings2, SplitSquareVertical, ZoomIn, ZoomOut } from 'lucide-react';

type TopNavProps = {
  onNew: () => void;
  onOpen: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onBeforeAfter?: () => void;
  onExport: () => void;
  onAuthOpen?: (mode?: 'login'|'signup') => void;
  onSettingsOpen?: ()=>void;
};

export default function TopNav({
  onNew,
  onOpen,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onBeforeAfter,
  onExport,
  onAuthOpen,
}: TopNavProps) {
  const navButtons = [
    { label: 'New', icon: FolderPlus, onClick: onNew },
    { label: 'Open', icon: FolderOpen, onClick: onOpen },
    { label: 'Undo', icon: RotateCcw, onClick: onUndo },
    { label: 'Redo', icon: Redo2, onClick: onRedo },
    { label: 'Before / After', icon: SplitSquareVertical, onClick: onBeforeAfter },
    { label: 'Export', icon: Download, onClick: onExport },
  ];

  return (
    <header className="top-nav glass-panel">
      <div className="brand-lockup">
      <div className="w-full flex items-center justify-between p-3 glass" role="navigation" aria-label="Top navigation">
        <div>
          <div className="brand-title">pixelforge.ai</div>
          <div className="brand-tag">Create. Edit. Transform.</div>
        </div>
      </div>

      <nav className="nav-actions" aria-label="Main navigation">
        {navButtons.map(({ label, icon: Icon, onClick }) => (
          <button key={label} className="primary-nav-btn" onClick={onClick}>
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}

        <div className="divider" />

        <button className="tool-icon-btn" title="Zoom out" onClick={onZoomOut} aria-label="Zoom out">
          <ZoomOut size={15} />
        </button>
        <button className="tool-icon-btn" title="Zoom in" onClick={onZoomIn} aria-label="Zoom in">
          <ZoomIn size={15} />
        </button>
        <button className="tool-icon-btn" title="Settings" aria-label="Settings" onClick={()=> onSettingsOpen && onSettingsOpen()}>
          <Settings2 size={15} />
        </button>
        <div style={{ width: 10 }} />
        <button className="action-btn" onClick={()=> onAuthOpen && onAuthOpen('login')}>Login</button>
        <button className="action-btn primary" onClick={()=> onAuthOpen && onAuthOpen('signup')}>Sign Up</button>
      </nav>
    </header>
  );
}

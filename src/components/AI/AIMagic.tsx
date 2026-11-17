import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

type AIMagicProps = {
  imageSrc: string | null;
  onAutoEnhance: () => void;
  onRemoveBackground: () => void;
  onDescribe: () => void;
  onResizePreset: (preset: string) => void;
};

const aiOptions = [
  'Auto Enhance',
  'Remove Background',
  'Make Cinematic',
  'Make Vibrant',
  'Convert to B&W',
  'Sharpen',
  'Blur Background',
  'Social Media Resize',
];

export default function AIMagic({ imageSrc, onAutoEnhance, onRemoveBackground, onDescribe, onResizePreset }: AIMagicProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="floating-ai-btn" onClick={() => setOpen((prev) => !prev)} aria-label="AI magic menu">
        <Sparkles size={24} />
      </button>

      {open && (
        <div className="ai-menu glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 12 }}>
            <Sparkles size={16} />
            AI Magic
          </div>

          <div className="ai-menu-list">
            {aiOptions.map((option) => (
              <button
                key={option}
                className="ai-menu-item"
                onClick={() => {
                  if (!imageSrc) return;
                  if (option === 'Auto Enhance') onAutoEnhance();
                  else if (option === 'Remove Background') onRemoveBackground();
                  else if (option === 'Make Cinematic') onAutoEnhance();
                  else if (option === 'Make Vibrant') onAutoEnhance();
                  else if (option === 'Convert to B&W') onAutoEnhance();
                  else if (option === 'Sharpen') onAutoEnhance();
                  else if (option === 'Blur Background') onAutoEnhance();
                  else if (option === 'Social Media Resize') onResizePreset('Instagram Post');
                  setOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

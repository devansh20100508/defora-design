import React, { useEffect, useState } from 'react'

type Props = {
  open: boolean
  onClose: ()=>void
  onApply?: (settings: any)=>void
}

export default function SettingsModal({ open, onClose, onApply }: Props){
  const [autosave, setAutosave] = useState(false)
  const [showTooltips, setShowTooltips] = useState(true)

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('pixelforge_settings')
      if (raw){
        const parsed = JSON.parse(raw)
        setAutosave(Boolean(parsed.autosave))
        setShowTooltips(parsed.showTooltips !== false)
      }
    } catch (e) {
      // ignore corrupted
    }
  }, [])

  function apply(){
    const s = { autosave, showTooltips }
    try{ localStorage.setItem('pixelforge_settings', JSON.stringify(s)) }catch(e){}
    onApply && onApply(s)
    onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 glass-panel w-96">
        <h3 className="text-lg font-semibold mb-2">Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={autosave} onChange={(e)=>setAutosave(e.target.checked)} />
            <span>Autosave edits</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={showTooltips} onChange={(e)=>setShowTooltips(e.target.checked)} />
            <span>Show tooltips</span>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="action-btn" onClick={onClose}>Cancel</button>
          <button className="action-btn primary" onClick={apply}>Save</button>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'

type Props = {
  open: boolean
  mode: 'login' | 'signup'
  onClose: ()=>void
  onAuthSuccess?: (user:{ email:string })=>void
}

export default function AuthModal({ open, mode, onClose, onAuthSuccess }: Props){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  if (!open) return null
  function submit(e: React.FormEvent){
    e.preventDefault()
    // simple local auth mock — store in localStorage
    const user = { email }
    localStorage.setItem('pixelforge_user', JSON.stringify(user))
    onAuthSuccess && onAuthSuccess(user)
    onClose()
  }
  return (
    <div className="auth-modal fixed inset-0 flex items-center justify-center">
      <div className="bg-black/80 absolute inset-0" onClick={onClose} />
      <form onSubmit={submit} className="relative z-10 bg-white/6 p-6 rounded w-96 glass-panel">
        <h3 className="text-lg font-semibold mb-2">{mode === 'login' ? 'Login' : 'Create account'}</h3>
        <div className="mb-3">
          <label className="text-xs text-white/70">Email</label>
          <input className="w-full p-2 rounded bg-black/20 mt-1" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="text-xs text-white/70">Password</label>
          <input type="password" className="w-full p-2 rounded bg-black/20 mt-1" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="action-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="action-btn primary">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
        </div>
      </form>
    </div>
  )
}

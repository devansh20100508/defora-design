import React, { useEffect, useState } from 'react'

type Toast = { id: number, message: string }

export default function ToastContainer(){
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(()=>{
    function onToast(e: any){
      const { message, timeout } = e.detail
      const id = Date.now()
      setToasts(t=>[...t, { id, message }])
      setTimeout(()=> setToasts(t=> t.filter(x=> x.id !== id)), timeout || 2500)
    }
    window.addEventListener('show-toast', onToast as EventListener)
    return ()=> window.removeEventListener('show-toast', onToast as EventListener)
  },[])

  return (
    <div className="fixed right-6 top-6 flex flex-col gap-2 z-50">
      {toasts.map(t=> (
        <div key={t.id} className="glass px-4 py-2 rounded shadow">{t.message}</div>
      ))}
    </div>
  )
}

import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }

export default function Button(props: Props) {
  return (
    <button {...props} className={`glass toolbar-btn ${props.className ?? ''}`.trim()}>
      {props.children}
    </button>
  )
}

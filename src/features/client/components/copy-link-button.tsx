'use client'

import { useState } from 'react'

interface CopyLinkButtonProps {
  url: string
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text in input
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full py-2.5 bg-[#1a1a1a] text-[#bbb] text-[10px] font-medium uppercase tracking-wider rounded-[6px] hover:bg-[#222] transition-all"
    >
      {copied ? 'Copiado!' : 'Copiar Link'}
    </button>
  )
}

'use client'

import { useState } from 'react'
import { useKonamiCode } from '@/hooks/use-konami-code'
import { Scissors, Sparkle } from '@phosphor-icons/react'

export function EasterEggProvider({ children }: { children: React.ReactNode }) {
  const [isTriggered, setIsTriggered] = useState(false)

  useKonamiCode(() => {
    setIsTriggered(true)
    setTimeout(() => setIsTriggered(false), 5000)
  })

  return (
    <>
      {children}
      {isTriggered && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="text-center space-y-6 p-12 rounded-[3rem] bg-accent-gradient shadow-[0_0_100px_rgba(0,229,255,0.3)] border border-white/20 animate-bounce">
            <div className="flex justify-center gap-4 text-6xl">
              <Sparkle className="text-yellow-400 animate-pulse" />
              <Scissors className="text-white" weight="fill" />
              <Sparkle className="text-yellow-400 animate-pulse delay-75" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-6xl font-bold font-syne text-white tracking-tighter italic">
                ACHEI VOCÊ!
              </h1>
              <p className="text-xl text-cyan-200 font-medium">
                Seu amigo descobriu o easter egg secreto 🎉
              </p>
            </div>

            <div className="pt-4">
              <div className="inline-block px-6 py-2 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/60">
                O Barbeiro lendário foi invocado
              </div>
            </div>
          </div>
          
          {/* Rainbow particles or similar could go here */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(20)].map((_, i) => (
               <div 
                key={i}
                className="absolute w-2 h-2 rounded-full bg-accent-cyan opacity-50 animate-ping"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
               />
             ))}
          </div>
        </div>
      )}
    </>
  )
}

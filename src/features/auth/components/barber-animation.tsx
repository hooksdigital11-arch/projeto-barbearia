'use client'

import { useState, useEffect } from 'react'
import { Scissors } from '@phosphor-icons/react/dist/ssr'

/**
 * BarberCharacter Component
 * Renders a modern, professional Flat Design 2.0 Barber avatar.
 */
function BarberCharacter({ isSpying }: { isSpying: boolean }) {
  return (
    <div 
      className="relative flex flex-col items-center pointer-events-none"
      style={{
        transform: isSpying 
          ? 'translateX(15px) rotateZ(-12deg)' 
          : 'translateX(0) rotateZ(0deg)',
        transition: 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)',
        filter: 'drop-shadow(0 20px 40px rgba(0,229,255,0.15))'
      }}
    >
      <svg
        width="280"
        height="320"
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="skinGrad" x1="140" y1="40" x2="140" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f3d5b5" />
            <stop offset="100%" stopColor="#e8c4a0" />
          </linearGradient>
          <linearGradient id="apronGrad" x1="140" y1="160" x2="140" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#00b8cc" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="140" y1="150" x2="140" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* --- CORPO / UNIFORME --- */}
        <g className="body">
          {/* Camisa Branca */}
          <path 
            d="M90 170 Q140 145 190 170 Q240 185 230 320 L50 320 Q40 185 90 170 Z" 
            fill="url(#shirtGrad)" 
            filter="url(#subtleShadow)"
          />
          {/* Gola V sutil */}
          <path d="M125 160 L140 190 L155 160 Z" fill="#f3d5b5" />
          
          {/* Braço Direito (Escondido atrás na animação) */}
          <path 
            d={isSpying ? "M210 180 Q250 160 230 110" : "M210 180 Q240 220 220 300"} 
            stroke="url(#shirtGrad)" 
            strokeWidth="28" 
            strokeLinecap="round" 
            fill="none"
            style={{ transition: 'd 450ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          {/* Mão Direita aparecendo quando espia */}
          <circle 
            cx={isSpying ? "228" : "220"} 
            cy={isSpying ? "105" : "305"} 
            r="12" 
            fill="#e8c4a0" 
            style={{ transition: 'all 450ms cubic-bezier(0.4, 0, 0.2, 1)', opacity: isSpying ? 1 : 0 }}
          />

          {/* Avental Ciano */}
          <path 
            d="M105 170 L175 170 Q185 240 195 320 L85 320 Q95 240 105 170 Z" 
            fill="url(#apronGrad)" 
            filter="url(#subtleShadow)"
          />
          {/* Alça do Avental */}
          <path d="M105 170 L120 150 M175 170 L160 150" stroke="#00b8cc" strokeWidth="4" />
          
          {/* Bolso do Avental */}
          <rect x="125" y="220" width="30" height="35" rx="4" fill="#000000" fillOpacity="0.05" />
          
          {/* Braço Esquerdo (Relaxado) */}
          <path 
            d="M70 180 Q40 220 60 300" 
            stroke="url(#shirtGrad)" 
            strokeWidth="28" 
            strokeLinecap="round" 
            fill="none"
          />
        </g>

        {/* --- CABEÇA --- */}
        <g className="head">
          {/* Pescoço */}
          <rect x="125" y="140" width="30" height="30" rx="10" fill="#d1ae8a" />
          
          {/* Rosto / Base */}
          <ellipse cx="140" cy="100" rx="42" ry="52" fill="url(#skinGrad)" filter="url(#subtleShadow)" />

          {/* Sombra de Barba Fade (Estilo) */}
          <path 
            d="M102 115 Q140 160 178 115 Q178 135 140 152 Q102 135 102 115 Z" 
            fill="#0a0a0a" 
            opacity="0.08" 
          />

          {/* Cabelo Undercut Moderno */}
          <path 
            d="M98 90 Q98 40 140 35 Q180 35 182 90 Q170 45 140 45 Q110 45 98 90 Z" 
            fill="#1a1a1a" 
          />
          {/* Topete Volume */}
          <path 
            d="M105 50 Q130 20 160 35 Q175 40 175 55 Q150 25 115 55 Z" 
            fill="#2d2d2d" 
          />

          {/* Rosto Elementos */}
          <g className="face" style={{ transform: isSpying ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 450ms' }}>
            
            {/* Sobrancelhas bem definidas */}
            <path 
              d={isSpying ? "M115 70 Q122 65 130 72" : "M115 75 Q122 72 130 75"} 
              stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round" fill="none"
              style={{ transition: 'd 450ms' }}
            />
            <path 
              d={isSpying ? "M150 72 Q158 65 165 70" : "M150 75 Q158 72 165 75"} 
              stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round" fill="none"
              style={{ transition: 'd 450ms' }}
            />

            {/* Olhos Container */}
            <g className="eyes" style={{ transformOrigin: '140px 85px', transform: isSpying ? 'scale(1.2)' : 'scale(1)', transition: 'transform 450ms' }}>
              {/* Esquerdo */}
              <circle cx="122" cy="85" r="4" fill="#000000" />
              {/* Direito */}
              <circle cx="158" cy="85" r="4" fill="#000000" />
              {/* Pupilas/Brilho olhando pro form */}
              <circle cx={isSpying ? "124" : "123"} cy="84" r="1.5" fill="#ffffff" style={{ transition: 'cx 450ms' }} />
              <circle cx={isSpying ? "160" : "159"} cy="84" r="1.5" fill="#ffffff" style={{ transition: 'cx 450ms' }} />
            </g>

            {/* Nariz minimalista */}
            <path d="M138 95 L140 105 L143 103" stroke="#d1ae8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Boca (Sorriso sutil/elegante) */}
            <path 
              d={isSpying ? "M128 120 Q140 128 152 120" : "M132 122 Q140 126 148 122"} 
              stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none"
              style={{ transition: 'd 450ms' }}
            />
          </g>
        </g>
      </svg>

      {/* Tesoura Girando Elegantemente */}
      <div 
        className="absolute transition-all duration-500"
        style={{
          bottom: '80px',
          right: isSpying ? '0px' : '45px',
          transform: isSpying ? 'scale(1.15) rotate(15deg)' : 'scale(1) rotate(0deg)',
          opacity: 0.9
        }}
      >
        <div className="p-3 rounded-full bg-bg-secondary/40 backdrop-blur-md border border-white/5 shadow-xl text-accent-cyan">
          <Scissors
            size={32}
            weight="duotone"
            style={{ 
              animation: 'spinSlow 8s linear infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .eyes {
          animation: blink 4s infinite;
        }
        @keyframes blink {
          0%, 43%, 47%, 100% { transform: scaleY(1); }
          45% { transform: scaleY(0.1); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * BarberAnimation Component
 * Wrapper that listens to mouse events and renders the 2.5D Barber Character.
 */
export function BarberAnimation() {
  const [isSpying, setIsSpying] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const formContainer = document.querySelector('.form-container')
    
    if (formContainer) {
      const handleMouseEnter = () => setIsSpying(true)
      const handleMouseLeave = () => setIsSpying(false)
      
      formContainer.addEventListener('mouseenter', handleMouseEnter)
      formContainer.addEventListener('mouseleave', handleMouseLeave)
      
      return () => {
        formContainer.removeEventListener('mouseenter', handleMouseEnter)
        formContainer.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isMounted])

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-10 px-8 select-none pointer-events-none relative w-full">
      {/* Background Ambient Glow sutil */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[350px] h-[350px] bg-accent-cyan/5 blur-[100px] rounded-full" />
      </div>
      
      {/* Avatar do Barbeiro 2.5D */}
      <BarberCharacter isSpying={isSpying} />

      {/* Texto Engajador Minimalista */}
      <div 
        className="text-center space-y-3 transition-all duration-500 relative z-10" 
        style={{ 
          transform: isSpying ? 'translateY(15px)' : 'translateY(0)',
          opacity: isSpying ? 0.9 : 1
        }}
      >
        <h2 className="text-4xl font-extrabold text-white font-syne tracking-tight leading-tight">
          {isSpying ? "Tô de olho! 👀" : "Pronto pro corte?"}
        </h2>
        <p className="text-text-secondary text-base font-medium max-w-[280px] mx-auto">
          {isSpying ? "Cuidado com a senha aí..." : "Acesse sua conta e gerencie sua barbearia com estilo."}
        </p>
      </div>
    </div>
  )
}

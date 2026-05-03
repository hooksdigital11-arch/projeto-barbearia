'use client'

import { useState, useEffect } from 'react'
import { Scissors } from '@phosphor-icons/react'

/**
 * BarberCharacter Component
 * Renders a modern, professional, and minimalist 2D SVG Barber.
 * Features realistic proportions and subtle animations.
 */
function BarberCharacter({ isSpying }: { isSpying: boolean }) {
  return (
    <div 
      className="relative flex flex-col items-center transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
      style={{
        transform: isSpying 
          ? 'translateX(25px) rotateZ(-14deg) scale(1.02)' 
          : 'translateX(0) rotateZ(0deg) scale(1)',
      }}
    >
      <svg
        width="240"
        height="320"
        viewBox="0 0 240 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_20px_40px_rgba(0,229,255,0.15)]"
      >
        <defs>
          <linearGradient id="skinGradient" x1="120" y1="40" x2="120" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F3D5B5" />
            <stop offset="100%" stopColor="#E8C4A0" />
          </linearGradient>
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Corpo / Camisa Polo de Barbeiro */}
        <path
          d="M60 300C60 220 70 160 120 160C170 160 180 220 180 300"
          fill="#ffffff"
          className="transition-all duration-500"
        />
        <path
          d="M60 300L180 300L170 200C170 180 150 160 120 160C90 160 70 180 70 200L60 300Z"
          fill="#ffffff"
        />
        {/* Detalhe Ciano no Uniforme (Avental/Listra) */}
        <rect x="95" y="180" width="50" height="120" rx="4" fill="#00e5ff" opacity="0.9" />
        <path d="M100 160L120 185L140 160" stroke="#f0f0f0" strokeWidth="2" />

        {/* Braços */}
        <g className="arms transition-all duration-700">
          {/* Braço Esquerdo */}
          <path
            d={isSpying ? "M60 210C40 180 35 150 45 120" : "M65 210C50 230 50 260 60 290"}
            stroke="#E8C4A0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Braço Direito */}
          <path
            d={isSpying ? "M180 210C200 230 210 260 200 290" : "M175 210C190 230 190 260 180 290"}
            stroke="#E8C4A0"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </g>

        {/* Cabeça */}
        <ellipse cx="120" cy="100" rx="50" ry="60" fill="url(#skinGradient)" />
        
        {/* Sombra da Mandíbula (Barba por fazer sutil) */}
        <path
          d="M75 120C75 145 95 155 120 155C145 155 165 145 165 120"
          fill="#000000"
          opacity="0.05"
        />

        {/* Cabelo (Corte Fade Moderno) */}
        <path
          d="M70 100C70 60 90 30 120 30C150 30 170 60 170 100L175 105C175 105 180 80 170 60C160 30 120 20 80 50C70 60 65 90 70 100Z"
          fill="#1a1a1a"
        />
        <path
          d="M80 55C80 40 120 25 155 50C165 60 170 80 170 95"
          stroke="#2d2d2d"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Rosto */}
        <g className="face-features transition-all duration-500">
          {/* Sobrancelhas */}
          <path 
            d={isSpying ? "M90 75C95 72 105 72 110 75" : "M90 80C95 78 105 78 110 80"} 
            stroke="#1a1a1a" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d={isSpying ? "M130 75C135 72 145 72 150 75" : "M130 80C135 78 145 78 150 80"} 
            stroke="#1a1a1a" 
            strokeWidth="2" 
            strokeLinecap="round"
          />

          {/* Olhos */}
          <g className="eyes">
            <circle 
              cx={isSpying ? "105" : "100"} 
              cy="95" 
              r={isSpying ? "6" : "4.5"} 
              fill="#1a1a1a" 
              className="transition-all duration-500" 
            />
            <circle 
              cx={isSpying ? "145" : "140"} 
              cy="95" 
              r={isSpying ? "7.5" : "4.5"} 
              fill="#1a1a1a" 
              className="transition-all duration-500" 
            />
          </g>

          {/* Nariz */}
          <path d="M120 105L118 115L122 115Z" fill="#000000" opacity="0.1" />

          {/* Boca */}
          <path
            d={isSpying ? "M110 135C110 135 120 145 135 135" : "M115 138C115 138 120 142 125 138"}
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </g>
      </svg>

      {/* Tesoura Girando Lentamente */}
      <div 
        className="absolute bottom-10 transition-all duration-700"
        style={{
          transform: isSpying ? 'translateY(-30px) scale(0.9)' : 'translateY(0) scale(1)',
          opacity: isSpying ? 0.4 : 0.8
        }}
      >
        <div className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
          <Scissors
            size={36}
            weight="duotone"
            className="text-cyan-400"
            style={{ 
              animationName: 'spin',
              animationDuration: '6s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .eyes {
          animation: blink 4s infinite;
        }

        @keyframes blink {
          0%, 96%, 100% { transform: scaleY(1); }
          98% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  )
}

/**
 * BarberAnimation Component
 * Refined version with a modern, minimalist 2.5D character.
 */
export function BarberAnimation() {
  const [isSpying, setIsSpying] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.auth-card-container')) {
        setIsSpying(true)
      } else {
        setIsSpying(false)
      }
    }

    window.addEventListener('mouseover', handleMouseOver)
    return () => {
      setIsMounted(false)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 px-8 select-none pointer-events-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
      </div>
      
      {/* O Novo Personagem Barbeiro Moderno */}
      <BarberCharacter isSpying={isSpying} />

      {/* Texto Minimalista */}
      <div className="text-center space-y-4 transition-all duration-700 relative z-10" style={{ opacity: isSpying ? 0.3 : 1 }}>
        <h2 className="text-5xl font-extrabold text-white font-syne tracking-tight leading-tight">
          {isSpying ? "Curioso?" : "Pronto para o corte?"}
        </h2>
        <p className="text-muted-foreground text-xl font-medium max-w-sm mx-auto">
          {isSpying ? "Estou de olho nos seus dados... 👀" : "Acesse sua conta e gerencie sua barbearia com tecnologia."}
        </p>
      </div>

      {/* Partículas de Estilo (Cabelos minimalistas) */}
      {isMounted && (
        <div className="absolute bottom-10 w-full h-40 overflow-hidden opacity-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-3 bg-cyan-300 rounded-full"
              style={{
                left: `${(i * 10) + Math.random() * 5}%`,
                bottom: '-20px',
                animationName: 'float-hair',
                animationDuration: `${5 + Math.random() * 5}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.3}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes float-hair {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

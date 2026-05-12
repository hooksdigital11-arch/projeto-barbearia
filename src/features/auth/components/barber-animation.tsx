'use client'

import { useState, useEffect } from 'react'
import { Scissors } from '@phosphor-icons/react/dist/ssr'

/**
 * BarberCharacter Component
 * Modern, Clean, Flat Design 2.0 Barber Avatar
 * Features subtle depth, realistic proportions, and elegant animations.
 */
function BarberCharacter({ isSpying }: { isSpying: boolean }) {
  return (
    <div 
      className="relative flex flex-col items-center pointer-events-none"
      style={{
        transform: isSpying 
          ? 'translateX(25px) rotateZ(-15deg)' 
          : 'translateX(0) rotateZ(0deg)',
        transition: 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)',
        filter: 'drop-shadow(0 15px 30px rgba(0,229,255,0.15))'
      }}
    >
      <svg
        width="250"
        height="250"
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Subtle skin gradient */}
          <linearGradient id="skinGradient" x1="140" y1="40" x2="140" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f3d8bc" />
            <stop offset="100%" stopColor="#E8C4A0" />
          </linearGradient>
          
          {/* Clean Cyan Uniform gradient */}
          <linearGradient id="cyanUniform" x1="140" y1="160" x2="140" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2CE8F5" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          
          {/* White Shirt gradient */}
          <linearGradient id="whiteShirt" x1="140" y1="150" x2="140" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F0F0" />
          </linearGradient>

          {/* Minimal shadow filter for depth */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
            <feOffset dy="5" />
            <feComponentTransfer><feFuncA type="linear" slope="0.1" /></feComponentTransfer>
            <feMerge> 
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="idle-motion">
          {/* --- CORPO E BRAÇOS --- */}
          <g className="body">
            {/* Camisa Branca Base */}
            <path 
              d="M100 160 Q140 145 180 160 Q230 180 230 320 L50 320 Q50 180 100 160 Z" 
              fill="url(#whiteShirt)" 
              filter="url(#softShadow)"
            />
            {/* Gola V Profunda */}
            <path d="M125 155 L140 190 L155 155 Z" fill="#E8C4A0" />

            {/* Braço Direito (Personagem) - Esquerdo na tela */}
            <path 
              d="M75 175 Q45 220 55 300" 
              stroke="url(#whiteShirt)" 
              strokeWidth="28" 
              strokeLinecap="round" 
              fill="none"
              filter="url(#softShadow)"
            />

            {/* Avental Ciano Moderno */}
            <rect 
              x="95" y="170" width="90" height="150" rx="10" 
              fill="url(#cyanUniform)" 
              filter="url(#softShadow)"
            />
            {/* Detalhes do Avental: Costura e Bolso */}
            <path d="M95 185 L185 185" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.4" />
            <rect x="120" y="215" width="40" height="45" rx="6" fill="#FFFFFF" fillOpacity="0.15" />

            {/* Braço Esquerdo (Personagem) - Direito na tela */}
            {/* Animação: Braço sobe pra trás da cabeça na espiada */}
            <g style={{ 
              transform: isSpying ? 'rotate(-130deg) translate(-100px, 120px)' : 'rotate(0deg) translate(0px, 0px)', 
              transformOrigin: '205px 175px',
              transition: 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <path 
                d="M205 175 Q235 220 225 300" 
                stroke="url(#whiteShirt)" 
                strokeWidth="28" 
                strokeLinecap="round" 
                fill="none"
                filter="url(#softShadow)"
              />
              <circle cx="225" cy="305" r="13" fill="#E8C4A0" />
            </g>
          </g>

          {/* --- CABEÇA --- */}
          <g 
            className="head"
            style={{
              transform: isSpying ? 'rotate(8deg) translate(5px, 2px)' : 'rotate(0deg)',
              transformOrigin: '140px 145px',
              transition: 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Pescoço */}
            <rect x="125" y="130" width="30" height="35" rx="6" fill="#D5B08A" />
            
            {/* Rosto / Formato da Cabeça Oval Proporcional */}
            <ellipse cx="140" cy="95" rx="42" ry="52" fill="url(#skinGradient)" filter="url(#softShadow)" />

            {/* Sombra de Barba Profissional */}
            <path 
              d="M100 110 Q140 160 180 110 Q180 135 140 152 Q100 135 100 110 Z" 
              fill="#2B2B2B" 
              opacity="0.06" 
            />

            {/* Cabelo Corte Moderno (Fade/Undercut) */}
            <g className="hair">
              {/* Laterais (Fade) */}
              <path 
                d="M96 85 Q96 40 140 35 Q184 40 184 85 Q174 45 140 45 Q106 45 96 85 Z" 
                fill="#1A1A1A" 
              />
              {/* Topo Estiloso */}
              <path 
                d="M102 50 Q130 18 165 35 Q175 40 178 55 Q160 25 120 52 Q108 62 102 50 Z" 
                fill="#2D2D2D" 
                filter="url(#softShadow)"
              />
            </g>

            {/* Elementos Faciais */}
            <g className="face">
              {/* Sobrancelhas Arqueadas na espiada */}
              <path 
                d={isSpying ? "M114 62 Q122 58 130 64" : "M114 68 Q122 65 130 68"} 
                stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" fill="none"
                style={{ transition: 'd 450ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <path 
                d={isSpying ? "M150 64 Q158 58 166 62" : "M150 68 Q158 65 166 68"} 
                stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" fill="none"
                style={{ transition: 'd 450ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Olhos Container */}
              <g 
                className="eyes" 
                style={{ 
                  transformOrigin: '140px 82px', 
                  transform: isSpying ? 'scale(1.7)' : 'scale(1)', 
                  transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
              >
                {/* Esquerdo */}
                <circle cx="122" cy="82" r="3.5" fill="#1A1A1A" />
                {/* Direito */}
                <circle cx="158" cy="82" r="3.5" fill="#1A1A1A" />
                
                {/* Direção das pupilas */}
                <circle 
                  cx={isSpying ? "124" : "122"} 
                  cy={isSpying ? "82" : "82"} 
                  r="1.2" 
                  fill="#FFFFFF" 
                  style={{ transition: 'cx 450ms cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
                <circle 
                  cx={isSpying ? "160" : "158"} 
                  cy={isSpying ? "82" : "82"} 
                  r="1.2" 
                  fill="#FFFFFF" 
                  style={{ transition: 'cx 450ms cubic-bezier(0.4, 0, 0.2, 1)' }} 
                />
              </g>

              {/* Nariz Clean */}
              <path d="M138 92 L140 102 L143 100" stroke="#D5B08A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

              {/* Boca Minimalista (Neutro vs Sorriso Elegante) */}
              <path 
                d={isSpying ? "M125 116 Q140 128 155 114" : "M130 118 Q140 122 150 118"} 
                stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"
                style={{ transition: 'd 450ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <path 
                d="M157 112 Q159 114 157 116" 
                stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none"
                style={{ opacity: isSpying ? 1 : 0, transition: 'opacity 450ms' }}
              />
            </g>
          </g>
        </g>
      </svg>

      {/* Tesoura Clean Girando Lentamente */}
      <div 
        className="absolute transition-all duration-500 ease-in-out"
        style={{
          bottom: '60px',
          right: isSpying ? '-15px' : '30px',
          transform: isSpying ? 'scale(1.1) rotate(15deg)' : 'scale(1) rotate(0deg)',
          opacity: 0.95
        }}
      >
        <div className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-accent-cyan/30 shadow-[0_0_20px_rgba(0,229,255,0.2)] text-accent-cyan">
          <Scissors
            size={30}
            weight="regular"
            style={{ 
              animation: 'spinClean 8s linear infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .eyes {
          animation: blink 4s infinite;
        }
        .idle-motion {
          animation: idle 6s ease-in-out infinite;
          transform-origin: 140px 160px;
        }
        @keyframes blink {
          0%, 43%, 47%, 100% { transform: scaleY(1); }
          45% { transform: scaleY(0); }
        }
        @keyframes idle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(0.5deg); }
        }
        @keyframes spinClean {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * BarberAnimation Component
 * Wrapper that listens to mouse events and renders the Clean 2.5D Barber Character.
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
      {/* Background Ambient Glow Ciano Sutil */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] bg-accent-cyan/10 blur-[100px] rounded-full transition-opacity duration-700" 
             style={{ opacity: isSpying ? 1 : 0.4 }} />
      </div>
      
      {/* Avatar do Barbeiro Moderno */}
      <BarberCharacter isSpying={isSpying} />

      {/* Texto Minimalista */}
      <div 
        className="text-center space-y-3 transition-all duration-500 relative z-10" 
        style={{ 
          transform: isSpying ? 'translateY(10px)' : 'translateY(0)',
          opacity: isSpying ? 0.9 : 1
        }}
      >
        <h2 className="text-4xl font-extrabold text-text-primary font-syne tracking-tight leading-tight transition-colors duration-300">
          {isSpying ? (
            <span className="text-accent-cyan">
              Opa 👀
            </span>
          ) : (
            "Bem-vindo(a)"
          )}
        </h2>
        <p className="text-text-secondary text-base font-medium max-w-[280px] mx-auto transition-all duration-300">
          {isSpying ? "Pode colocar a senha aí, tá seguro comigo." : "Acesse o sistema e gerencie seus agendamentos com facilidade."}
        </p>
      </div>
    </div>
  )
}


'use client'

/**
 * DeskLamp Component
 * An interactive SVG desk lamp positioned at the bottom-right corner (desktop only).
 * Click to toggle on/off — controls the visibility of the login form.
 */
export function DeskLamp({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <div className="hidden lg:block fixed bottom-0 right-12 xl:right-24 z-50 select-none">
      {/* Light cone — only visible when ON */}
      <div
        className="absolute bottom-[280px] right-[42px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          width: 0,
          height: 0,
          borderLeft: '120px solid transparent',
          borderRight: '120px solid transparent',
          borderBottom: '320px solid rgba(255, 220, 140, 0.06)',
          transform: 'translateX(50%)',
          opacity: isOn ? 1 : 0,
          filter: 'blur(8px)',
        }}
      />
      {/* Soft glow on floor */}
      <div
        className="absolute -bottom-4 right-[-60px] w-[300px] h-[60px] rounded-full transition-all duration-700 ease-out pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(255, 220, 140, 0.12) 0%, transparent 70%)',
          opacity: isOn ? 1 : 0,
        }}
      />

      <button
        onClick={onToggle}
        className="relative cursor-pointer group outline-none focus:outline-none"
        aria-label={isOn ? 'Apagar abajur' : 'Acender abajur'}
        title={isOn ? 'Clique para apagar' : 'Clique para acender'}
      >
        <svg
          width="120"
          height="320"
          viewBox="0 0 120 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible drop-shadow-2xl"
        >
          {/* === BASE DO ABAJUR === */}
          {/* Pé/base oval */}
          <ellipse
            cx="60" cy="308" rx="38" ry="8"
            fill="#1a1a1a"
            stroke="#2a2a2a"
            strokeWidth="0.5"
          />
          <ellipse
            cx="60" cy="306" rx="32" ry="6"
            fill="#222222"
          />

          {/* Haste vertical */}
          <rect
            x="56" y="120" width="8" height="188" rx="4"
            fill="url(#hastGrad)"
          />

          {/* Detalhe decorativo na haste */}
          <rect x="54" y="180" width="12" height="4" rx="2" fill="#3a3a3a" />
          <rect x="54" y="240" width="12" height="4" rx="2" fill="#3a3a3a" />

          {/* === CÚPULA / SHADE === */}
          {/* Parte de trás (sombra) */}
          <path
            d="M20 120 Q25 60 60 55 Q95 60 100 120 Z"
            fill="#1a1a1a"
            stroke="#2a2a2a"
            strokeWidth="0.5"
          />
          {/* Face principal com gradiente */}
          <path
            d="M22 118 Q27 62 60 57 Q93 62 98 118 Z"
            fill="url(#shadeGrad)"
          />
          {/* Borda inferior da cúpula */}
          <path
            d="M20 120 Q60 128 100 120"
            stroke="#3a3a3a"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Reflexo sutil na cúpula */}
          <path
            d="M40 80 Q55 70 70 78"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            fill="none"
          />

          {/* === LÂMPADA (visível quando ON) === */}
          <g
            className="transition-opacity duration-500"
            style={{ opacity: isOn ? 1 : 0 }}
          >
            {/* Glow difuso atrás */}
            <circle cx="60" cy="115" r="20" fill="rgba(255,210,100,0.15)" />
            <circle cx="60" cy="115" r="12" fill="rgba(255,210,100,0.25)" />
            {/* Filamento */}
            <ellipse cx="60" cy="115" rx="6" ry="8" fill="rgba(255,220,140,0.6)" />
            <ellipse cx="60" cy="115" rx="3" ry="5" fill="rgba(255,240,200,0.8)" />
          </g>

          {/* === LÂMPADA APAGADA (visível quando OFF) === */}
          <g
            className="transition-opacity duration-500"
            style={{ opacity: isOn ? 0 : 0.4 }}
          >
            <ellipse cx="60" cy="115" rx="5" ry="7" fill="#2a2a2a" stroke="#333" strokeWidth="0.5" />
          </g>

          {/* === INTERRUPTOR no meio da haste === */}
          <g className="group-hover:opacity-100 opacity-60 transition-opacity duration-300">
            <rect
              x="50" y="210" width="20" height="10" rx="5"
              fill="#252525"
              stroke="#3a3a3a"
              strokeWidth="0.5"
            />
            <circle
              cx={isOn ? "65" : "55"}
              cy="215"
              r="3.5"
              fill={isOn ? "var(--accent, #00d4aa)" : "#555"}
              className="transition-all duration-300"
            />
          </g>

          {/* Gradientes */}
          <defs>
            <linearGradient id="hastGrad" x1="60" y1="120" x2="60" y2="310" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#333" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
            <linearGradient id="shadeGrad" x1="60" y1="55" x2="60" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="50%" stopColor="#222" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover tooltip */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] text-white/60 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          {isOn ? 'Apagar' : 'Acender'}
        </div>
      </button>
    </div>
  )
}

import React from "react";

interface LogoProps {
  className?: string; // custom classes for parent sizing
  showText?: boolean; // toggle side text
  darkText?: boolean; // light vs dark header text
  showBookteqPartner?: boolean; // display bookteq partnership
}

export const Logo: React.FC<LogoProps> = ({
  className = "w-16 h-16",
  showText = true,
  darkText = true,
  showBookteqPartner = false,
}) => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Dynamic Handcrafted SVG Logo recreating the exact layout and proportions */}
      <svg
        className={`${className} transition-transform duration-300 hover:scale-[1.05]`}
        viewBox="0 0 400 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        id="lrso-branding"
      >
        <defs>
          {/* Blue Letter Gradient */}
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#0e4a76" />
          </linearGradient>

          {/* Red Letter Gradient */}
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#bf3a3f" />
          </linearGradient>

          {/* Underlay glow shadow */}
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Outer Circle with split/gradient effect (half blue, half red/crimson) */}
        <circle
          cx="200"
          cy="200"
          r="160"
          stroke="url(#blue-red-stroke)"
          strokeWidth="11"
          strokeLinecap="round"
          className="stroke-lrso-blue-600"
          opacity="0.95"
        />
        
        {/* Custom gradient fallback or just stylized dual color for circle ring split */}
        <path
          d="M 200 40 A 160 160 0 0 1 360 200 A 160 160 0 0 1 200 360"
          stroke="#bf3a3f"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- STYLIZED BLUE RUNNING ATHLETE (Left side, diving/moving right) --- */}
        <g id="athlete-blue" filter="url(#glow)">
          {/* Blue head */}
          <circle cx="120" cy="110" r="28" fill="#0e4a76" />
          {/* Blue sweeping body & athletic limbs */}
          <path
            d="M 120 138 
               C 80 180, 20 230, 28 322 
               C 40 330, 80 260, 110 210 
               C 130 180, 155 140, 205 130 
               C 215 128, 200 165, 185 185
               C 160 220, 120 280, 80 345
               C 70 355, 60 362, 58 355
               C 62 340, 105 240, 118 190
               C 125 170, 131 150, 120 138 Z"
            fill="#0e4a76"
          />
          {/* Tail element */}
          <path
            d="M 100 215 
               C 85 220, 60 245, 50 255 
               C 55 242, 80 210, 95 200 Z"
            fill="#0e4a76"
          />
        </g>

        {/* --- STYLIZED RED RUNNING ATHLETE (Right side, jumping/exploding left/up) --- */}
        <g id="athlete-red" filter="url(#glow)">
          {/* Red/Crimson head */}
          <circle cx="215" cy="305" r="24" fill="#bf3a3f" />
          {/* Red/Crimson sweeping body & wing-like dynamic limbs */}
          <path
            d="M 296 90
               C 260 120, 200 150, 140 215
               C 116 240, 126 260, 155 272
               C 185 285, 235 295, 215 305
               C 195 315, 170 300, 155 290
               C 132 275, 175 230, 210 200
               C 250 165, 305 150, 318 192
               C 324 210, 290 228, 260 240
               C 220 256, 175 276, 170 282
               C 165 290, 180 292, 195 290
               C 230 280, 280 250, 315 210
               C 345 170, 335 120, 296 90 Z"
            fill="#bf3a3f"
          />
        </g>

        {/* --- LAYERED ALPHABETS LRSO --- */}
        
        {/* L - TOP (Blue shade gradient, thick blue-black outline) */}
        <g id="letter-L" filter="url(#glow)">
          <path
            d="M 155 35 H 220 V 110 H 280 V 150 H 155 V 35 Z"
            fill="url(#blueGrad)"
            stroke="#1e1b4b"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </g>

        {/* R - RIGHT (Crimson shade gradient, thick red-black outline) */}
        <g id="letter-R" filter="url(#glow)">
          <path
            d="M 285 110 
               H 345 
               C 380 110, 385 155, 360 170 
               C 380 180, 385 215, 395 235 
               H 355 
               C 348 215, 342 195, 335 180 
               V 180 
               H 320 
               V 235 
               H 285 
               V 110 Z
               M 320 138 
               V 155 
               H 338 
               C 346 155, 346 138, 338 138 
               H 320 Z"
            fill="url(#redGrad)"
            stroke="#3b0b0e"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </g>

        {/* S - BOTTOM RIGHT (Blue shade gradient, thick blue-black outline) */}
        <g id="letter-S" filter="url(#glow)">
          <path
            d="M 320 254
               C 320 254, 345 250, 360 262
               C 375 272, 355 295, 330 295
               C 305 295, 295 315, 310 332
               C 325 350, 364 350, 364 350
               V 378
               C 364 378, 330 382, 310 366
               C 290 350, 305 320, 330 320
               C 355 320, 365 306, 350 298
               C 335 290, 310 286, 306 270
               C 302 250, 320 254, 320 254 Z"
            fill="url(#blueGrad)"
            stroke="#1e1b4b"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </g>

        {/* O - BOTTOM (Crimson shade gradient, thick red-black outline) */}
        <g id="letter-O" filter="url(#glow)">
          <path
            d="M 125 315
               C 175 315, 180 375, 180 395
               C 180 415, 175 440, 125 440
               C 75 440, 70 415, 70 395
               C 70 375, 75 315, 125 315 Z
               M 125 342
               C 108 342, 106 375, 106 395
               C 106 415, 108 415, 125 415
               C 142 415, 144 415, 144 395
               C 144 375, 142 342, 125 342 Z"
            fill="url(#redGrad)"
            stroke="#3b0b0e"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </g>

        {/* --- BOOKTEQ PARTNER STAMP AT BOTTOM RIGHT --- */}
        <g id="bookteq-watermark" transform="translate(260, 345)">
          {/* Logo element: teardrop/droplet - similar to the bottom right in picture */}
          <path
            d="M 45 40 
               C 65 15, 85 30, 85 45 
               C 85 60, 65 72, 45 72 
               C 25 72, 30 55, 30 45 
               C 30 30, 45 40, 45 40 Z
               M 45 47
               C 52 47, 58 53, 58 60
               C 58 67, 52 70, 45 70
               C 38 70, 36 67, 36 60
               C 36 53, 38 47, 45 47 Z"
            fill="#bf3a3f"
            transform="scale(0.55) translate(40, 40)"
          />
          {/* bookteq text label if requested */}
          {showBookteqPartner && (
            <text
              x="30"
              y="85"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="20"
              fontWeight="bold"
              fill="#1e1b4b"
              letterSpacing="-0.5"
            >
              bookteq
            </text>
          )}
        </g>
      </svg>

      {/* Side Name Text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-display text-2xl font-extrabold tracking-tight ${
              darkText ? "text-slate-900" : "text-white"
            }`}
          >
            LRSO
          </span>
          <span
            className={`text-[9px] uppercase tracking-widest font-mono font-bold ${
              darkText ? "text-slate-500" : "text-slate-300"
            }`}
          >
            Facility Management
          </span>
        </div>
      )}
    </div>
  );
};

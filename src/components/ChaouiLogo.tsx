import React from 'react';

interface ChaouiLogoProps extends React.SVGProps<SVGSVGElement> {
  width?: string | number;
  height?: string | number;
  subtitleColor?: string;
  textColor?: string;
  accentColor?: string;
}

export const ChaouiLogo: React.FC<ChaouiLogoProps> = ({
  width = "100%",
  height = "100%",
  subtitleColor = "#d97706",
  textColor = "#ffffff",
  accentColor = "#f59e0b",
  className,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="chaouiAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      <g>
        <text
          x="12"
          y="46"
          fill={textColor}
          fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
          fontWeight="900"
          fontSize="42"
          letterSpacing="0.06em"
          style={{ userSelect: 'none' }}
        >
          CHAOUI
        </text>

        <circle
          cx="178"
          cy="31"
          r="16"
          stroke="url(#chaouiAccentGrad)"
          strokeWidth="3.5"
          fill="none"
        />
        <circle
          cx="178"
          cy="31"
          r="6"
          fill="url(#chaouiAccentGrad)"
        />

        <line x1="178" y1="11" x2="178" y2="17" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="178" y1="45" x2="178" y2="51" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="158" y1="31" x2="164" y2="31" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="192" y1="31" x2="198" y2="31" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="164" y1="17" x2="168" y2="21" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="188" y1="41" x2="192" y2="45" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="164" y1="45" x2="168" y2="41" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="188" y1="21" x2="192" y2="17" stroke="url(#chaouiAccentGrad)" strokeWidth="3" strokeLinecap="round" />

        <text
          x="14"
          y="66"
          fill={subtitleColor}
          fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
          fontWeight="800"
          fontSize="8.5"
          letterSpacing="0.25em"
          style={{ userSelect: 'none' }}
        >
          POIDS LOURDS &amp; TRANSMISSIONS
        </text>
      </g>
    </svg>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import gearMaxLogoImg from '../assets/gearmax-logo.png';
import gearMaxLogoLightImg from '../assets/gearmax-logo-light.png';

export interface GearMaxLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  height?: string | number;
  width?: string | number;
  variant?: 'standard' | 'white-text' | 'on-dark';
}

export const GearMaxLogo: React.FC<GearMaxLogoProps> = ({
  className = "h-14 w-auto object-contain",
  alt = "GearMax",
  height,
  width,
  variant = 'standard',
  style,
  ...props
}) => {
  const dynamicStyle: React.CSSProperties = {
    ...style,
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
  };

  const imageSrc = (variant === 'white-text' || variant === 'on-dark') 
    ? gearMaxLogoLightImg 
    : gearMaxLogoImg;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={dynamicStyle}
      {...props}
    />
  );
};

export default GearMaxLogo;

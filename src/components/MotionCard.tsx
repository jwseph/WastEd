import { ReactNode } from 'react';
import Tilt, { GlarePosition } from 'react-parallax-tilt';

interface MotionCardProps {
  children: ReactNode,
  className?: string,
  tiltMaxAngleX?: number,
  tiltMaxAngleY?: number,
  scale?: number,
  transitionSpeed?: number,
  perspective?: number,
  glareEnable?: boolean,
  glareMaxOpacity?: number,
  glareColor?: string,
  glarePosition?: GlarePosition,
  trackOnWindow?: boolean,
}

const MotionCard = ({ 
  children, 
  className = '', 
  tiltMaxAngleX = 7,
  tiltMaxAngleY = 7,
  scale = 1.02,
  transitionSpeed = 400,
  perspective = 1000,
  glareEnable = true,
  glareMaxOpacity = 0.2,
  glareColor = '#ffffff',
  glarePosition = 'all' as GlarePosition,
  trackOnWindow = false,
}: MotionCardProps) => {
  return (
    <Tilt
      className={className}
      tiltMaxAngleX={tiltMaxAngleX}
      tiltMaxAngleY={tiltMaxAngleY}
      perspective={perspective}
      transitionSpeed={transitionSpeed}
      scale={scale}
      glareEnable={glareEnable}
      glareMaxOpacity={glareMaxOpacity}
      glareColor={glareColor}
      glarePosition={glarePosition}
      tiltReverse={false}
      trackOnWindow={trackOnWindow}
      style={{ 
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </Tilt>
  );
};

export default MotionCard; 
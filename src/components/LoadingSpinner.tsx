import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg',
  color?: 'emerald' | 'blue' | 'red' | 'yellow',
  label?: string,
  className?: string,
}

const LoadingSpinner = ({
  size = 'md',
  color = 'emerald',
  label,
  className = '',
}: LoadingSpinnerProps) => {
  // Calculate dimensions based on size
  const dimensions = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  // Calculate colors based on theme
  const colorClasses = {
    emerald: 'border-emerald-500 border-r-transparent',
    blue: 'border-blue-500 border-r-transparent',
    red: 'border-red-500 border-r-transparent',
    yellow: 'border-yellow-500 border-r-transparent',
  };
  
  // Calculate label size
  const labelSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${dimensions[size]} rounded-full border-2 border-solid ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {label && (
        <p className={`mt-2 text-gray-400 ${labelSize[size]}`}>{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 
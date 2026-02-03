"use client"
import React from 'react';

interface CloseButtonProps {
  onClose: (e:React.MouseEvent) => void; // Fonction à appeler lors du clic
  size?: string; // Taille de l'icône (ex: 'small', 'medium', 'large')
  color?: string; // Couleur de l'icône
  className?: string; // Classes CSS supplémentaires
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClose, size = 'medium', color = 'var(--color-primary)', className }) => {
  // Styles dynamiques basés sur les props
  const styles:any = {
    small: 'w-8 h-8 text-gray-600',
    medium: 'w-12 h-12 text-gray-800',
    large: 'w-16 h-16 text-gray-900',
  };

  const svg:any = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-9 h-9',
  };

  return (
    <button
      className={`flex items-center justify-center rounded-full focus:outline-none ${svg[size]} ${className}`}
      onClick={(e:React.MouseEvent)=>{onClose(e);e.stopPropagation()}}
      aria-label="Close"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${styles[size]} ${color}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

export default CloseButton;

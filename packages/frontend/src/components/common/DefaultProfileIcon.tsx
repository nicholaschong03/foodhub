import React from 'react';

interface DefaultProfileIconProps {
  className?: string;
  size?: number | string;
}

const DefaultProfileIcon: React.FC<DefaultProfileIconProps> = ({ className = '', size = 64 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 12c2.7 0 4.5-2.1 4.5-4.5S14.7 3 12 3 7.5 5.1 7.5 7.5 9.3 12 12 12zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z" />
  </svg>
);

export default DefaultProfileIcon;
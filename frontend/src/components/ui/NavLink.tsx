import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  className = '',
  activeClassName = 'text-blue-600 font-semibold',
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        transition-colors duration-200
        ${className}
        ${isActive ? activeClassName : ''}
      `}
    >
      {children}
    </Link>
  );
};

export default NavLink;

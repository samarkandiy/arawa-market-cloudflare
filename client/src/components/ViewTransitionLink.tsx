import React from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { startViewTransition } from '../utils/viewTransition';

const ViewTransitionLink: React.FC<LinkProps> = ({ to, children, onClick, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Only handle left clicks without modifiers
    if (
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.defaultPrevented
    ) {
      return;
    }

    e.preventDefault();

    startViewTransition(() => {
      navigate(to as string);
    });
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default ViewTransitionLink;

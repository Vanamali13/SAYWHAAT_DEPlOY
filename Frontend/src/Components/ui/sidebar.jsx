
import React from 'react';

export function Sidebar({ className, children }) {
  return (
    <aside className={className}>
      {children}
    </aside>
  );
}

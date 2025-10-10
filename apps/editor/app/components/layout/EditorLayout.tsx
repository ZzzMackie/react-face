/**
 * 编辑器布局组件
 * 负责编辑器的整体布局结构
 * 遵循单一职责原则 (SRP)
 */
import { ReactNode } from 'react';

interface EditorLayoutProps {
  children: ReactNode;
  className?: string;
}

export function EditorLayout({ children, className = '' }: EditorLayoutProps) {
  return (
    <div className={`editor_index__wrapper flex flex-col h-screen ${className}`}>
      {children}
    </div>
  );
}
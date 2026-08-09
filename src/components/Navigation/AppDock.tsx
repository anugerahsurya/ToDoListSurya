'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

interface DockProps {
  items: DockItem[];
}

function DockIcon({
  item,
  mouseX,
  isActive,
}: {
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isActive: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const scale = useSpring(
    useTransform(mouseX, (val) => {
      if (!ref.current) return 1;
      const bounds = ref.current.getBoundingClientRect();
      const center = bounds.x + bounds.width / 2;
      const dist = Math.abs(val - center);
      return Math.max(1, 1.6 - dist * 0.006);
    }),
    { stiffness: 300, damping: 25, mass: 0.5 }
  );

  const router = useRouter();

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <motion.button
      ref={ref}
      style={{ scale }}
      onClick={handleClick}
      data-tooltip={item.label}
      className={`
        relative flex flex-col items-center justify-center
        w-12 h-12 rounded-2xl cursor-pointer
        transition-colors duration-200 group
        ${isActive
          ? 'bg-primary-500/20 text-primary-500'
          : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
        }
      `}
      whileTap={{ scale: 0.88 }}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {item.icon}
      </span>

      {/* Active indicator */}
      {isActive && (
        <motion.span
          layoutId="dock-active"
          className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Badge */}
      {item.badge !== undefined && item.badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
        >
          {item.badge > 9 ? '9+' : item.badge}
        </motion.span>
      )}
    </motion.button>
  );
}

export function AppDock({ items }: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="dock-wrapper">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="
          flex items-center gap-1 px-3 py-2
          rounded-[20px] glass
          shadow-[var(--dock-shadow)]
        "
        style={{
          background: 'var(--dock-bg)',
          border: '1px solid var(--dock-border)',
          boxShadow: 'var(--dock-shadow)',
        }}
      >
        {items.map((item) => (
          <DockIcon
            key={item.id}
            item={item}
            mouseX={mouseX}
            isActive={item.href ? pathname === item.href : false}
          />
        ))}

        {/* Divider */}
        <div className="w-px h-8 mx-1" style={{ background: 'var(--border-color)' }} />

        {/* Dark mode toggle */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          data-tooltip={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          className="
            flex items-center justify-center w-12 h-12 rounded-2xl
            text-[var(--text-secondary)] hover:bg-[var(--border-color)]
            hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer
          "
        >
          <ThemeIcon theme={theme} />
        </motion.button>
      </motion.div>
    </div>
  );
}

function ThemeIcon({ theme }: { theme?: string }) {
  return theme === 'dark' ? (
    // Sun icon
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  ) : (
    // Moon icon
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

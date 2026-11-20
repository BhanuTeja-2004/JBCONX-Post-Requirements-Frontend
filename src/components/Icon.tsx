/** Simple outline icon set drawn for the prototype (24×24, stroke-based). Production: Material Symbols (Android) / SF Symbols (iOS). */
import type { CSSProperties } from 'react';

const P: Record<string, string> = {
  arrowBack: 'M20 12H4m0 0 6-6m-6 6 6 6',
  chevronLeft: 'M15 5 8 12l7 7',
  chevronRight: 'm9 5 7 7-7 7',
  chevronDown: 'm5 9 7 7 7-7',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.6-1.9L20 20',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5',
  helmet: 'M4 16h16M5 16a7 7 0 0 1 14 0M12 9V6M9 10V7.5M15 10V7.5M3.5 19h17',
  roller: 'M5 4h11v5H5zM16 6.5h3V12h-7v3M11 15h2v6h-2z',
  bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z',
  drop: 'M12 3.5s-6 6.6-6 10.9a6 6 0 0 0 12 0C18 10.1 12 3.5 12 3.5Z',
  hammer: 'M13.5 6.5 9 2 6.5 4.5l4.5 4.5M11 9l-7.5 7.5 3 3L14 12M13.5 6.5l4 4 2.5-2.5-4-4',
  brush: 'M14 4l6 6-7 7-6-6zM7 11l-3 3c-1 1-1 4-1 7 3 0 6 0 7-1l3-3',
  brick: 'M3 6h18v12H3zM3 10h18M3 14h18M9 6v4M15 10v4M9 14v4',
  ruler: 'M4 16 16 4l4 4L8 20zM8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5',
  sofa: 'M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 11h18v6H3zM5 17v2M19 17v2',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  building: 'M4 21V5l8-2v18M12 8h8v13M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01M2 21h20',
  shield: 'M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  home: 'M4 10.5 12 4l8 6.5V20H4zM10 20v-5h4v5',
  kitchen: 'M6 3h12v18H6zM6 10h12M9 6.5v1M9 13v3',
  bed: 'M3 18V7M3 13h18v5M21 18v-3a2 2 0 0 0-2-2H10v5M6.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  layers: 'm12 4 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5',
  tree: 'M12 21v-6M7 15h10l-5-11-5 11Z',
  location: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  gps: 'M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 2v3M12 19v3M2 12h3M19 12h3',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5h.01',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v6m0-9.5h.01',
  warning: 'M12 4 2.5 20h19L12 4Zm0 6v4.5m0 3h.01',
  error: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5v5.5m0 3.5h.01',
  lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 15h2',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  wifiOff: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-3.2-2M2 9a15 15 0 0 1 5-3M22 9a15 15 0 0 0-10-4M12 20h.01',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  doc: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  shieldCheck: 'M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4',
  menu: 'M4 7h16M4 12h16M4 17h16',
};

export function Icon({
  name,
  size = 24,
  color = 'currentColor',
  stroke = 1.8,
  style,
  label,
}: {
  name: keyof typeof P | string;
  size?: number;
  color?: string;
  stroke?: number;
  style?: CSSProperties;
  label?: string;
}) {
  const d = P[name] ?? P.more;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={name === 'more' ? 3 : stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} />
    </svg>
  );
}

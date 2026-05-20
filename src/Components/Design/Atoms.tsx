import React from 'react';
import { motion, MotionProps } from 'framer-motion';

/* ────────────────────────────────────────────────────────────
   Cropmarks — four L-shaped crops, one in each corner of a box.
   Wrap a relatively-positioned container to show printing marks.
   ──────────────────────────────────────────────────────────── */
export const Cropmarks: React.FC<{ inset?: number; size?: number }> = ({
  inset = -10,
  size = 14,
}) => {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
  };
  // All decorative; never read aloud.
  const wrapperProps = { 'aria-hidden': true as const };
  const line: React.CSSProperties = {
    position: 'absolute',
    background: 'var(--ink)',
    opacity: 0.55,
  };
  const make = (
    pos: React.CSSProperties,
    hLeft: number,
    hTop: number,
    hRight: number,
    hBottom: number,
    vLeft: number,
    vTop: number,
    vRight: number,
    vBottom: number,
  ) => (
    <div style={{ ...base, ...pos }}>
      <span
        style={{
          ...line,
          left: hLeft, top: hTop, right: hRight, bottom: hBottom,
          height: 1, width: size,
        }}
      />
      <span
        style={{
          ...line,
          left: vLeft, top: vTop, right: vRight, bottom: vBottom,
          width: 1, height: size,
        }}
      />
    </div>
  );
  return (
    <span {...wrapperProps}>
      {make({ left: inset, top: inset }, 0, 0, undefined as any, undefined as any, 0, 0, undefined as any, undefined as any)}
      {make({ right: inset, top: inset }, undefined as any, 0, 0, undefined as any, undefined as any, 0, 0, undefined as any)}
      {make({ left: inset, bottom: inset }, 0, undefined as any, undefined as any, 0, 0, undefined as any, undefined as any, 0)}
      {make({ right: inset, bottom: inset }, undefined as any, undefined as any, 0, 0, undefined as any, undefined as any, 0, 0)}
    </span>
  );
};

/* ────────────────────────────────────────────────────────────
   Perforated rule — dashed line "tear here" style.
   ──────────────────────────────────────────────────────────── */
export const Perf: React.FC<{ vertical?: boolean; opacity?: number; style?: React.CSSProperties }> = ({
  vertical,
  opacity = 0.55,
  style,
}) => (
  <div
    aria-hidden
    className={vertical ? 'ts-perf-v' : 'ts-perf-h'}
    style={{ opacity, ...style }}
  />
);

/* ────────────────────────────────────────────────────────────
   Stamp — circular rotated stamp impression, optional motion.
   ──────────────────────────────────────────────────────────── */
interface StampProps extends MotionProps {
  text: string;
  date?: string;
  tone?: 'stamp' | 'ledger' | 'gold' | 'teal';
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
}
const toneToColor: Record<NonNullable<StampProps['tone']>, string> = {
  stamp: 'var(--stamp)',
  ledger: 'var(--ledger)',
  gold: 'var(--gold)',
  teal: 'var(--teal)',
};
export const Stamp: React.FC<StampProps> = ({
  text,
  date,
  tone = 'stamp',
  size = 90,
  rotate = -12,
  style,
  ...motionProps
}) => {
  const color = toneToColor[tone];
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, scale: 0.6, rotate: rotate - 18 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color,
        border: `2.5px solid ${color}`,
        boxShadow: `inset 0 0 0 4px var(--paper), inset 0 0 0 5px ${color}`,
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        fontSize: size / 9,
        lineHeight: 1.1,
        opacity: 0.86,
        textAlign: 'center',
        padding: 4,
        position: 'relative',
        ...style,
      }}
      {...motionProps}
    >
      <div style={{ fontWeight: 700, fontSize: size / 8 }}>{text}</div>
      {date && (
        <div style={{ marginTop: 4, fontSize: size / 11, letterSpacing: '0.22em' }}>
          {date}
        </div>
      )}
      {/* concentric ink-bleed strokes */}
      <span
        style={{
          position: 'absolute',
          inset: 6,
          borderRadius: '50%',
          border: `1px dashed ${color}`,
          opacity: 0.45,
        }}
      />
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────
   RouteLine — dashed horizontal travel-route SVG with airplane.
   ──────────────────────────────────────────────────────────── */
export const RouteLine: React.FC<{ width?: number | string; color?: string }> = ({
  width = '100%',
  color = 'var(--ink)',
}) => (
  <svg
    viewBox="0 0 800 40"
    width={width}
    height={40}
    preserveAspectRatio="none"
    style={{ display: 'block' }}
    aria-hidden
  >
    <circle cx="20" cy="20" r="4" fill={color} />
    <line
      x1="28"
      y1="20"
      x2="772"
      y2="20"
      stroke={color}
      strokeWidth="1.4"
      strokeDasharray="5 6"
      opacity="0.75"
    />
    <circle cx="780" cy="20" r="4" fill={color} />
    {/* tiny plane glyph in the middle */}
    <g transform="translate(390,11)" fill={color} opacity="0.9">
      <path d="M2 9 L10 5 L11 0 L13 0 L13 5 L18 5 L20 8 L13 9 L13 12 L11 14 L10 12 L2 13 Z" />
    </g>
  </svg>
);

/* ────────────────────────────────────────────────────────────
   PaperCard — the workhorse container. Cropmarks optional.
   ──────────────────────────────────────────────────────────── */
interface PaperCardProps {
  children: React.ReactNode;
  crops?: boolean;
  style?: React.CSSProperties;
  className?: string;
  padded?: boolean;
}
export const PaperCard: React.FC<PaperCardProps> = ({
  children,
  crops = false,
  padded = true,
  style,
  className = '',
}) => (
  <div
    className={`ts-paper ${className}`}
    style={{ padding: padded ? 28 : 0, position: 'relative', ...style }}
  >
    {crops && <Cropmarks />}
    {children}
  </div>
);

/* ────────────────────────────────────────────────────────────
   BoardingPass — two-column pass with a perforated stub.
   Stub becomes a bottom strip on mobile.
   ──────────────────────────────────────────────────────────── */
interface BoardingPassProps {
  main: React.ReactNode;
  stub: React.ReactNode;
  isMobile?: boolean;
  style?: React.CSSProperties;
}
export const BoardingPass: React.FC<BoardingPassProps> = ({
  main,
  stub,
  isMobile,
  style,
}) => {
  if (isMobile) {
    return (
      <div className="ts-pass" style={{ position: 'relative', ...style }}>
        <div style={{ padding: 22 }}>{main}</div>
        <Perf style={{ margin: '0 16px' }} />
        <div
          style={{
            padding: 18,
            background:
              'repeating-linear-gradient(0deg, var(--paper-deep) 0 6px, transparent 6px 12px)',
            backgroundColor: 'var(--paper-deep)',
          }}
        >
          {stub}
        </div>
        {/* punched holes */}
        <span
          style={{
            position: 'absolute',
            left: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 20,
            height: 20,
            borderRadius: 999,
            background: 'var(--paper)',
            boxShadow: 'inset 0 1px 2px rgba(20,17,13,0.18)',
            border: '1px solid var(--paper-edge)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 20,
            height: 20,
            borderRadius: 999,
            background: 'var(--paper)',
            boxShadow: 'inset 0 1px 2px rgba(20,17,13,0.18)',
            border: '1px solid var(--paper-edge)',
          }}
        />
      </div>
    );
  }
  return (
    <div
      className="ts-pass"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 220px)',
        position: 'relative',
        ...style,
      }}
    >
      <div style={{ padding: 26 }}>{main}</div>
      <Perf vertical style={{ margin: '18px 0' }} />
      <div
        style={{
          padding: 22,
          background:
            'repeating-linear-gradient(90deg, var(--paper-deep) 0 6px, transparent 6px 12px)',
          backgroundColor: 'var(--paper-deep)',
        }}
      >
        {stub}
      </div>
      {/* punched holes top & bottom of the perforation */}
      <span
        style={{
          position: 'absolute',
          left: 'calc(100% - 232px)',
          top: -10,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: 'var(--paper)',
          boxShadow: 'inset 0 1px 2px rgba(20,17,13,0.18)',
          border: '1px solid var(--paper-edge)',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: 'calc(100% - 232px)',
          bottom: -10,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: 'var(--paper)',
          boxShadow: 'inset 0 1px 2px rgba(20,17,13,0.18)',
          border: '1px solid var(--paper-edge)',
        }}
      />
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   FieldLabel + Field — small uppercase mono label over a value.
   Used in boarding-pass-style data grids.
   ──────────────────────────────────────────────────────────── */
export const Field: React.FC<{
  label: string;
  value: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg';
  mono?: boolean;
}> = ({ label, value, align = 'left', size = 'md', mono }) => {
  const fontSize = size === 'lg' ? 28 : size === 'sm' ? 16 : 20;
  return (
    <div style={{ textAlign: align }}>
      <div className="ts-label" style={{ marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
          fontWeight: mono ? 500 : 600,
          fontSize,
          color: 'var(--ink)',
          letterSpacing: mono ? '0.04em' : '-0.01em',
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   Ledger row — date | desc | amount, lined.
   ──────────────────────────────────────────────────────────── */
export const LedgerRow: React.FC<{
  date: string;
  description: string;
  meta?: string;
  amount: React.ReactNode;
  hint?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}> = ({ date, description, meta, amount, hint, onClick, active }) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    style={{
      display: 'grid',
      gridTemplateColumns: '92px 1fr auto',
      alignItems: 'baseline',
      gap: 18,
      padding: '14px 16px',
      borderBottom: '1px dashed var(--rule-soft)',
      cursor: onClick ? 'pointer' : 'default',
      background: active ? 'var(--paper-deep)' : 'transparent',
      transition: 'background-color 100ms ease',
    }}
    onMouseEnter={(e) => {
      if (onClick && !active) (e.currentTarget as HTMLElement).style.background = 'rgba(20,17,13,0.04)';
    }}
    onMouseLeave={(e) => {
      if (onClick && !active) (e.currentTarget as HTMLElement).style.background = 'transparent';
    }}
  >
    <div
      className="ts-mono"
      style={{
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--ink-faded)',
      }}
    >
      {date}
    </div>
    <div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 18,
          color: 'var(--ink)',
          lineHeight: 1.15,
        }}
      >
        {description}
      </div>
      {meta && (
        <div className="ts-label" style={{ marginTop: 4, opacity: 0.9 }}>
          {meta}
        </div>
      )}
    </div>
    <div style={{ textAlign: 'right' }}>
      <div
        className="ts-num"
        style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}
      >
        {amount}
      </div>
      {hint && (
        <div className="ts-label" style={{ marginTop: 2 }}>
          {hint}
        </div>
      )}
    </div>
  </div>
);

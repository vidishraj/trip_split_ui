import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';
import { Cropmarks, Perf, RouteLine, Stamp } from '../Components/Design/Atoms';

const SERIAL = (() => {
  // A deterministic-looking pseudo-random "control number" so the page
  // feels like a printed document, not a Figma export.
  const n = Math.floor(Math.random() * 9000 + 1000);
  return `№ TS-${n}-A`;
})();

const FEATURES: { kind: string; title: string; body: string }[] = [
  {
    kind: 'Cl. 01',
    title: 'Currency in transit',
    body:
      'Choose up to three currencies per trip. Amounts are converted live so receipts stay legible no matter the dateline you cross.',
  },
  {
    kind: 'Cl. 02',
    title: 'A fair split, settled.',
    body:
      'Every expense is divided exactly the way it happened. We collapse a tangled ledger into the smallest number of payments.',
  },
  {
    kind: 'Cl. 03',
    title: 'One trip, many hands.',
    body:
      'Invite the companions. Each member writes into the same book. Notes, expenses, balances — kept in one shared dossier.',
  },
  {
    kind: 'Cl. 04',
    title: 'An assistant on call.',
    body:
      'Speak in plain English: "₹500 dinner, split equally." The trip’s clerk parses, files, and confirms — instantly.',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        paddingTop: isMobile ? 32 : 56,
        paddingBottom: isMobile ? 56 : 96,
        overflowX: 'hidden',
      }}
    >
      {/* Top printed header — control number, ledger code */}
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: isMobile ? '0 18px' : '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div className="ts-label">{SERIAL} · Series MMXX·VI</div>
        <div className="ts-label">A traveller&apos;s ledger</div>
      </div>

      {/* Hero block — paper sheet with cropmarks */}
      <div style={{ maxWidth: 1180, margin: '24px auto 0', padding: isMobile ? '0 18px' : '0 32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          style={{
            position: 'relative',
            padding: isMobile ? '40px 4px 40px' : '64px 32px 80px',
          }}
        >
          <Cropmarks inset={-6} />

          <div className="ts-eyebrow" style={{ marginBottom: 18 }}>
            Issued for one bearer · transferable among trusted parties
          </div>

          <h1
            className="ts-display"
            style={{
              fontSize: 'clamp(56px, 11vw, 168px)',
              margin: 0,
              fontVariationSettings: '"SOFT" 30, "WONK" 1, "opsz" 144',
              lineHeight: 0.86,
            }}
          >
            Trip&nbsp;Split.
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
                display: 'block',
                fontSize: '0.62em',
                color: 'var(--ink-soft)',
                marginTop: 12,
              }}
            >
              A ledger for the road.
            </span>
          </h1>

          {/* Stamp pinned over the type */}
          <div
            style={{
              position: 'absolute',
              right: isMobile ? 8 : 'clamp(20px, 6vw, 80px)',
              top: isMobile ? 12 : 30,
              pointerEvents: 'none',
            }}
          >
            <Stamp
              text="Cleared"
              date="MMXXVI·V"
              tone="stamp"
              size={isMobile ? 72 : 120}
              rotate={-9}
            />
          </div>

          {/* Subhead + route */}
          <div
            style={{
              marginTop: isMobile ? 32 : 44,
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
              gap: isMobile ? 20 : 24,
              alignItems: 'end',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(18px, 1.7vw, 22px)',
                lineHeight: 1.5,
                color: 'var(--ink-soft)',
                maxWidth: 640,
                margin: 0,
              }}
            >
              An expense book for trips. Live currencies, fair splits, kept honest
              between you and your companions — and now, with an assistant who
              listens to plain English and files the numbers for you.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
              }}
            >
              <button
                className="ts-btn ts-btn-ink"
                onClick={() => navigate('/login')}
              >
                Begin a trip ↗
              </button>
              <button
                className="ts-btn"
                onClick={() =>
                  window.open(
                    'https://docs.vidish.space/search/?q=tripsplit',
                    '_blank',
                  )
                }
              >
                Read the dossier
              </button>
            </div>
          </div>

          <div style={{ marginTop: 60 }}>
            <RouteLine />
          </div>

          {/* Origin / destination boarding-pass strip */}
          {isMobile ? (
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-faded)',
              }}
            >
              <div>HOME</div>
              <div>THE ROAD</div>
              <div>A FAIR SPLIT</div>
            </div>
          ) : (
            <div
              style={{
                marginTop: 8,
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto 1fr',
                alignItems: 'center',
                gap: 16,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ink-faded)',
              }}
            >
              <div>From&nbsp;·&nbsp;HOME</div>
              <Perf style={{ width: 24 }} />
              <div style={{ textAlign: 'center' }}>Via&nbsp;·&nbsp;THE ROAD</div>
              <Perf style={{ width: 24 }} />
              <div style={{ textAlign: 'right' }}>To&nbsp;·&nbsp;A FAIR SPLIT</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Feature cards as ledger entries */}
      <div
        style={{
          maxWidth: 1180,
          margin: isMobile ? '40px auto 0' : '72px auto 0',
          padding: isMobile ? '0 18px' : '0 32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 18,
          }}
        >
          <div className="ts-eyebrow">Inventory of services</div>
          <div className="ts-eyebrow">Sec. II</div>
        </div>
        <div className="ts-rule" />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 0,
            marginTop: 0,
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.kind}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              style={{
                padding: '28px 22px 32px',
                borderRight: '1px dashed var(--rule-soft)',
                borderBottom: '1px dashed var(--rule-soft)',
              }}
            >
              <div className="ts-label" style={{ marginBottom: 12 }}>
                {f.kind}
              </div>
              <h3
                className="ts-display"
                style={{
                  fontSize: 26,
                  margin: 0,
                  marginBottom: 12,
                  fontVariationSettings: '"SOFT" 30, "opsz" 144',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  color: 'var(--ink-soft)',
                  lineHeight: 1.5,
                  fontSize: 16.5,
                }}
              >
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer band */}
      <div
        style={{
          maxWidth: 1180,
          margin: isMobile ? '32px auto 0' : '64px auto 0',
          padding: isMobile ? '0 18px' : '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div className="ts-label">
          Issued by — the bearer themselves · No fee · No tracking
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <span className="ts-stamp">Volume I</span>
          <span className="ts-label">·</span>
          <span className="ts-stamp">Edition MMXXVI</span>
        </div>
      </div>
    </div>
  );
};

export default Home;

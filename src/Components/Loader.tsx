import React from 'react';
import { motion } from 'framer-motion';
import { useLoading } from '../Contexts/LoadingContext';

const Loader: React.FC = () => {
  const { loading } = useLoading();
  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(243, 236, 216, 0.78)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Rotating stamp ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            border: '2px dashed var(--stamp)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '2px solid var(--stamp)',
              color: 'var(--stamp)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.2em',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            ✦
          </div>
        </motion.div>

        <div
          className="ts-mono"
          style={{
            marginTop: 14,
            fontSize: 11,
            color: 'var(--ink-soft)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          Stamping…
        </div>
      </div>
    </div>
  );
};

export default Loader;

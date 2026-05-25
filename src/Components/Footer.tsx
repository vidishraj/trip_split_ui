import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useTravel } from '../Contexts/TravelContext';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const travelCtx = useTravel();

  const handleTripsPage = () => {
    setSearchParams({});
    navigate('/trip');
    travelCtx.dispatch({ type: 'SET_CHOSEN_TRIP', payload: undefined });
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      /* noop */
    }
  };

  return (
    <footer
      style={{
        padding: '20px 18px 28px',
        maxWidth: 1180,
        margin: '48px auto 0',
        borderTop: '1px solid var(--rule-soft)',
      }}
    >
      {/* Top metadata band */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}
      >
        <div className="ts-label">
          Colophon · Issued by the bearer themselves
        </div>
        <div
          className="ts-mono"
          style={{ fontSize: 11, color: 'var(--ink-faded)', letterSpacing: '0.18em' }}
        >
          Vol. I · Edition MMXXVI
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          paddingTop: 14,
          borderTop: '1px dashed var(--rule-soft)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          <div
            className="ts-display"
            style={{
              fontSize: 22,
              fontVariationSettings: '"SOFT" 30, "opsz" 144',
              letterSpacing: '-0.02em',
            }}
          >
            Trip&nbsp;Split.
          </div>
          <div className="ts-label">A ledger for the road</div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="ts-btn" onClick={handleTripsPage}>
            ← Departures
          </button>
          <button className="ts-btn ts-btn-stamp" onClick={handleLogout}>
            Sign off
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect, useMemo, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';
import { auth } from '../Api/FirebaseConfig';
import { useUser } from '../Contexts/GlobalContext';
import { useAuth } from '../Contexts/AuthContext';
import { useMessage } from '../Contexts/NotifContext';
import SignupDialog from '../Components/Signup';
import { Cropmarks, Perf, Stamp } from '../Components/Design/Atoms';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const notif = useMessage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const serial = useMemo(
    () => Math.random().toString(36).slice(2, 10).toUpperCase(),
    [],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      notif.setPayload({
        type: 'error',
        message: 'Could not authenticate. Check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      const returnTo = searchParams.get('returnTo');
      navigate(returnTo || '/trip');
    }
  }, [currentUser, navigate, searchParams, setUser]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
        style={{
          width: '100%',
          maxWidth: 560,
          position: 'relative',
        }}
      >
        <Cropmarks inset={-8} />

        <div
          className="ts-paper"
          style={{
            padding: isMobile ? '28px 22px 24px' : '40px 36px 36px',
            position: 'relative',
          }}
        >
          {/* Header band */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderBottom: '1px solid var(--rule-soft)',
              paddingBottom: 14,
              marginBottom: 22,
            }}
          >
            <div>
              <div className="ts-eyebrow">Document of admission</div>
              <h1
                className="ts-display"
                style={{
                  fontSize: isMobile ? 32 : 42,
                  margin: '6px 0 0',
                  fontVariationSettings: '"SOFT" 30, "opsz" 144',
                }}
              >
                Sign in.
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="ts-label">Form A · I</div>
              <div className="ts-mono" style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-faded)' }}>
                rev. MMXXVI
              </div>
            </div>
          </div>

          {/* Big number — the airline-stub aesthetic */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 14,
              marginBottom: isMobile ? 20 : 28,
            }}
          >
            <div>
              <div className="ts-label">Bearer's email</div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: isMobile ? 14 : 16,
                  color: 'var(--ink-faded)',
                  marginTop: 4,
                }}
              >
                Present credentials to the clerk
              </div>
            </div>
            <Stamp
              text="Auth"
              date="ENTRY"
              tone="ledger"
              size={isMobile ? 62 : 84}
              rotate={6}
            />
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 22 }}>
              <label className="ts-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@somewhere.world"
                className="ts-input"
                required
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="ts-label" htmlFor="password">Passphrase</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••"
                className="ts-input"
                required
              />
            </div>

            <Perf style={{ margin: '6px 0 22px' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                gap: 10,
                flexWrap: 'wrap',
                flexDirection: isMobile ? 'column' : 'row',
              }}
            >
              <button
                type="submit"
                className="ts-btn ts-btn-ink"
                disabled={loading}
                style={{
                  minWidth: 180,
                  justifyContent: isMobile ? 'center' : undefined,
                }}
              >
                {loading ? 'Stamping…' : 'Admit me ↗'}
              </button>
              <button
                type="button"
                className="ts-btn ts-btn-stamp"
                onClick={() => setOpenSignup(true)}
                style={{ justifyContent: isMobile ? 'center' : undefined }}
              >
                Register a new bearer
              </button>
            </div>
          </form>

          {/* Bottom serial */}
          <div
            style={{
              marginTop: 30,
              paddingTop: 14,
              borderTop: '1px dashed var(--rule-soft)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div className="ts-mono" style={{ fontSize: 11, color: 'var(--ink-faded)', letterSpacing: '0.16em' }}>
              SER · {serial}
            </div>
            <div className="ts-label">Issued under no jurisdiction</div>
          </div>
        </div>
      </motion.div>

      <SignupDialog open={openSignup} onClose={() => setOpenSignup(false)} />
    </div>
  );
};

export default Login;

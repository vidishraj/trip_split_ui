import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { useUser } from '../Contexts/GlobalContext';
import { auth } from '../Api/FirebaseConfig';
import { insertUser } from '../Api/Api';
import { useMessage } from '../Contexts/NotifContext';
import { Perf, Stamp } from './Design/Atoms';

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const notif = useMessage();

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (userName.length < 5) {
      setError('Name must be at least 5 characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await insertUser({ userName, email });
        setUser(response.user);
        onClose();
      } catch {
        notif.setPayload({
          type: 'error',
          message: 'Could not finish registration. Try again.',
        });
        await deleteUser(response.user);
      }
    } catch {
      notif.setPayload({
        type: 'error',
        message: 'Could not register. Try again later.',
      });
      setError('Could not register. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
    >
      <div className="ts-paper" style={{ padding: '32px 32px 28px', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--rule-soft)',
            paddingBottom: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <div className="ts-eyebrow">Application for new bearer</div>
            <h2
              className="ts-display"
              style={{
                margin: '6px 0 0',
                fontSize: 32,
                fontVariationSettings: '"SOFT" 30, "opsz" 144',
              }}
            >
              Register.
            </h2>
          </div>
          <Stamp text="New" date="·" tone="gold" size={70} rotate={9} />
        </div>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: 18 }}>
            <label className="ts-label">Name</label>
            <input
              className="ts-input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="As it should appear on the manifest"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="ts-label">Email</label>
            <input
              className="ts-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.world"
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <label className="ts-label">Passphrase</label>
              <input
                className="ts-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="ts-label">Repeat</label>
              <input
                className="ts-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div
              className="ts-mono"
              style={{
                color: 'var(--stamp)',
                fontSize: 13,
                margin: '6px 0 14px',
                letterSpacing: '0.04em',
              }}
            >
              ✕ {error}
            </div>
          )}

          <Perf style={{ margin: '16px 0' }} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button type="button" className="ts-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ts-btn ts-btn-ink" disabled={loading}>
              {loading ? 'Filing…' : 'File application ↗'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default SignupDialog;

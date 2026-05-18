import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { insertTrip } from '../../Api/Api';
import { currencies } from '../../Assets/currencyData';
import { MessageContextType } from '../../Assets/types';
import { Perf, Stamp } from '../Design/Atoms';

interface CreateTripDialogProps {
  open: boolean;
  handleClose: () => void;
  refetchTrips: () => void;
}

export const CreateTripDialog: React.FC<CreateTripDialogProps> = ({
  open,
  handleClose,
  refetchTrips,
}) => {
  const [tripTitle, setTripTitle] = useState<string>('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const notif: MessageContextType = useMessage();

  const toggleCurrency = (label: string) => {
    setSelectedCurrencies((prev) => {
      if (prev.includes(label)) return prev.filter((c) => c !== label);
      if (prev.length < 3) return [...prev, label];
      return prev;
    });
  };

  const reset = () => {
    setTripTitle('');
    setSelectedCurrencies([]);
    handleClose();
  };

  const create = () => {
    insertTrip({ trip: tripTitle, currencies: selectedCurrencies })
      .then((res) => {
        if (res.status === 200) {
          notif.setPayload({ type: 'success', message: 'Ticket issued.' });
        }
        reset();
        refetchTrips();
      })
      .catch(() => {
        notif.setPayload({ type: 'error', message: 'Could not issue ticket.' });
        reset();
      });
  };

  const disabled = selectedCurrencies.length < 1 || tripTitle.length < 3;

  return (
    <Dialog
      open={open}
      onClose={reset}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
    >
      <div className="ts-paper" style={{ padding: '32px 32px 28px', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--rule-soft)',
            paddingBottom: 14,
            marginBottom: 22,
          }}
        >
          <div>
            <div className="ts-eyebrow">Booking · New itinerary</div>
            <h2
              className="ts-display"
              style={{
                margin: '6px 0 0',
                fontSize: 30,
                fontVariationSettings: '"SOFT" 30, "opsz" 144',
              }}
            >
              Issue a new ticket.
            </h2>
          </div>
          <Stamp text="Booking" date="·" tone="ledger" size={72} rotate={8} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label className="ts-label">Destination / Trip title</label>
          <input
            className="ts-input"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            placeholder="e.g. Kyoto autumn"
            maxLength={150}
          />
          <div
            className="ts-mono"
            style={{
              fontSize: 11,
              color: 'var(--ink-faded)',
              marginTop: 4,
              letterSpacing: '0.12em',
            }}
          >
            Minimum 3 characters.
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label className="ts-label">Currencies on the trip</label>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {currencies.map((c) => {
              const on = selectedCurrencies.includes(c.label);
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => toggleCurrency(c.label)}
                  className="ts-mono"
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${on ? 'var(--ink)' : 'var(--rule-soft)'}`,
                    background: on ? 'var(--ink)' : 'transparent',
                    color: on ? 'var(--paper)' : 'var(--ink)',
                    cursor: 'pointer',
                    fontSize: 12,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    transition: 'all 100ms ease',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div
            className="ts-mono"
            style={{
              marginTop: 8,
              fontSize: 11,
              color: 'var(--ink-faded)',
              letterSpacing: '0.12em',
            }}
          >
            {selectedCurrencies.length} of 3 selected.
          </div>
        </div>

        <Perf style={{ margin: '6px 0 18px' }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button className="ts-btn" onClick={reset}>Cancel</button>
          <button
            className="ts-btn ts-btn-ink"
            disabled={disabled}
            onClick={create}
          >
            File the ticket ↗
          </button>
        </div>
      </div>
    </Dialog>
  );
};

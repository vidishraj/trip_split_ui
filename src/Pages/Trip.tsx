// TripPage.tsx — Departures board
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';
import { useTravel } from '../Contexts/TravelContext';
import { useMessage } from '../Contexts/NotifContext';
import { fetchTrips, deleteTrip } from '../Api/Api';
import { TripData } from '../Assets/types';
import { CreateTripDialog } from '../Components/TripPage/CreateTripDialog';
import { ConnectTripDialog } from '../Components/TripPage/ConnectTripDialog';
import { EditTripDialog } from '../Components/TripPage/EditTripDialog';
import { Cropmarks, Perf, Stamp } from '../Components/Design/Atoms';
import { useUser } from '../Contexts/GlobalContext';

const codeFromTitle = (title: string) => {
  const trimmed = (title || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  return trimmed.slice(0, 3).padEnd(3, '·');
};

const TripPage: React.FC = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openConnect, setOpenConnect] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState<TripData | undefined>();

  const notif = useMessage();
  const travelCtx = useTravel();
  const { user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const refetchTrips = (): void => {
    fetchTrips(true)
      .then((response) => {
        if (Array.isArray(response.data.Message)) {
          response.data.Message.forEach((item: TripData) => {
            item['currencies'] = item['currencies'].toString().split(',');
          });
          travelCtx.dispatch({ type: 'SET_TRIP', payload: response.data.Message });
        }
      })
      .catch(() =>
        notif.setPayload({ type: 'error', message: 'Could not fetch trips.' }),
      );
  };

  const handleSelectTrip = (item: TripData) => {
    travelCtx.dispatch({ type: 'SET_CHOSEN_TRIP', payload: item });
  };

  const handleDeleteTrip = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    deleteTrip(true, tripId)
      .then((res) => {
        if (res.status === 200) {
          notif.setPayload({ type: 'success', message: 'Trip filed away.' });
          refetchTrips();
        }
      })
      .catch((err) => {
        notif.setPayload({
          type: 'error',
          message:
            err?.response?.status === 409
              ? 'Cannot delete — expenses recorded against this trip.'
              : 'Could not delete trip.',
        });
      });
  };

  const handleEditTrip = (e: React.MouseEvent, item: TripData) => {
    e.stopPropagation();
    setEditData(item);
    setOpenEdit(true);
  };

  const trips = travelCtx?.state?.trip ?? [];
  const firstName = (user?.email ?? '').split('@')[0] || 'bearer';

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: isMobile ? '24px 14px 60px' : '36px 20px 80px',
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Header band */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          <div className="ts-eyebrow">Departures · The bearer is</div>
          <h1
            className="ts-display"
            style={{
              margin: '6px 0 0',
              fontSize: 'clamp(36px, 8vw, 72px)',
              fontVariationSettings: '"SOFT" 30, "WONK" 1, "opsz" 144',
              overflowWrap: 'anywhere',
            }}
          >
            {firstName}.
          </h1>
        </div>
        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
          <div className="ts-mono" style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--ink-faded)' }}>
            {new Date().toUTCString().split(' ').slice(0, 4).join(' ')}
          </div>
          <div className="ts-label" style={{ marginTop: 4 }}>
            Manifest · {trips.length.toString().padStart(2, '0')} trip{trips.length === 1 ? '' : 's'} on file
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <button className="ts-btn ts-btn-ink" onClick={() => setOpenCreate(true)}>
          + Issue new ticket
        </button>
        <button className="ts-btn ts-btn-stamp" onClick={() => setOpenConnect(true)}>
          Join an existing trip
        </button>
      </div>

      <div className="ts-rule" style={{ marginBottom: 22 }} />

      {/* Trip cards */}
      {trips.length === 0 ? (
        <div
          style={{
            border: '1px dashed var(--rule-soft)',
            padding: '64px 24px',
            textAlign: 'center',
            color: 'var(--ink-faded)',
          }}
        >
          <div className="ts-label" style={{ marginBottom: 8 }}>No tickets on file</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--ink-soft)',
              fontStyle: 'italic',
            }}
          >
            The departures board is empty.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: isMobile ? 16 : 22,
          }}
        >
          {trips.map((trip: TripData, idx: number) => (
            <motion.div
              key={trip.tripIdShared}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              style={{ position: 'relative' }}
            >
              <Cropmarks inset={-6} />
              <div
                className="ts-pass"
                onClick={() => handleSelectTrip(trip)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectTrip(trip);
                  }
                }}
                style={{
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open trip ${trip.tripTitle}`}
              >
                {/* Top: airline-strip header */}
                <div
                  style={{
                    padding: '14px 18px',
                    background:
                      'repeating-linear-gradient(90deg, var(--ink) 0 12px, transparent 12px 14px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.22em',
                      fontSize: 11,
                      color: 'var(--paper)',
                      background: 'var(--ink)',
                      padding: '4px 10px',
                    }}
                  >
                    TRIP·SPLIT
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.22em',
                      color: 'var(--paper)',
                      background: 'var(--ink)',
                      padding: '4px 10px',
                    }}
                  >
                    {codeFromTitle(trip.tripTitle)}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '22px 22px 12px' }}>
                  <div className="ts-label">Destination</div>
                  <div
                    className="ts-display"
                    style={{
                      fontSize: 30,
                      lineHeight: 1.05,
                      marginTop: 4,
                      marginBottom: 14,
                      fontVariationSettings: '"SOFT" 30, "opsz" 144',
                    }}
                  >
                    {trip.tripTitle}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                    }}
                  >
                    <div>
                      <div className="ts-label">Trip ID</div>
                      <div
                        className="ts-mono"
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          marginTop: 2,
                        }}
                      >
                        {trip.tripIdShared}
                      </div>
                    </div>
                    <div>
                      <div className="ts-label">Currencies</div>
                      <div
                        style={{
                          marginTop: 2,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        {(Array.isArray(trip.currencies)
                          ? trip.currencies
                          : String(trip.currencies).split(',')
                        ).map((c: string) => (
                          <span
                            key={c}
                            className="ts-mono"
                            style={{
                              fontSize: 11,
                              padding: '2px 6px',
                              border: '1px solid var(--rule-soft)',
                              letterSpacing: '0.12em',
                            }}
                          >
                            {c.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Perf style={{ margin: '6px 18px 12px' }} />

                {/* Footer: actions */}
                <div
                  style={{
                    padding: '0 18px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div className="ts-label">↗ Tap to board</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="ts-btn"
                      onClick={(e) => handleEditTrip(e, trip)}
                      style={{ padding: '6px 12px', fontSize: 10 }}
                    >
                      Edit
                    </button>
                    <button
                      className="ts-btn ts-btn-stamp"
                      onClick={(e) => handleDeleteTrip(e, trip.tripIdShared)}
                      style={{ padding: '6px 12px', fontSize: 10 }}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom stamp */}
      {trips.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 36,
          }}
        >
          <Stamp text="Boarding" date={new Date().getFullYear().toString()} tone="ledger" size={88} rotate={-8} />
        </div>
      )}

      <CreateTripDialog open={openCreate} handleClose={() => setOpenCreate(false)} refetchTrips={refetchTrips} />
      <ConnectTripDialog open={openConnect} handleClose={() => setOpenConnect(false)} />
      <EditTripDialog
        editData={editData}
        open={openEdit}
        handleClose={() => setOpenEdit(false)}
        refetchTrips={refetchTrips}
      />
    </div>
  );
};

export default TripPage;

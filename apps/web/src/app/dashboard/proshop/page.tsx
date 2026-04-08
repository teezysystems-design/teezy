'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

const C = {
  green: '#1a7f4b',
  greenPale: '#e8f5ee',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',
  amber: '#f59e0b',
  amberPale: '#fffbeb',
  blue: '#3b82f6',
  bluePale: '#eff6ff',
  red: '#ef4444',
  redPale: '#fef2f2',
};

const POLL_INTERVAL_MS = 30_000;

interface Golfer {
  id: string;
  name: string;
  handicap?: number | null;
  checkedIn: boolean;
  noShow: boolean;
}

interface Booking {
  id: string;
  bookerName: string;
  bookerEmail: string;
  partySize: number;
  golfers: Golfer[];
  checkedIn: boolean;
  noShow: boolean;
  createdAt: string;
}

interface TeeTimeSlot {
  id: string;
  startsAt: string;
  capacity: number;
  bookedCount: number;
  priceInCents: number;
  bookings?: Booking[];
}

function StatCard({ label, value, color, bg }: { label: string; value: string; color: string; bg?: string }) {
  return (
    <div style={{ background: bg ?? C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: '1.25rem' }}>
      <p style={{ fontSize: '0.82rem', color: C.gray600, fontWeight: 500, marginBottom: '0.4rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

function BookingDetailModal({
  slot,
  onClose,
  onCheckIn,
  onNoShow,
}: {
  slot: TeeTimeSlot;
  onClose: () => void;
  onCheckIn: (slotId: string, bookingId: string) => Promise<void>;
  onNoShow: (slotId: string, bookingId: string) => Promise<void>;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const time = new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  async function handleCheckIn(bookingId: string) {
    setActionLoading(`checkin-${bookingId}`);
    await onCheckIn(slot.id, bookingId);
    setActionLoading(null);
  }

  async function handleNoShow(bookingId: string) {
    setActionLoading(`noshow-${bookingId}`);
    await onNoShow(slot.id, bookingId);
    setActionLoading(null);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: C.white, borderRadius: 16, width: '100%', maxWidth: 560,
          maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.gray200}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: C.gray900 }}>
              Tee Time — {time}
            </h2>
            <p style={{ fontSize: '0.82rem', color: C.gray500, marginTop: 2 }}>
              {slot.bookedCount}/{slot.capacity} golfers booked · ${(slot.priceInCents / 100).toFixed(0)}/golfer
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.gray100, border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Bookings */}
        <div style={{ padding: '1rem 1.5rem' }}>
          {!slot.bookings || slot.bookings.length === 0 ? (
            <p style={{ color: C.gray500, textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
              No bookings for this slot.
            </p>
          ) : (
            slot.bookings.map((booking) => (
              <div
                key={booking.id}
                style={{ border: `1px solid ${C.gray200}`, borderRadius: 12, marginBottom: '1rem', overflow: 'hidden' }}
              >
                {/* Booking header */}
                <div style={{
                  padding: '0.85rem 1rem',
                  background: booking.checkedIn ? C.greenPale : booking.noShow ? C.redPale : C.gray50,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
                }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: C.gray900 }}>{booking.bookerName}</p>
                    <p style={{ fontSize: '0.78rem', color: C.gray500 }}>{booking.bookerEmail}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {booking.checkedIn && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 10, background: C.green, color: C.white }}>
                        ✓ Checked In
                      </span>
                    )}
                    {booking.noShow && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 10, background: C.red, color: C.white }}>
                        No Show
                      </span>
                    )}
                    {!booking.checkedIn && !booking.noShow && (
                      <>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleCheckIn(booking.id)}
                          style={{
                            background: C.green, color: C.white, border: 'none', borderRadius: 7,
                            padding: '0.3rem 0.7rem', fontSize: '0.8rem', fontWeight: 700,
                            cursor: 'pointer', opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          {actionLoading === `checkin-${booking.id}` ? '…' : 'Check In'}
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleNoShow(booking.id)}
                          style={{
                            background: C.redPale, color: C.red, border: `1px solid ${C.red}`, borderRadius: 7,
                            padding: '0.3rem 0.7rem', fontSize: '0.8rem', fontWeight: 700,
                            cursor: 'pointer', opacity: actionLoading ? 0.6 : 1,
                          }}
                        >
                          {actionLoading === `noshow-${booking.id}` ? '…' : 'No Show'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Player list */}
                {booking.golfers && booking.golfers.length > 0 ? (
                  <div style={{ padding: '0.75rem 1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.gray500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Party ({booking.golfers.length} golfer{booking.golfers.length !== 1 ? 's' : ''})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {booking.golfers.map((g, i) => (
                        <div key={g.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: C.gray700 }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: C.greenPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: C.green, flexShrink: 0 }}>
                            {i + 1}
                          </span>
                          <span style={{ fontWeight: 500 }}>{g.name}</span>
                          {g.handicap != null && <span style={{ fontSize: '0.75rem', color: C.gray500 }}>HCP {g.handicap}</span>}
                          {g.checkedIn && <span style={{ fontSize: '0.7rem', color: C.green, fontWeight: 700 }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: C.gray500 }}>
                    Party of {booking.partySize} — golfer details unavailable
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProShopPage() {
  const courseId = process.env['NEXT_PUBLIC_COURSE_ID'];
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TeeTimeSlot | null>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dateParam = today.toISOString().split('T')[0]!;

  async function fetchSlots() {
    if (!courseId) return;
    try {
      const res = await apiFetch(`/v1/availability/${courseId}/slots?date=${dateParam}`);
      if (!res.ok) throw new Error();
      const { data } = await res.json() as { data: TeeTimeSlot[] };
      setSlots(data ?? []);
      setLastUpdated(new Date());
      setSelectedSlot((prev) => {
        if (!prev) return null;
        const fresh = (data ?? []).find((s) => s.id === prev.id);
        return fresh ? { ...fresh, ...(prev.bookings ? { bookings: prev.bookings } : {}) } : prev;
      });
    } catch {
      // keep stale data on poll failure
    } finally {
      setLoading(false);
    }
  }

  async function fetchSlotBookings(slotId: string): Promise<Booking[]> {
    try {
      const res = await apiFetch(`/v1/bookings?slotId=${slotId}`);
      if (!res.ok) return [];
      const { data } = await res.json() as { data: Booking[] };
      return data ?? [];
    } catch {
      return [];
    }
  }

  async function openSlotDetail(slot: TeeTimeSlot) {
    const bookings = await fetchSlotBookings(slot.id);
    setSelectedSlot({ ...slot, bookings });
  }

  async function handleCheckIn(slotId: string, bookingId: string) {
    try {
      await apiFetch(`/v1/bookings/${bookingId}/check-in`, { method: 'POST' });
    } catch { /* best effort */ }
    const bookings = await fetchSlotBookings(slotId);
    setSelectedSlot((prev) => prev ? { ...prev, bookings } : null);
    await fetchSlots();
  }

  async function handleNoShow(slotId: string, bookingId: string) {
    try {
      await apiFetch(`/v1/bookings/${bookingId}/no-show`, { method: 'POST' });
    } catch { /* best effort */ }
    const bookings = await fetchSlotBookings(slotId);
    setSelectedSlot((prev) => prev ? { ...prev, bookings } : null);
    await fetchSlots();
  }

  useEffect(() => {
    fetchSlots();
    pollerRef.current = setInterval(fetchSlots, POLL_INTERVAL_MS);
    return () => { if (pollerRef.current) clearInterval(pollerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const bookedSlots = slots.filter((s) => s.bookedCount > 0).length;
  const totalGolfers = slots.reduce((sum, s) => sum + s.bookedCount, 0);
  const availableSlots = slots.filter((s) => s.bookedCount < s.capacity).length;

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.gray900 }}>Pro Shop — Today</h1>
          <p style={{ color: C.gray600, marginTop: '0.25rem' }}>{todayStr}</p>
        </div>
        {lastUpdated && (
          <p style={{ fontSize: '0.78rem', color: C.gray500, marginTop: '0.5rem' }}>
            Live · updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        )}
      </div>

      {!courseId ? (
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: '2.5rem', textAlign: 'center', color: C.gray600 }}>
          Set <code style={{ background: C.gray50, padding: '0.15rem 0.4rem', borderRadius: 4 }}>NEXT_PUBLIC_COURSE_ID</code> to view today's tee sheet.
        </div>
      ) : loading ? (
        <p style={{ color: C.gray600 }}>Loading today's tee sheet…</p>
      ) : (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard label="Tee Times" value={String(slots.length)} color={C.gray900} />
            <StatCard label="Booked" value={String(bookedSlots)} color={C.green} bg={C.greenPale} />
            <StatCard label="Available" value={String(availableSlots)} color={C.blue} bg={C.bluePale} />
            <StatCard label="Golfers Today" value={String(totalGolfers)} color={C.amber} bg={C.amberPale} />
          </div>

          {/* Tee sheet table */}
          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${C.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: C.gray900 }}>Tee Sheet</h2>
              <span style={{ fontSize: '0.78rem', color: C.gray500 }}>Click a row to view bookings &amp; check in</span>
            </div>

            {slots.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: C.gray600 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                No tee times scheduled for today.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: C.gray50 }}>
                    {['Time', 'Status', 'Booked / Cap', 'Price', ''].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: C.gray600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => {
                    const isFull = slot.bookedCount >= slot.capacity;
                    const hasBookings = slot.bookedCount > 0;
                    const time = new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr
                        key={slot.id}
                        onClick={() => hasBookings && openSlotDetail(slot)}
                        style={{ borderTop: `1px solid ${C.gray200}`, cursor: hasBookings ? 'pointer' : 'default' }}
                        onMouseEnter={(e) => { if (hasBookings) (e.currentTarget as HTMLElement).style.background = C.gray50; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: C.gray900 }}>{time}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 12,
                            background: isFull ? C.redPale : hasBookings ? C.greenPale : C.gray100,
                            color: isFull ? C.red : hasBookings ? C.green : C.gray600,
                          }}>
                            {isFull ? 'Full' : hasBookings ? 'Booked' : 'Open'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: C.gray700 }}>
                          <strong>{slot.bookedCount}</strong>/{slot.capacity} golfers
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: C.gray700 }}>
                          ${(slot.priceInCents / 100).toFixed(0)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {hasBookings && <span style={{ fontSize: '0.78rem', color: C.green, fontWeight: 600 }}>View →</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pro shop note */}
          <div style={{ marginTop: '1.5rem', background: C.amberPale, border: `1px solid #fcd34d`, borderRadius: 12, padding: '1rem 1.25rem', fontSize: '0.88rem', color: C.gray700 }}>
            <strong>Pro Shop Only:</strong> This view shows today&apos;s tee sheet and check-ins.
            For revenue analytics, course profile, and event management, switch to{' '}
            <a href="/dashboard" style={{ color: C.green, fontWeight: 700 }}>Manager View</a>.
          </div>
        </>
      )}

      {/* Booking detail modal */}
      {selectedSlot && (
        <BookingDetailModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onCheckIn={handleCheckIn}
          onNoShow={handleNoShow}
        />
      )}
    </div>
  );
}

import { create } from 'zustand';

export type DiscoverView = 'list' | 'map';
export type MoodFilter =
  | 'all'
  | 'relaxed'
  | 'competitive'
  | 'social'
  | 'scenic'
  | 'beginner'
  | 'fast-paced'
  | 'challenging';

interface AppState {
  // Discover screen
  discoverView: DiscoverView;
  setDiscoverView: (view: DiscoverView) => void;
  selectedMood: MoodFilter;
  setSelectedMood: (mood: MoodFilter) => void;

  // Booking flow
  pendingBooking: {
    teeTimeId: string;
    courseId: string;
    courseName: string;
    startsAt: string;
    pricePerPersonCents: number;
    maxPlayers: number;
  } | null;
  setPendingBooking: (booking: AppState['pendingBooking']) => void;
  clearPendingBooking: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  discoverView: 'list',
  setDiscoverView: (view) => set({ discoverView: view }),
  selectedMood: 'all',
  setSelectedMood: (mood) => set({ selectedMood: mood }),

  pendingBooking: null,
  setPendingBooking: (booking) => set({ pendingBooking: booking }),
  clearPendingBooking: () => set({ pendingBooking: null }),
}));

import { create } from 'zustand';
import type { ImageUpload } from '../types';

interface UploadState {
  uploads: ImageUpload[];
  addUpload: (upload: ImageUpload) => void;
  updateUpload: (id: string, updates: Partial<ImageUpload>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  getAccepted: () => ImageUpload[];
  getRejected: () => ImageUpload[];
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: [],

  addUpload: (upload) =>
    set((state) => ({
      uploads: [upload, ...state.uploads],
    })),

  updateUpload: (id, updates) =>
    set((state) => ({
      uploads: state.uploads.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    })),

  removeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter(
        (u) => u.status !== 'accepted' && u.status !== 'rejected',
      ),
    })),

  getAccepted: () => get().uploads.filter((u) => u.status === 'accepted'),

  getRejected: () => get().uploads.filter((u) => u.status === 'rejected'),
}));

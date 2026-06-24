import axios from 'axios';
import type { ApiImage, ApiResponse, ImageStatusResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const imageApi = {
  upload: async (
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ApiImage> => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post<ApiResponse<ApiImage>>('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });

    return data.data;
  },

  getAll: async (): Promise<ApiImage[]> => {
    const { data } = await api.get<ApiResponse<ApiImage[]>>('/images');
    return data.data;
  },

  getById: async (id: string): Promise<ApiImage> => {
    const { data } = await api.get<ApiResponse<ApiImage>>(`/images/${id}`);
    return data.data;
  },

  getStatus: async (id: string): Promise<ImageStatusResponse> => {
    const { data } = await api.get<ApiResponse<ImageStatusResponse>>(
      `/images/status/${id}`,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/images/${id}`);
  },
};

export default api;

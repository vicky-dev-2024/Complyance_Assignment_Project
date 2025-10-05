import { apiClient } from '@/lib/api';
import type { UploadResponse, UploadTextRequest } from '@/types/api.types';
import { API_ENDPOINTS } from '@/lib/constants';

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>(
    API_ENDPOINTS.UPLOAD,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}

export async function uploadText(
  request: UploadTextRequest
): Promise<UploadResponse> {
  const { data } = await apiClient.post<UploadResponse>(
    API_ENDPOINTS.UPLOAD,
    request
  );

  return data;
}

import { useMutation } from '@tanstack/react-query';
import { uploadText } from '../api/uploadApi';
import { toast } from 'sonner';
import type { UploadTextRequest } from '@/types/api.types';

export function useTextUpload() {
  const mutation = useMutation({
    mutationFn: (request: UploadTextRequest) => uploadText(request),
    onSuccess: () => {
      toast.success('Data uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  return {
    upload: mutation.mutate,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '../api/uploadApi';
import { toast } from 'sonner';

export function useFileUpload() {
  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      toast.success('File uploaded successfully');
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

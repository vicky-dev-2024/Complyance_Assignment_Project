import { useState } from 'react';
import { useTextUpload } from '../hooks/useTextUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWizardStore } from '@/features/wizard/store/wizardStore';

interface TextPasteAreaProps {
  onUpload: (uploadId: string) => void;
}

export function TextPasteArea({ onUpload }: TextPasteAreaProps) {
  const [text, setText] = useState('');
  const { formData } = useWizardStore();
  const { upload, isUploading, error } = useTextUpload();

  const handleUpload = () => {
    upload(
      {
        text,
        country: formData.country!,
        erp: formData.erp!,
      },
      {
        onSuccess: (response) => {
          onUpload(response.uploadId);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-data">Paste your CSV or JSON data</Label>
        <Textarea
          id="text-data"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste CSV or JSON invoice data here..."
          className="min-h-[200px] sm:min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Supports CSV (with headers) or JSON array format
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!text.trim() || isUploading}
          className="w-full sm:min-w-[200px] sm:w-auto"
        >
          {isUploading ? 'Uploading...' : 'Upload & Continue'}
        </Button>
      </div>
    </div>
  );
}

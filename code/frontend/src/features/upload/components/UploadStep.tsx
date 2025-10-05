import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { TextPasteArea } from './TextPasteArea';
import { useWizardStore } from '@/features/wizard/store/wizardStore';
import { Button } from '@/components/ui/button';

export function UploadStep() {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const navigate = useNavigate();
  const { setUploadId, setStep } = useWizardStore();

  const handleUploadSuccess = (uploadId: string) => {
    setUploadId(uploadId);
    setStep(2);
    navigate('/wizard/results');
  };

  return (
    <div className="space-y-6">
      {/* Upload Mode Toggle */}
      <div className="flex justify-center space-x-2 border-b border-gray-200 pb-4">
        <Button
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          onClick={() => setUploadMode('file')}
          className="flex-1 max-w-xs"
        >
          Upload File
        </Button>
        <Button
          variant={uploadMode === 'text' ? 'default' : 'outline'}
          onClick={() => setUploadMode('text')}
          className="flex-1 max-w-xs"
        >
          Paste Text
        </Button>
      </div>

      {/* Upload Content */}
      {uploadMode === 'file' ? (
        <FileUpload onUpload={handleUploadSuccess} />
      ) : (
        <TextPasteArea onUpload={handleUploadSuccess} />
      )}
    </div>
  );
}

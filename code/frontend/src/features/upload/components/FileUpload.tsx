import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

interface FileUploadProps {
  onUpload: (uploadId: string) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { upload, isUploading, error } = useFileUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE,
      maxFiles: 1,
    });

  const handleUpload = () => {
    if (selectedFile) {
      upload(selectedFile, {
        onSuccess: (response) => {
          onUpload(response.uploadId);
        },
      });
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          selectedFile && 'border-green-500 bg-green-50'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {selectedFile ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  File selected
                </p>
                <p className="text-sm text-gray-500">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive
                    ? 'Drop your file here'
                    : 'Drag & drop your invoice file'}
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports CSV and JSON (max 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                File rejected
              </h3>
              <div className="text-sm text-red-700 mt-1">
                {fileRejections[0].errors.map((err) => (
                  <p key={err.code}>{err.message}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Card */}
      {selectedFile && (
        <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={undefined} className="h-2" />
          <p className="text-sm text-gray-600 text-center">
            Uploading file...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="min-w-[200px]"
        >
          {isUploading ? 'Uploading...' : 'Upload & Continue'}
        </Button>
      </div>
    </div>
  );
}

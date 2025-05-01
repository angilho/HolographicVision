import React from "react";
import { X, FileImage, FileVideo, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, isImage, isVideo } from "@/lib/hologramProcessor";

interface SelectedFilesProps {
  mediaFile: File | null;
  audioFile: File | null;
  onRemoveMedia: () => void;
  onRemoveAudio: () => void;
  onProcess: () => void;
  isProcessing: boolean;
}

const SelectedFiles: React.FC<SelectedFilesProps> = ({
  mediaFile,
  audioFile,
  onRemoveMedia,
  onRemoveAudio,
  onProcess,
  isProcessing,
}) => {
  if (!mediaFile && !audioFile) return null;

  return (
    <div className="mt-8 space-y-4">
      {/* Media Preview */}
      {mediaFile && (
        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            {isImage(mediaFile) ? (
              <FileImage className="text-primary h-5 w-5 mr-3" />
            ) : isVideo(mediaFile) ? (
              <FileVideo className="text-primary h-5 w-5 mr-3" />
            ) : (
              <FileImage className="text-primary h-5 w-5 mr-3" />
            )}
            <div>
              <p className="font-medium">{mediaFile.name}</p>
              <p className="text-xs text-gray-500">
                {isImage(mediaFile)
                  ? "Image"
                  : isVideo(mediaFile)
                    ? "Video"
                    : "File"}{" "}
                • {formatFileSize(mediaFile.size)}
              </p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-error"
            onClick={onRemoveMedia}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Audio Preview */}
      {audioFile && (
        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <FileAudio className="text-accent h-5 w-5 mr-3" />
            <div>
              <p className="font-medium">{audioFile.name}</p>
              <p className="text-xs text-gray-500">
                Audio • {formatFileSize(audioFile.size)}
              </p>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-error"
            onClick={onRemoveAudio}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Process Button */}
      {mediaFile && (
        <div className="flex justify-center mt-8">
          <Button
            className="px-8 py-6 bg-emerald-300 hover:bg-emerald-600 h-auto text-white"
            onClick={onProcess}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Process Hologram
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectedFiles;

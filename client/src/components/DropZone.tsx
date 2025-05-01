import React, { useCallback, useState } from "react";
import { CloudUpload, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SUPPORTED_IMAGE_FORMATS,
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_AUDIO_FORMATS,
  MAX_MEDIA_SIZE,
  MAX_AUDIO_SIZE,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface DropZoneProps {
  type: "media" | "audio";
  onFileSelected: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ type, onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) return;

      // Validate file type
      if (type === "media") {
        const isValidImageType = SUPPORTED_IMAGE_FORMATS.includes(file.type);
        const isValidVideoType = SUPPORTED_VIDEO_FORMATS.includes(file.type);

        if (!isValidImageType && !isValidVideoType) {
          toast({
            title: "Unsupported file format",
            description: "Please upload a JPG, PNG, or MP4 file.",
            variant: "destructive",
          });
          return;
        }

        if (file.size > MAX_MEDIA_SIZE) {
          toast({
            title: "File too large",
            description: "Media files must be less than 50MB.",
            variant: "destructive",
          });
          return;
        }
      } else if (type === "audio") {
        const isValidAudioType = SUPPORTED_AUDIO_FORMATS.includes(file.type);

        if (!isValidAudioType) {
          toast({
            title: "Unsupported audio format",
            description: "Please upload an MP3 or WAV file.",
            variant: "destructive",
          });
          return;
        }

        if (file.size > MAX_AUDIO_SIZE) {
          toast({
            title: "File too large",
            description: "Audio files must be less than 20MB.",
            variant: "destructive",
          });
          return;
        }
      }

      onFileSelected(file);
    },
    [type, onFileSelected, toast],
  );

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-200 ${
        isDragging
          ? type === "media"
            ? "border-primary bg-blue-50"
            : "border-accent bg-violet-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onClick={openFileDialog}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
        accept={
          type === "media"
            ? [...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_VIDEO_FORMATS].join(",")
            : SUPPORTED_AUDIO_FORMATS.join(",")
        }
      />

      <div className="flex flex-col items-center">
        {type === "media" ? (
          <CloudUpload className="h-16 w-16 text-gray-400 mb-4" />
        ) : (
          <Music className="h-16 w-16 text-gray-400 mb-4" />
        )}

        <h3 className="text-xl font-semibold mb-2">
          {type === "media" ? "Upload Media" : "Add Audio (Optional)"}
        </h3>
        <p className="text-gray-500 mb-4">
          Drag & drop your {type === "media" ? "image or video" : "audio file"}{" "}
          here
        </p>
        <p className="text-xs text-gray-400 mb-2">
          Supported formats:{" "}
          {type === "media" ? "JPG, PNG, GIF, MP4" : "MP3, WAV"}
        </p>
        <p className="text-xs text-gray-400">
          Max file size: {type === "media" ? "50MB" : "20MB"}
        </p>

        <Button
          className={`mt-6 ${type === "media" ? "bg-primary hover:bg-blue-600" : "bg-green-400 hover:bg-violet-600"}`}
        >
          Select {type === "media" ? "File" : "Audio"}
        </Button>
      </div>
    </div>
  );
};

export default DropZone;

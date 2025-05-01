import React, { useState, useCallback } from 'react';
import Stepper from './Stepper';
import DropZone from './DropZone';
import SelectedFiles from './SelectedFiles';
import HologramPreview from './HologramPreview';
import { useToast } from '@/hooks/use-toast';
import { processImageToHologram, processVideoToHologram, createDataUrl, isImage, isVideo } from '@/lib/hologramProcessor';
import { apiRequest } from '@/lib/queryClient';

const MediaUploader: React.FC = () => {
  // State for upload process
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'preview'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // State for selected files
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // State for processed result
  const [processedMedia, setProcessedMedia] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  
  // Handle media file selection
  const handleMediaSelect = useCallback((file: File) => {
    setMediaFile(file);
    
    // Determine media type
    if (isImage(file)) {
      setMediaType('image');
    } else if (isVideo(file)) {
      setMediaType('video');
    }
    
    // Simulate upload progress
    setUploadProgress(100);
  }, []);
  
  // Handle audio file selection
  const handleAudioSelect = useCallback((file: File) => {
    setAudioFile(file);
  }, []);
  
  // Remove selected media
  const handleRemoveMedia = useCallback(() => {
    setMediaFile(null);
    setUploadProgress(0);
  }, []);
  
  // Remove selected audio
  const handleRemoveAudio = useCallback(() => {
    setAudioFile(null);
  }, []);
  
  // Process the media into a hologram
  const processMedia = useCallback(async () => {
    if (!mediaFile) {
      toast({
        title: "No media selected",
        description: "Please select an image or video to process.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      setCurrentStep('processing');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          const newProgress = prev + (5 + Math.random() * 10);
          return newProgress >= 100 ? 99 : newProgress;
        });
      }, 300);
      
      let processedBlob: Blob;
      
      // Process based on media type
      if (isImage(mediaFile)) {
        // Pass audio file if we have one - will create a video with the image and audio
        processedBlob = await processImageToHologram(mediaFile, audioFile);
        
        // If we have audio and created a video blob, update the media type
        if (audioFile && processedBlob.type.startsWith('video/')) {
          setMediaType('video');
          console.log("Created video from image and audio");
        }
      } else if (isVideo(mediaFile)) {
        if (mediaFile.type.includes('gif')) {
          console.log("GIF 파일 처리 중:", mediaFile.name);
          toast({
            title: "GIF 파일 감지됨",
            description: "GIF 애니메이션을 유지한 홀로그램을 만듭니다",
            duration: 5000,
          });
          
          try {
            // HTML 직접 사용 방식으로 GIF 처리 - 애니메이션 유지 (오디오 포함)
            processedBlob = await processVideoToHologram(mediaFile, audioFile);
            
            // HTML로 변환되므로 직접 HTML 타입으로 설정
            setMediaType('image');
            console.log("GIF를 HTML로 변환 완료");
            
            // 사용자에게 성공 알림 (오디오 유무에 따라 다른 메시지)
            if (audioFile) {
              toast({
                title: "GIF 및 오디오 처리 완료",
                description: "애니메이션 홀로그램에 오디오가 추가되었습니다",
                variant: "default",
              });
            } else {
              toast({
                title: "GIF 처리 완료",
                description: "애니메이션이 유지된 홀로그램이 생성되었습니다",
                variant: "default",
              });
            }
          } catch (error) {
            console.error("GIF 처리 오류:", error);
            toast({
              title: "GIF 처리 중 오류 발생",
              description: "다른 GIF 파일을 사용해보거나 일반 이미지로 시도해주세요",
              variant: "destructive",
              duration: 5000,
            });
            throw error;
          }
        } else {
          processedBlob = await processVideoToHologram(mediaFile);
        }
      } else {
        throw new Error('Unsupported media type');
      }
      
      // Convert to data URL for preview
      const dataUrl = await createDataUrl(processedBlob);
      setProcessedMedia(dataUrl);
      
      // Optional: Upload to server for storage
      if (audioFile) {
        const formData = new FormData();
        formData.append('media', processedBlob);
        formData.append('audio', audioFile);
        
        // This would typically send the files to the server
        // await apiRequest('POST', '/api/hologram', formData);
      }
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // Move to preview step
      setTimeout(() => {
        setCurrentStep('preview');
        setIsProcessing(false);
      }, 500);
      
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setCurrentStep('upload');
      setIsProcessing(false);
    }
  }, [mediaFile, audioFile, toast]);
  
  // Reset to create a new hologram
  const handleCreateNew = useCallback(() => {
    setMediaFile(null);
    setAudioFile(null);
    setProcessedMedia('');
    setUploadProgress(0);
    setProcessingProgress(0);
    setCurrentStep('upload');
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-10">
      {/* Stepper Component */}
      <Stepper currentStep={currentStep} uploadProgress={uploadProgress} />
      
      {/* Upload Tab Content */}
      {currentStep === 'upload' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Media Upload Section */}
            <DropZone type="media" onFileSelected={handleMediaSelect} />
            
            {/* Audio Upload Section */}
            <DropZone type="audio" onFileSelected={handleAudioSelect} />
          </div>
          
          {/* Selected Files Preview */}
          <SelectedFiles 
            mediaFile={mediaFile}
            audioFile={audioFile}
            onRemoveMedia={handleRemoveMedia}
            onRemoveAudio={handleRemoveAudio}
            onProcess={processMedia}
            isProcessing={isProcessing}
          />
        </div>
      )}
      
      {/* Processing Tab Content */}
      {currentStep === 'processing' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 rounded-full border-4 border-secondary border-t-transparent animate-spin mb-6"></div>
          <h3 className="text-xl font-semibold mb-2">Processing Your Hologram</h3>
          <p className="text-gray-500 mb-6">This may take a few moments...</p>
          <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-secondary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">Creating 4-quadrant projection...</p>
        </div>
      )}
      
      {/* Preview Tab Content */}
      {currentStep === 'preview' && processedMedia && (
        <HologramPreview
          processedMedia={processedMedia}
          mediaType={mediaType}
          audioFile={audioFile}
          onCreateNew={handleCreateNew}
        />
      )}
    </div>
  );
};

export default MediaUploader;

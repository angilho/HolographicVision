import React from 'react';
import { Upload, Cog, Eye } from 'lucide-react';

interface StepperProps {
  currentStep: 'upload' | 'processing' | 'preview';
  uploadProgress: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, uploadProgress }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-3xl">
        {/* Upload Step */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep === 'upload' || currentStep === 'processing' || currentStep === 'preview' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium mt-2">Upload</span>
        </div>

        {/* Progress Line to Processing */}
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ 
              width: currentStep === 'upload' 
                ? `${uploadProgress}%` 
                : '100%' 
            }}
          />
        </div>

        {/* Processing Step */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep === 'processing' || currentStep === 'preview' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Cog className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium mt-2">Process</span>
        </div>

        {/* Progress Line to Preview */}
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ 
              width: currentStep === 'preview' ? '100%' : '0%' 
            }}
          />
        </div>

        {/* Preview Step */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep === 'preview' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Eye className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium mt-2">Preview</span>
        </div>
      </div>
    </div>
  );
};

export default Stepper;

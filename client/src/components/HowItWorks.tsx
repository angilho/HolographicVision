import React from 'react';
import { Upload, Cog, Eye } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <section className="mb-10" id="how-it-works">
      <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">1. Upload Media</h3>
          <p className="text-gray-600">Upload your image or video file. You can also add audio to enhance your hologram.</p>
        </div>
        
        {/* Step 2 */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cog className="text-secondary h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">2. Process</h3>
          <p className="text-gray-600">Our system automatically creates a 4-quadrant hologram projection from your media.</p>
        </div>
        
        {/* Step 3 */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="text-accent h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">3. Project & Enjoy</h3>
          <p className="text-gray-600">Download your hologram, create a simple pyramid viewer, and watch your content come to life.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

const PyramidInstructions: React.FC = () => {
  const downloadTemplate = () => {
    window.open('/pyramid-template.svg', '_blank');
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-10">
      <h2 className="text-2xl font-bold mb-4">Create Your Hologram Viewer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <ol className="space-y-4 list-decimal pl-6">
            <li className="text-gray-700">
              <span className="font-medium">Download the pyramid template</span>
              <p className="text-gray-600 text-sm mt-1">Print the template on thick transparent plastic sheet or use it as a guide to cut clear plastic.</p>
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Cut along the solid lines</span>
              <p className="text-gray-600 text-sm mt-1">Carefully cut out the template shape to create the pyramid sides.</p>
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Fold along the dotted lines</span>
              <p className="text-gray-600 text-sm mt-1">Create a pyramid shape by folding the template and secure edges with clear tape.</p>
            </li>
            <li className="text-gray-700">
              <span className="font-medium">Place on your device</span>
              <p className="text-gray-600 text-sm mt-1">Put the pyramid on top of your device with the hologram video playing for a stunning 3D effect.</p>
            </li>
          </ol>
          
          <Button 
            className="mt-6 px-6 py-3 bg-primary hover:bg-blue-600 h-auto"
            onClick={downloadTemplate}
          >
            <FileDown className="mr-2 h-4 w-4" />
            <span>Download Pyramid Template</span>
          </Button>
        </div>
        
        <div className="flex justify-center">
          <svg
            width="100%"
            height="auto"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            className="rounded-lg shadow-lg max-w-full"
          >
            {/* Pyramid diagram */}
            <rect x="0" y="0" width="400" height="400" fill="#f8f9fa" />
            
            {/* Smartphone base */}
            <rect x="100" y="250" width="200" height="40" rx="5" fill="#333" />
            <rect x="110" y="180" width="180" height="70" rx="2" fill="#666" />
            <rect x="115" y="185" width="170" height="60" fill="#111" />
            
            {/* Hologram display on phone */}
            <rect x="125" y="195" width="150" height="40" fill="#0066ff" opacity="0.7" />
            <line x1="200" y1="195" x2="200" y2="235" stroke="#fff" strokeWidth="1" />
            <line x1="125" y1="215" x2="275" y2="215" stroke="#fff" strokeWidth="1" />
            
            {/* Pyramid */}
            <polygon points="140,195 260,195 200,100" fill="rgba(173, 216, 230, 0.5)" stroke="#2c91ea" strokeWidth="1" />
            <polygon points="140,195 200,100 200,195" fill="rgba(173, 216, 230, 0.3)" stroke="#2c91ea" strokeWidth="1" />
            <polygon points="200,195 260,195 200,100" fill="rgba(173, 216, 230, 0.4)" stroke="#2c91ea" strokeWidth="1" />
            
            {/* Hologram effect */}
            <circle cx="200" cy="150" r="15" fill="#0066ff" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            
            {/* Labels */}
            <text x="200" y="310" textAnchor="middle" fill="#333" fontFamily="Arial" fontSize="14" fontWeight="bold">Smartphone Display</text>
            <text x="200" y="80" textAnchor="middle" fill="#333" fontFamily="Arial" fontSize="14" fontWeight="bold">Hologram Pyramid</text>
            <text x="200" y="330" textAnchor="middle" fill="#666" fontFamily="Arial" fontSize="12">Place the pyramid on your device screen</text>
            <text x="200" y="350" textAnchor="middle" fill="#666" fontFamily="Arial" fontSize="12">with the hologram video playing</text>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default PyramidInstructions;

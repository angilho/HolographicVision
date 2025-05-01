import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IntroSection from '@/components/IntroSection';
import MediaUploader from '@/components/MediaUploader';
import HowItWorks from '@/components/HowItWorks';
import PyramidInstructions from '@/components/PyramidInstructions';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <IntroSection />
        <MediaUploader />
        <HowItWorks />
        <PyramidInstructions />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;

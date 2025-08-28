import React from 'react';
import { VideoIcon } from './icons/VideoIcon';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-700/50">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-gray-800 rounded-full">
            <VideoIcon className="h-10 w-10 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Generator Video Veo</h1>
          <p className="text-sm text-gray-400">Hidupkan teks dan gambar Anda dengan model video generatif dari Google.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      <video
        key={videoUrl}
        src={videoUrl}
        controls
        autoPlay
        loop
        className="w-full h-full object-contain"
      >
        Browser Anda tidak mendukung tag video.
      </video>
    </div>
  );
};

export default VideoPlayer;
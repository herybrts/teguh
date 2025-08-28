
import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
    const [dynamicMessage, setDynamicMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % LOADING_MESSAGES.length;
            setDynamicMessage(LOADING_MESSAGES[index]);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-800/50 rounded-lg">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="mt-6 text-lg font-semibold text-gray-200">{message}</p>
      <p className="mt-2 text-sm text-gray-400 transition-opacity duration-500 h-10 flex items-center">{dynamicMessage}</p>
    </div>
  );
};

export default LoadingIndicator;

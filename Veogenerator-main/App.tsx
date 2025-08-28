import React, { useState, useCallback } from 'react';
import { VeoModel, AspectRatio } from './types';
import { generateVideo } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingIndicator from './components/LoadingIndicator';
import VideoPlayer from './components/VideoPlayer';
import Footer from './components/Footer';
import { VideoIcon } from './components/icons/VideoIcon';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<VeoModel>(VeoModel.VEO_2);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [prompt, setPrompt] = useState<string>('');
    const [referenceImage, setReferenceImage] = useState<{ base64: string; mimeType: string } | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageSelect = (base64: string | null, mimeType: string | null) => {
        if (base64 && mimeType) {
            setReferenceImage({ base64, mimeType });
        } else {
            setReferenceImage(null);
        }
    };

    const handleGenerateClick = useCallback(async () => {
        if (!prompt.trim() || !apiKey.trim() || isLoading) return;

        setError(null);
        setIsLoading(true);
        setGeneratedVideoUrl(null);

        try {
            const videoUrl = await generateVideo({
                model: selectedModel,
                prompt,
                aspectRatio: selectedModel === VeoModel.VEO_2 ? aspectRatio : null,
                image: referenceImage ? { imageBytes: referenceImage.base64, mimeType: referenceImage.mimeType } : undefined
            }, apiKey, setLoadingMessage);
            setGeneratedVideoUrl(videoUrl);
        } catch (e: any) {
            let userFriendlyError = "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.";
            try {
                const parsedError = JSON.parse(e.message);
                if (parsedError?.error?.message) {
                    if (parsedError.error.code === 429) {
                        userFriendlyError = "Batas kuota API terlampaui. Silakan periksa paket dan detail penagihan Anda, atau coba lagi nanti.";
                    } else {
                        userFriendlyError = `Terjadi kesalahan API: ${parsedError.error.message}`;
                    }
                } else {
                    userFriendlyError = e.message;
                }
            } catch (jsonParseError) {
                // Pesan kesalahan bukan JSON, gunakan secara langsung.
                userFriendlyError = e.message || userFriendlyError;
            }
            setError(userFriendlyError);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [prompt, isLoading, selectedModel, aspectRatio, referenceImage, apiKey]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Controls Panel */}
                    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Pengaturan Generasi</h2>
                        
                        <div className="mb-4">
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">Google AI API Key</label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Masukkan kunci API Anda di sini"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                            <div className="flex space-x-2">
                                {(Object.keys(VeoModel) as Array<keyof typeof VeoModel>).map((key) => (
                                    <button 
                                        key={VeoModel[key]}
                                        onClick={() => setSelectedModel(VeoModel[key])}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${selectedModel === VeoModel[key] ? 'bg-cyan-500 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    >
                                        {key.replace('_', ' ')}
                                        {VeoModel[key] === VeoModel.VEO_3 && <span className="text-xs opacity-70"> (Eksperimental)</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedModel === VeoModel.VEO_2 && (
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Rasio Aspek</label>
                                <div className="flex space-x-2">
                                    {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                                         <button 
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${aspectRatio === ratio ? 'bg-cyan-500 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                            <textarea
                                id="prompt"
                                rows={5}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="contoh, Hologram neon seekor kucing mengemudi dengan kecepatan tinggi"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            />
                        </div>

                        <ImageUploader onImageSelect={handleImageSelect} />

                        <div className="mt-6">
                            <button
                                onClick={handleGenerateClick}
                                disabled={!prompt.trim() || !apiKey.trim() || isLoading}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                            >
                                {isLoading ? 'Menghasilkan...' : 'Hasilkan Video'}
                            </button>
                        </div>
                    </div>

                    {/* Display Area */}
                    <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-center min-h-[400px]">
                        {error && (
                             <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                                <h3 className="font-bold text-lg">Terjadi Kesalahan</h3>
                                <p className="text-sm">{error}</p>
                             </div>
                        )}
                        {!error && isLoading && <LoadingIndicator message={loadingMessage} />}
                        {!error && !isLoading && generatedVideoUrl && <VideoPlayer videoUrl={generatedVideoUrl} />}
                        {!error && !isLoading && !generatedVideoUrl && (
                            <div className="text-center text-gray-500">
                                <VideoIcon className="h-24 w-24 mx-auto mb-4" />
                                <p>Video yang Anda hasilkan akan muncul di sini.</p>
                                <p className="text-sm">Masukkan kunci API Anda, konfigurasikan pengaturan, dan klik "Hasilkan Video" untuk memulai.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
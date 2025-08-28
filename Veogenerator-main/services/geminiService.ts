import { GoogleGenAI } from "@google/genai";
import type { GenerateVideoParams } from '../types';

// Helper function to wait for a specific duration
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries a function that returns a promise.
 * @param fn The function to retry.
 * @param retries Maximum number of retries.
 * @param delay Initial delay between retries in ms.
 * @param backoff Multiplier for the delay.
 */
const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1500,
  backoff = 2
): Promise<T> => {
  let lastError: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Periksa kesalahan yang tidak dapat dicoba ulang seperti kehabisan kuota
      try {
        const apiError = JSON.parse(error.message);
        if (apiError?.error?.code === 429) {
          // Ini adalah kesalahan kuota, jangan coba lagi. Lempar ulang segera.
          throw lastError;
        }
      } catch (e) {
        // Bukan pesan kesalahan JSON, mungkin kesalahan jaringan, jadi kita bisa mencoba lagi.
      }

      if (i < retries - 1) {
          console.error(`Percobaan ke-${i + 1} gagal: ${error.message}. Mencoba lagi dalam ${delay / 1000} detik...`);
          await sleep(delay);
          delay *= backoff;
      }
    }
  }
  throw lastError || new Error("Semua percobaan ulang gagal.");
};

export const generateVideo = async (
  params: GenerateVideoParams,
  apiKey: string,
  onProgress: (message: string) => void
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Kunci API diperlukan. Harap masukkan kunci API Anda.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const requestPayload: any = {
    model: params.model,
    prompt: params.prompt,
    config: {
      numberOfVideos: 1,
    },
  };

  if (params.image) {
    requestPayload.image = params.image;
  }
  
  if (params.model === 'veo-2.0-generate-001' && params.aspectRatio) {
      requestPayload.config.aspectRatio = params.aspectRatio;
  }

  onProgress("Mengirim permintaan pembuatan video ke Google AI...");
  const operation = await retry(() => ai.models.generateVideos(requestPayload));
  onProgress("Pembuatan video dimulai. Memeriksa hasil...");
  
  let pollCount = 0;
  let currentOperation = operation;
  while (!currentOperation.done) {
    onProgress(`Memeriksa status... (Percobaan ke-${++pollCount})`);
    await sleep(10000); // Wait 10 seconds between polls
    try {
        currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
    } catch (e) {
        console.error("Polling gagal, mencoba lagi pada siklus berikutnya...", e);
        // Continue polling, as this might be a transient network issue.
    }
  }

  if (currentOperation.error) {
    throw new Error(`Pembuatan video gagal: ${currentOperation.error.message}`);
  }

  onProgress("Pemrosesan video selesai! Mengunduh...");

  const downloadLink = currentOperation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Tidak dapat mengambil tautan unduhan video dari respons operasi.");
  }

  const videoResponse = await retry(async () => {
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Gagal mengunduh file video. Status: ${response.status} ${response.statusText}`);
    }
    return response;
  });

  const videoBlob = await videoResponse.blob();
  onProgress("Unduhan selesai. Menyiapkan video untuk diputar.");
  return URL.createObjectURL(videoBlob);
};
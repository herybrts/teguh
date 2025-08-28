
export enum VeoModel {
  VEO_2 = 'veo-2.0-generate-001',
  VEO_3 = 'veo-3.0-generate-001', // Hypothetical model name for UI purposes
}

export type AspectRatio = '16:9' | '9:16';

export interface GenerateVideoParams {
  model: VeoModel;
  prompt: string;
  aspectRatio: AspectRatio | null;
  image?: {
    imageBytes: string;
    mimeType: string;
  };
}

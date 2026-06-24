import * as faceapi from 'face-api.js';
import { Canvas, Image, loadImage } from 'canvas';
import path from 'path';
import { env } from '../config/env';

// Patch face-api.js to use node-canvas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(faceapi as any).env.monkeyPatch({ Canvas, Image });

export interface FaceDetectionResult {
  faceCount: number;
  largestFaceAreaPercent: number;
}

export class FaceDetectionService {
  private modelsLoaded = false;

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    const modelsPath = path.join(process.cwd(), 'models');
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    } catch {
      const altPath = path.join(
        process.cwd(),
        'node_modules',
        'face-api.js',
        'weights',
      );
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(altPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(altPath);
    }
    this.modelsLoaded = true;
  }

  async detectFaces(imageBuffer: Buffer): Promise<FaceDetectionResult> {
    await this.loadModels();

    const img = await loadImage(imageBuffer);
    const canvas = new Canvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const detections = await faceapi
      .detectAllFaces(canvas as unknown as faceapi.TNetInput)
      .withFaceLandmarks();

    const imageArea = img.width * img.height;
    let largestFaceArea = 0;

    for (const detection of detections) {
      const box = detection.detection.box;
      const faceArea = box.width * box.height;
      if (faceArea > largestFaceArea) {
        largestFaceArea = faceArea;
      }
    }

    const largestFaceAreaPercent = (largestFaceArea / imageArea) * 100;

    return {
      faceCount: detections.length,
      largestFaceAreaPercent,
    };
  }

  async validateFace(imageBuffer: Buffer): Promise<{
    valid: boolean;
    faceCount: number;
    largestFaceAreaPercent: number;
  }> {
    const result = await this.detectFaces(imageBuffer);
    const minArea = env.faceMinAreaPercent;

    return {
      ...result,
      valid:
        result.faceCount === 1 && result.largestFaceAreaPercent >= minArea,
    };
  }
}

export const faceDetectionService = new FaceDetectionService();

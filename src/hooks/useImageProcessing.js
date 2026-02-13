import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

export const useImageProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const processImage = useCallback(async (file, operations) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      let result = file;
      let currentProgress = 0;

      // Load image
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      currentProgress += 20;
      setProgress(currentProgress);

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Apply operations
      if (operations.resize) {
        const { width, height } = operations.resize;
        canvas.width = width || img.width;
        canvas.height = height || img.height;
        currentProgress += 30;
        setProgress(currentProgress);
      }

      if (operations.background) {
        ctx.fillStyle = operations.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        currentProgress += 20;
        setProgress(currentProgress);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (operations.filter) {
        // Apply image filters
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        switch (operations.filter) {
          case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            break;
          case 'sepia':
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
              data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
              data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            break;
          case 'invert':
            for (let i = 0; i < data.length; i += 4) {
              data[i] = 255 - data[i];
              data[i + 1] = 255 - data[i + 1];
              data[i + 2] = 255 - data[i + 2];
            }
            break;
        }

        ctx.putImageData(imageData, 0, 0);
        currentProgress += 20;
        setProgress(currentProgress);
      }

      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, operations.format || 'image/png', operations.quality || 0.92);
      });

      setProgress(100);
      setIsProcessing(false);
      addToast('Image processed successfully!', 'success');
      
      return { success: true, blob, dimensions: { width: canvas.width, height: canvas.height } };
    } catch (err) {
      console.error('Image processing failed:', err);
      setError(err.message);
      setIsProcessing(false);
      addToast('Failed to process image.', 'error');
      return { success: false, error: err.message };
    }
  }, [addToast]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    isProcessing,
    progress,
    error,
    processImage,
    reset
  };
};
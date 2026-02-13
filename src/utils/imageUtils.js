
/**
 * Utility functions for image processing
 */

/**
 * Convert image file to base64 string
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Compress image with quality control
 * @param {File} file - Image file
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = async (file, quality = 0.8) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  return new Promise((resolve) => {
    canvas.toBlob(resolve, file.type, quality);
  });
};

/**
 * Resize image to specific dimensions
 * @param {File} file - Image file
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {Promise<Blob>} Resized image blob
 */
export const resizeImage = async (file, width, height) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width || img.width;
  canvas.height = height || img.height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return new Promise((resolve) => {
    canvas.toBlob(resolve, file.type);
  });
};

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
  });
};

/**
 * Apply filter to image
 * @param {File} file - Image file
 * @param {string} filter - Filter type
 * @returns {Promise<Blob>} Filtered image blob
 */
export const applyFilter = async (file, filter) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  switch (filter) {
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
    case 'brightness':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2);
        data[i + 1] = Math.min(255, data[i + 1] * 1.2);
        data[i + 2] = Math.min(255, data[i + 2] * 1.2);
      }
      break;
    case 'contrast':
      const factor = 1.5;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, ((data[i] - 128) * factor) + 128);
        data[i + 1] = Math.min(255, ((data[i + 1] - 128) * factor) + 128);
        data[i + 2] = Math.min(255, ((data[i + 2] - 128) * factor) + 128);
      }
      break;
  }

  ctx.putImageData(imageData, 0, 0);
  
  return new Promise((resolve) => {
    canvas.toBlob(resolve, file.type);
  });
};
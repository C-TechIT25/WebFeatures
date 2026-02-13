/**
 * Application constants
 */

// Supported image formats
export const IMAGE_FORMATS = [
  { 
    value: 'image/png', 
    label: 'PNG', 
    ext: 'png', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Lossless, best for graphics with transparency'
  },
  { 
    value: 'image/jpeg', 
    label: 'JPG', 
    ext: 'jpg', 
    supportsQuality: true,
    supportsTransparency: false,
    description: 'Lossy, best for photographs'
  },
  { 
    value: 'image/webp', 
    label: 'WEBP', 
    ext: 'webp', 
    supportsQuality: true,
    supportsTransparency: true,
    description: 'Modern format, good compression'
  },
  { 
    value: 'image/bmp', 
    label: 'BMP', 
    ext: 'bmp', 
    supportsQuality: false,
    supportsTransparency: false,
    description: 'Uncompressed, large file size'
  },
  { 
    value: 'image/gif', 
    label: 'GIF', 
    ext: 'gif', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Supports animation, limited colors'
  },
  { 
    value: 'image/x-icon', 
    label: 'ICO', 
    ext: 'ico', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Icon format for favicons'
  },
  { 
    value: 'image/svg+xml', 
    label: 'SVG', 
    ext: 'svg', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Vector format, scalable'
  }
];

// File size limits
export const FILE_SIZE_LIMITS = {
  image: 20 * 1024 * 1024, // 20MB
  pdf: 50 * 1024 * 1024,    // 50MB
  total: 100 * 1024 * 1024  // 100MB
};

// PDF export settings
export const PDF_SETTINGS = {
  defaultScale: 1.0,
  minScale: 0.5,
  maxScale: 2.5,
  stepScale: 0.1
};

// Animation durations
export const ANIMATION = {
  pageTransition: 0.3,
  modalTransition: 0.2,
  hoverScale: 1.02,
  tapScale: 0.98
};

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'webFeatures_theme',
  user: 'webFeatures_user',
  preferences: 'webFeatures_preferences',
  history: 'webFeatures_history'
};

// Toast notification durations
export const TOAST_DURATION = {
  short: 2000,
  medium: 4000,
  long: 6000,
  infinite: Infinity
};

// Color presets
export const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6b7280'  // Gray
];

// Font families
export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier',
  'Verdana',
  'Georgia',
  'Palatino',
  'Garamond',
  'Comic Sans MS',
  'Trebuchet MS'
];

// Font sizes
export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
];
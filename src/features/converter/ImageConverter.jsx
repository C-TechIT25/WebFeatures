import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Fade,
  Zoom,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  TextField  // ← Add this import!
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Compare as CompareIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PhotoSizeSelectActual as PhotoSizeIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';  // ← Add motion import!
import { saveAs } from 'file-saver';
import { HexColorPicker } from 'react-colorful';

import FileUploader from '../../components/FileUploader/FileUploader';
import { useToast } from '../../context/ToastContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
// Supported formats with metadata
const FORMATS = [
  { 
    value: 'image/png', 
    label: 'PNG', 
    ext: 'png', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Lossless, best for graphics with transparency',
    mime: 'image/png'
  },
  { 
    value: 'image/jpeg', 
    label: 'JPG', 
    ext: 'jpg', 
    supportsQuality: true,
    supportsTransparency: false,
    description: 'Lossy, best for photographs',
    mime: 'image/jpeg'
  },
  { 
    value: 'image/webp', 
    label: 'WEBP', 
    ext: 'webp', 
    supportsQuality: true,
    supportsTransparency: true,
    description: 'Modern format, good compression',
    mime: 'image/webp'
  },
  { 
    value: 'image/bmp', 
    label: 'BMP', 
    ext: 'bmp', 
    supportsQuality: false,
    supportsTransparency: false,
    description: 'Uncompressed, large file size',
    mime: 'image/bmp'
  },
  { 
    value: 'image/gif', 
    label: 'GIF', 
    ext: 'gif', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Supports animation, limited colors',
    mime: 'image/gif'
  },
  { 
    value: 'image/x-icon', 
    label: 'ICO', 
    ext: 'ico', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Icon format for favicons',
    mime: 'image/x-icon'
  },
  { 
    value: 'image/svg+xml', 
    label: 'SVG', 
    ext: 'svg', 
    supportsQuality: false,
    supportsTransparency: true,
    description: 'Vector format, scalable',
    mime: 'image/svg+xml'
  }
];

const PreviewContainer = styled(Paper)(({ theme, isFullscreen }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  minHeight: isFullscreen ? '100vh' : 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  ...(isFullscreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    borderRadius: 0,
  }),
}));

const StyledImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  transition: 'all 0.3s ease',
});

const ImageConverter = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useLocalStorage('converter-format', 'image/png');
  const [quality, setQuality] = useLocalStorage('converter-quality', 0.92);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImage, setConvertedImage] = useState(null);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [resize, setResize] = useState(false);
  const [resizeDimensions, setResizeDimensions] = useState({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  
  const { addToast } = useToast();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (convertedImage) URL.revokeObjectURL(convertedImage);
    };
  }, []);

  const handleFileSelect = (selected) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
    setConvertedImage(null);
    setError(null);
    
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setResizeDimensions({ width: img.width, height: img.height });
    };
  };

  const handleConvert = async () => {
    if (!file || !preview) return;
    setIsConverting(true);
    setError(null);

    try {
      const img = new Image();
      img.src = preview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Handle resize
      if (resize) {
        width = resizeDimensions.width || img.width;
        height = resizeDimensions.height || img.height;
        
        if (maintainAspectRatio) {
          const ratio = Math.min(width / img.width, height / img.height);
          width = img.width * ratio;
          height = img.height * ratio;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Handle background color for formats without transparency
      if (!FORMATS.find(f => f.value === format)?.supportsTransparency) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Special handling for ICO format
      if (format === 'image/x-icon') {
        canvas.width = 256;
        canvas.height = 256;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          setConvertedImage(blob);
          addToast(`Converted to ${FORMATS.find(f => f.value === format)?.label} successfully!`, 'success');
        } else {
          throw new Error('Conversion failed');
        }
        setIsConverting(false);
      }, format, quality);

    } catch (err) {
      console.error('Conversion failed:', err);
      setError('Failed to convert image. Please try again.');
      addToast('Failed to convert image.', 'error');
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedImage) {
      const formatInfo = FORMATS.find(f => f.value === format);
      const extension = formatInfo?.ext || format.split('/')[1];
      const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
      saveAs(convertedImage, `${originalName}-converted.${extension}`);
      addToast('Download started!', 'success');
    }
  };

  const handleCopyToClipboard = async () => {
    if (convertedImage) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [convertedImage.type]: convertedImage
          })
        ]);
        addToast('Image copied to clipboard!', 'success');
      } catch (err) {
        addToast('Failed to copy image', 'error');
      }
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setConvertedImage(null);
    setError(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Badge
            badgeContent="AI"
            color="secondary"
            sx={{ mb: 2 }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mx: 'auto'
              }}
            >
              <ImageIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Badge>
          
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Image Format Converter
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Transform your images to any format instantly. Support for PNG, JPG, WEBP, ICO, and more.
          </Typography>
          
          <Chip
            label="100% Client-side Processing"
            icon={<CheckCircleIcon />}
            color="success"
            sx={{ mr: 1 }}
          />
          <Chip
            label="No Upload Required"
            icon={<CloudUploadIcon />}
            color="info"
          />
        </Box>

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FileUploader
                onFileSelect={handleFileSelect}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.ico']
                }}
                title="Drop your image to convert"
                subtitle="Supports all major image formats"
              />
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Grid container spacing={3}>
                {/* Left Column - Preview */}
                <Grid item xs={12} md={7}>
                  <PreviewContainer isFullscreen={isFullscreen}>
                    <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                      <Tooltip title="Toggle Fullscreen">
                        <IconButton 
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                        >
                          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                      <ButtonGroup variant="contained" size="small">
                        <Button
                          variant={!showOriginal ? 'contained' : 'outlined'}
                          onClick={() => setShowOriginal(false)}
                        >
                          Converted
                        </Button>
                        <Button
                          variant={showOriginal ? 'contained' : 'outlined'}
                          onClick={() => setShowOriginal(true)}
                        >
                          Original
                        </Button>
                      </ButtonGroup>
                    </Box>

                    <Fade in timeout={300}>
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isConverting ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <LinearProgress sx={{ width: 200, mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              Converting image...
                            </Typography>
                          </Box>
                        ) : (
                          <StyledImage
                            src={showOriginal ? preview : (convertedImage ? URL.createObjectURL(convertedImage) : preview)}
                            alt="Preview"
                            sx={{
                              filter: isConverting ? 'blur(4px)' : 'none',
                            }}
                          />
                        )}
                      </Box>
                    </Fade>

                    {dimensions.width > 0 && (
                      <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10 }}>
                        <Chip
                          icon={<PhotoSizeIcon />}
                          label={`${dimensions.width} × ${dimensions.height}`}
                          size="small"
                          sx={{ bgcolor: 'background.paper' }}
                        />
                      </Box>
                    )}
                  </PreviewContainer>
                </Grid>

                {/* Right Column - Controls */}
                <Grid item xs={12} md={5}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      height: '100%',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Conversion Settings
                      </Typography>
                      <IconButton onClick={reset} size="small">
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    {/* File Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                        <ImageIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Format Selection */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Output Format</InputLabel>
                      <Select
                        value={format}
                        label="Output Format"
                        onChange={(e) => setFormat(e.target.value)}
                      >
                        {FORMATS.map((fmt) => (
                          <MenuItem key={fmt.value} value={fmt.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{fmt.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                (.{fmt.ext})
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        {FORMATS.find(f => f.value === format)?.description}
                      </Typography>
                    </FormControl>

                    {/* Quality Slider */}
                    {FORMATS.find(f => f.value === format)?.supportsQuality && (
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Quality</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {Math.round(quality * 100)}%
                          </Typography>
                        </Box>
                        <Slider
                          value={quality}
                          onChange={(e, val) => setQuality(val)}
                          min={0.1}
                          max={1}
                          step={0.01}
                          sx={{
                            '& .MuiSlider-thumb': {
                              width: 20,
                              height: 20,
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* Background Color (for formats without transparency) */}
                    {!FORMATS.find(f => f.value === format)?.supportsTransparency && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                          Background Color
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              bgcolor: backgroundColor,
                              border: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer'
                            }}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {backgroundColor}
                          </Typography>
                        </Box>
                        {showAdvanced && (
                          <Box sx={{ mt: 2 }}>
                            <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Resize Options */}
                    <Box sx={{ mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={resize}
                            onChange={(e) => setResize(e.target.checked)}
                          />
                        }
                        label="Resize Image"
                      />
                      
                      {resize && (
                        <Box sx={{ mt: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField
                                size="small"
                                label="Width"
                                type="number"
                                value={resizeDimensions.width}
                                onChange={(e) => {
                                  const newWidth = parseInt(e.target.value) || 0;
                                  setResizeDimensions({
                                    width: newWidth,
                                    height: maintainAspectRatio && dimensions.width
                                      ? Math.round((newWidth * dimensions.height) / dimensions.width)
                                      : resizeDimensions.height
                                  });
                                }}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                size="small"
                                label="Height"
                                type="number"
                                value={resizeDimensions.height}
                                onChange={(e) => {
                                  const newHeight = parseInt(e.target.value) || 0;
                                  setResizeDimensions({
                                    ...resizeDimensions,
                                    height: newHeight,
                                    width: maintainAspectRatio && dimensions.height
                                      ? Math.round((newHeight * dimensions.width) / dimensions.height)
                                      : resizeDimensions.width
                                  });
                                }}
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={maintainAspectRatio}
                                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                              />
                            }
                            label="Maintain aspect ratio"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Error Display */}
                    {error && (
                      <Alert 
                        severity="error" 
                        sx={{ mb: 3 }}
                        onClose={() => setError(null)}
                      >
                        <AlertTitle>Conversion Failed</AlertTitle>
                        {error}
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ mt: 4 }}>
                      {!convertedImage ? (
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          onClick={handleConvert}
                          disabled={isConverting}
                          startIcon={isConverting ? <RefreshIcon spin /> : <CloudUploadIcon />}
                          sx={{
                            py: 1.5,
                            background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                            }
                          }}
                        >
                          {isConverting ? 'Converting...' : 'Convert Image'}
                        </Button>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleDownload}
                            startIcon={<DownloadIcon />}
                            sx={{
                              py: 1.5,
                              bgcolor: 'success.main',
                              '&:hover': {
                                bgcolor: 'success.dark',
                              }
                            }}
                          >
                            Download
                          </Button>
                          <Tooltip title="Copy to clipboard">
                            <Button
                              variant="outlined"
                              onClick={handleCopyToClipboard}
                              sx={{ minWidth: 56 }}
                            >
                              <ContentCopyIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Convert another">
                            <Button
                              variant="outlined"
                              onClick={() => setConvertedImage(null)}
                              sx={{ minWidth: 56 }}
                            >
                              <RefreshIcon />
                            </Button>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>

                    {/* Tips */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
                        <InfoIcon fontSize="small" />
                        Tip: PNG for transparency, JPG for photos, WEBP for best compression
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};

export default ImageConverter;
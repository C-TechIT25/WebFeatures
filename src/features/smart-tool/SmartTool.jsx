import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Slider,
  Chip,
  Divider,
  Avatar,
  Alert,
  AlertTitle,
  LinearProgress,
  Fade,
  Zoom,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Collapse,
  IconButton,
  Tooltip,
  Badge,
  Checkbox
} from '@mui/material';
import {
  AutoFixHigh as AutoFixHighIcon,
  ContentCut as ScissorsIcon,
  SwapHoriz as SwapIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Compress as CompressIcon,
  AspectRatio as AspectRatioIcon,
  Crop as CropIcon,
  RotateRight as RotateIcon,
  Flip as FlipIcon,
  Tune as TuneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
  PhotoSizeSelectLarge as SizeIcon,
  Speed as SpeedIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import { removeBackground } from '@imgly/background-removal';

import FileUploader from '../../components/FileUploader/FileUploader';
import { useToast } from '../../context/ToastContext';

const steps = [
  {
    label: 'Upload Image',
    description: 'Select an image to process',
  },
  {
    label: 'Choose Operations',
    description: 'Select what you want to do with your image',
  },
  {
    label: 'Configure Settings',
    description: 'Adjust the settings for each operation',
  },
  {
    label: 'Process & Download',
    description: 'Apply operations and download your result',
  },
];

const PreviewContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  minHeight: 300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const ImageStats = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  left: 16,
  right: 16,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(4px)',
  borderRadius: theme.shape.borderRadius,
  color: 'white',
}));

const SmartTool = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [operations, setOperations] = useState({
    removeBg: false,
    convert: false,
    compress: false,
    resize: false,
    rotate: false
  });
  
  // Format conversion settings
  const [format, setFormat] = useState('image/png');
  const [quality, setQuality] = useState(0.92);
  
  // Compression settings
  const [compressionLevel, setCompressionLevel] = useState(0.7);
  const [maintainQuality, setMaintainQuality] = useState(true);
  const [targetSize, setTargetSize] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  
  // Resize settings
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  
  // Rotate settings
  const [rotation, setRotation] = useState(0);
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const { addToast } = useToast();

  // Calculate original file size when file is selected
  useEffect(() => {
    if (file) {
      setOriginalSize(file.size);
    }
  }, [file]);

  // Update aspect ratio when image loads
  useEffect(() => {
    if (preview) {
      const img = new Image();
      img.src = preview;
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setAspectRatio(img.width / img.height);
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
    }
  }, [preview]);

  const handleFileSelect = (selected) => {
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setProcessedImage(null);
    setError(null);
    setActiveStep(1);
    setOriginalSize(selected.size);
  };

  const handleOperationChange = (operation) => {
    setOperations(prev => ({
      ...prev,
      [operation]: !prev[operation]
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate compression ratio
  const getCompressionRatio = () => {
    if (originalSize > 0 && compressedSize > 0) {
      return ((1 - compressedSize / originalSize) * 100).toFixed(1);
    }
    return 0;
  };

  // Process image with all selected operations
  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setCompressedSize(0);

    try {
      let result = file;
      let currentProgress = 0;

      // Step 1: Remove background if selected
      if (operations.removeBg) {
        addToast('Removing background...', 'info');
        const bgRemovedBlob = await removeBackground(result, {
          progress: (key, current, total) => {
            const bgProgress = (current / total) * 25;
            setProgress(0 + bgProgress);
          }
        });
        result = bgRemovedBlob;
        currentProgress = 25;
        setProgress(currentProgress);
      }

      // Load image for further processing
      const img = new Image();
      img.src = URL.createObjectURL(result);
      await new Promise((resolve) => { img.onload = resolve; });

      // Create canvas for processing
      const canvas = document.createElement('canvas');
      let canvasWidth = img.width;
      let canvasHeight = img.height;

      // Step 2: Resize if selected
      if (operations.resize && width && height) {
        canvasWidth = parseInt(width) || img.width;
        canvasHeight = parseInt(height) || img.height;
        
        if (maintainAspectRatio) {
          const ratio = Math.min(canvasWidth / img.width, canvasHeight / img.height);
          canvasWidth = img.width * ratio;
          canvasHeight = img.height * ratio;
        }
        
        currentProgress += 15;
        setProgress(currentProgress);
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      // Step 3: Rotate if selected
      if (operations.rotate && rotation !== 0) {
        canvas.width = canvasHeight;
        canvas.height = canvasWidth;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        currentProgress += 10;
        setProgress(currentProgress);
      }

      // Draw image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Step 4: Convert format if selected
      let outputFormat = format;
      let outputQuality = quality;

      // Step 5: Compress if selected
      if (operations.compress) {
        outputQuality = compressionLevel;
        currentProgress += 25;
        setProgress(currentProgress);
        addToast(`Compressing image... ${Math.round(compressionLevel * 100)}% quality`, 'info');
      }

      // Convert to blob
      const processedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          setCompressedSize(blob.size);
          resolve(blob);
        }, outputFormat, outputQuality);
      });

      setProgress(100);
      setProcessedImage(processedBlob);
      setActiveStep(3);
      addToast('Image processed successfully!', 'success');
      
    } catch (err) {
      console.error('Processing failed:', err);
      setError('Failed to process image. Please try again.');
      addToast('Failed to process image.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      let ext = format.split('/')[1];
      if (ext === 'jpeg') ext = 'jpg';
      
      let filename = file.name.substring(0, file.name.lastIndexOf('.'));
      const operations_list = [];
      if (operations.removeBg) operations_list.push('bg-removed');
      if (operations.compress) operations_list.push('compressed');
      if (operations.convert) operations_list.push(`converted-to-${ext}`);
      if (operations.resize) operations_list.push(`${width}x${height}`);
      if (operations.rotate) operations_list.push(`rotated-${rotation}`);
      
      const suffix = operations_list.length > 0 ? `-${operations_list.join('-')}` : '-processed';
      saveAs(processedImage, `${filename}${suffix}.${ext}`);
      addToast('Download started!', 'success');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setError(null);
    setActiveStep(0);
    setOperations({
      removeBg: false,
      convert: false,
      compress: false,
      resize: false,
      rotate: false
    });
    setFormat('image/png');
    setQuality(0.92);
    setCompressionLevel(0.7);
    setWidth('');
    setHeight('');
    setRotation(0);
    setCompressedSize(0);
  };

  const getSelectedOperationsCount = () => {
    return Object.values(operations).filter(Boolean).length;
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
            badgeContent={getSelectedOperationsCount()}
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
              <AutoFixHighIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Badge>
          
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Smart Image Tool
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            All-in-one: Remove background, compress, resize, rotate, and convert formats
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<ScissorsIcon />}
              label="Background Removal"
              color={operations.removeBg ? 'primary' : 'default'}
              variant={operations.removeBg ? 'filled' : 'outlined'}
              onClick={() => handleOperationChange('removeBg')}
            />
            <Chip
              icon={<CompressIcon />}
              label="Compress"
              color={operations.compress ? 'primary' : 'default'}
              variant={operations.compress ? 'filled' : 'outlined'}
              onClick={() => handleOperationChange('compress')}
            />
            <Chip
              icon={<SwapIcon />}
              label="Convert"
              color={operations.convert ? 'primary' : 'default'}
              variant={operations.convert ? 'filled' : 'outlined'}
              onClick={() => handleOperationChange('convert')}
            />
            <Chip
              icon={<AspectRatioIcon />}
              label="Resize"
              color={operations.resize ? 'primary' : 'default'}
              variant={operations.resize ? 'filled' : 'outlined'}
              onClick={() => handleOperationChange('resize')}
            />
            <Chip
              icon={<RotateIcon />}
              label="Rotate"
              color={operations.rotate ? 'primary' : 'default'}
              variant={operations.rotate ? 'filled' : 'outlined'}
              onClick={() => handleOperationChange('rotate')}
            />
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Stepper Column */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              {file && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    File Info
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Name:</Typography>
                    <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>{file.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Size:</Typography>
                    <Typography variant="caption">{formatFileSize(originalSize)}</Typography>
                  </Box>
                  {imageDimensions.width > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Dimensions:</Typography>
                      <Typography variant="caption">{imageDimensions.width} x {imageDimensions.height}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Content Column */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <AnimatePresence mode="wait">
                {/* Step 0: Upload */}
                {activeStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <FileUploader
                      onFileSelect={handleFileSelect}
                      title="Drop your image to start"
                      subtitle="PNG, JPG, WEBP, GIF supported"
                    />
                  </motion.div>
                )}

                {/* Step 1: Choose Operations */}
                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Select Operations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Choose one or more operations to apply to your image
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: operations.removeBg ? '2px solid' : '1px solid',
                            borderColor: operations.removeBg ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleOperationChange('removeBg')}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: operations.removeBg ? 'primary.main' : 'action.selected', mr: 2 }}>
                                <ScissorsIcon />
                              </Avatar>
                              <Typography variant="h6">Remove BG</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Automatically detect and remove background
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: operations.compress ? '2px solid' : '1px solid',
                            borderColor: operations.compress ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleOperationChange('compress')}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: operations.compress ? 'primary.main' : 'action.selected', mr: 2 }}>
                                <CompressIcon />
                              </Avatar>
                              <Typography variant="h6">Compress</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Reduce file size while maintaining quality
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: operations.convert ? '2px solid' : '1px solid',
                            borderColor: operations.convert ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleOperationChange('convert')}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: operations.convert ? 'primary.main' : 'action.selected', mr: 2 }}>
                                <SwapIcon />
                              </Avatar>
                              <Typography variant="h6">Convert</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Change image format (PNG, JPG, WEBP)
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: operations.resize ? '2px solid' : '1px solid',
                            borderColor: operations.resize ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleOperationChange('resize')}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: operations.resize ? 'primary.main' : 'action.selected', mr: 2 }}>
                                <AspectRatioIcon />
                              </Avatar>
                              <Typography variant="h6">Resize</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Change image dimensions
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            border: operations.rotate ? '2px solid' : '1px solid',
                            borderColor: operations.rotate ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleOperationChange('rotate')}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: operations.rotate ? 'primary.main' : 'action.selected', mr: 2 }}>
                                <RotateIcon />
                              </Avatar>
                              <Typography variant="h6">Rotate</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Rotate image by custom angle
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button onClick={reset}>Cancel</Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={getSelectedOperationsCount() === 0}
                      >
                        Next ({getSelectedOperationsCount()} selected)
                      </Button>
                    </Box>
                  </motion.div>
                )}

                {/* Step 2: Configure Settings */}
                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Configure Settings
                    </Typography>

                    {/* Compression Settings */}
                    {operations.compress && (
                      <Collapse in={operations.compress}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CompressIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Compression Settings
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Compression Level: {Math.round(compressionLevel * 100)}%
                            </Typography>
                            <Slider
                              value={compressionLevel}
                              onChange={(e, val) => setCompressionLevel(val)}
                              min={0.1}
                              max={1}
                              step={0.01}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                              sx={{ mb: 1 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                Smaller file
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Better quality
                              </Typography>
                            </Box>
                          </Box>

                          <FormControlLabel
                            control={
                              <Radio
                                checked={maintainQuality}
                                onChange={() => setMaintainQuality(true)}
                                size="small"
                              />
                            }
                            label="Maintain visual quality"
                          />
                          <FormControlLabel
                            control={
                              <Radio
                                checked={!maintainQuality}
                                onChange={() => setMaintainQuality(false)}
                                size="small"
                              />
                            }
                            label="Target file size"
                          />

                          {!maintainQuality && (
                            <TextField
                              fullWidth
                              size="small"
                              label="Target size (KB)"
                              value={targetSize}
                              onChange={(e) => setTargetSize(e.target.value)}
                              type="number"
                              sx={{ mt: 2 }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">KB</InputAdornment>,
                              }}
                            />
                          )}

                          {compressedSize > 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                              Compressed: {formatFileSize(compressedSize)} (Saved {getCompressionRatio()}%)
                            </Alert>
                          )}
                        </Paper>
                      </Collapse>
                    )}

                    {/* Format Conversion Settings */}
                    {operations.convert && (
                      <Collapse in={operations.convert}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SwapIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Format Conversion
                            </Typography>
                          </Box>

                          <Typography variant="subtitle2" gutterBottom>
                            Output Format
                          </Typography>
                          <ToggleButtonGroup
                            value={format}
                            exclusive
                            onChange={(e, val) => val && setFormat(val)}
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            <ToggleButton value="image/png">PNG</ToggleButton>
                            <ToggleButton value="image/jpeg">JPG</ToggleButton>
                            <ToggleButton value="image/webp">WEBP</ToggleButton>
                          </ToggleButtonGroup>

                          {format !== 'image/png' && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Quality: {Math.round(quality * 100)}%
                              </Typography>
                              <Slider
                                value={quality}
                                onChange={(e, val) => setQuality(val)}
                                min={0.1}
                                max={1}
                                step={0.01}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                              />
                            </Box>
                          )}
                        </Paper>
                      </Collapse>
                    )}

                    {/* Resize Settings */}
                    {operations.resize && (
                      <Collapse in={operations.resize}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AspectRatioIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Resize Image
                            </Typography>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Width (px)"
                                value={width}
                                onChange={(e) => {
                                  setWidth(e.target.value);
                                  if (maintainAspectRatio && aspectRatio) {
                                    setHeight(Math.round(parseInt(e.target.value) / aspectRatio).toString());
                                  }
                                }}
                                type="number"
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">px</InputAdornment>,
                                }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Height (px)"
                                value={height}
                                onChange={(e) => {
                                  setHeight(e.target.value);
                                  if (maintainAspectRatio && aspectRatio) {
                                    setWidth(Math.round(parseInt(e.target.value) * aspectRatio).toString());
                                  }
                                }}
                                type="number"
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">px</InputAdornment>,
                                }}
                              />
                            </Grid>
                          </Grid>

                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={maintainAspectRatio}
                                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                size="small"
                              />
                            }
                            label="Maintain aspect ratio"
                            sx={{ mt: 1 }}
                          />

                          {imageDimensions.width > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Original: {imageDimensions.width} x {imageDimensions.height}
                            </Typography>
                          )}
                        </Paper>
                      </Collapse>
                    )}

                    {/* Rotate Settings */}
                    {operations.rotate && (
                      <Collapse in={operations.rotate}>
                        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <RotateIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Rotate Image
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Button
                              variant={rotation === 90 ? 'contained' : 'outlined'}
                              onClick={() => setRotation(rotation === 90 ? 0 : 90)}
                              startIcon={<RotateIcon />}
                            >
                              90°
                            </Button>
                            <Button
                              variant={rotation === 180 ? 'contained' : 'outlined'}
                              onClick={() => setRotation(rotation === 180 ? 0 : 180)}
                              startIcon={<RotateIcon />}
                            >
                              180°
                            </Button>
                            <Button
                              variant={rotation === 270 ? 'contained' : 'outlined'}
                              onClick={() => setRotation(rotation === 270 ? 0 : 270)}
                              startIcon={<RotateIcon />}
                            >
                              270°
                            </Button>
                          </Box>

                          <TextField
                            fullWidth
                            size="small"
                            label="Custom angle"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
                            type="number"
                            InputProps={{
                              endAdornment: <InputAdornment position="end">°</InputAdornment>,
                            }}
                          />
                        </Paper>
                      </Collapse>
                    )}

                    {/* Background Removal Info */}
                    {operations.removeBg && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Background Removal</AlertTitle>
                        The AI will automatically detect and remove the background. This works best with clear subject separation.
                      </Alert>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button onClick={handleBack}>Back</Button>
                      <Button
                        variant="contained"
                        onClick={processImage}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Process Image'}
                      </Button>
                    </Box>
                  </motion.div>
                )}

                {/* Step 3: Result */}
                {activeStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Your Image is Ready!
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Original
                        </Typography>
                        <PreviewContainer>
                          <img
                            src={preview}
                            alt="Original"
                            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                          />
                          <ImageStats>
                            <Box>
                              <SizeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              {imageDimensions.width} x {imageDimensions.height}
                            </Box>
                            <Box>
                              {formatFileSize(originalSize)}
                            </Box>
                          </ImageStats>
                        </PreviewContainer>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Processed
                        </Typography>
                        <PreviewContainer>
                          {processedImage && (
                            <>
                              <img
                                src={URL.createObjectURL(processedImage)}
                                alt="Processed"
                                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                              />
                              <ImageStats>
                                <Box>
                                  {operations.resize && width && height ? (
                                    <>
                                      <SizeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                      {width} x {height}
                                    </>
                                  ) : (
                                    <>
                                      <SizeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                      {imageDimensions.width} x {imageDimensions.height}
                                    </>
                                  )}
                                </Box>
                                <Box>
                                  {formatFileSize(compressedSize || processedImage.size)}
                                  {compressedSize > 0 && originalSize > 0 && (
                                    <Typography variant="caption" sx={{ ml: 1, color: 'success.light' }}>
                                      (-{getCompressionRatio()}%)
                                    </Typography>
                                  )}
                                </Box>
                              </ImageStats>
                            </>
                          )}
                        </PreviewContainer>
                      </Grid>
                    </Grid>

                    {/* Operations Summary */}
                    <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Applied Operations:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {operations.removeBg && (
                          <Chip
                            size="small"
                            icon={<ScissorsIcon />}
                            label="Background Removed"
                            color="primary"
                          />
                        )}
                        {operations.compress && (
                          <Chip
                            size="small"
                            icon={<CompressIcon />}
                            label={`Compressed (${Math.round(compressionLevel * 100)}%)`}
                            color="primary"
                          />
                        )}
                        {operations.convert && (
                          <Chip
                            size="small"
                            icon={<SwapIcon />}
                            label={`Converted to ${format.split('/')[1].toUpperCase()}`}
                            color="primary"
                          />
                        )}
                        {operations.resize && width && height && (
                          <Chip
                            size="small"
                            icon={<AspectRatioIcon />}
                            label={`Resized to ${width}x${height}`}
                            color="primary"
                          />
                        )}
                        {operations.rotate && rotation !== 0 && (
                          <Chip
                            size="small"
                            icon={<RotateIcon />}
                            label={`Rotated ${rotation}°`}
                            color="primary"
                          />
                        )}
                      </Box>
                    </Paper>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
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
                        Download Result
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={reset}
                        startIcon={<RefreshIcon />}
                      >
                        New Image
                      </Button>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Process another image with same settings">
                        <Button
                          size="small"
                          onClick={() => {
                            setProcessedImage(null);
                            setActiveStep(1);
                          }}
                        >
                          Back to Operations
                        </Button>
                      </Tooltip>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Indicator */}
              {isProcessing && (
                <Box sx={{ mt: 3 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                    Processing... {Math.round(progress)}%
                  </Typography>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                  <AlertTitle>Error</AlertTitle>
                  {error}
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default SmartTool;
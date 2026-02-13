import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  Button,
  Fade,
  Zoom,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const DropzoneArea = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasError',
})(({ theme, isDragActive, hasError }) => ({
  position: 'relative',
  padding: theme.spacing(6),
  border: `2px dashed ${isDragActive 
    ? theme.palette.primary.main 
    : hasError 
      ? theme.palette.error.main 
      : theme.palette.divider
  }`,
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: isDragActive 
    ? theme.palette.primary.lighter || `${theme.palette.primary.main}10`
    : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}08`,
  },
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: 200,
  objectFit: 'contain',
  borderRadius: 8,
});

const FileInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.default,
}));

const FileUploader = ({
  onFileSelect,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg', '.ico'],
    'application/pdf': ['.pdf']
  },
  multiple = false,
  title = 'Drop your file here',
  subtitle = 'or click to browse',
  maxSize = 10485760, // 10MB
  showPreview = true
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setError(`File too large. Max size: ${maxSize / 1048576}MB`);
      } else if (error.code === 'file-invalid-type') {
        setError('Invalid file type. Please check the accepted formats.');
      } else {
        setError(error.message);
      }
      return;
    }

    if (acceptedFiles?.length > 0) {
      const selectedFile = multiple ? acceptedFiles : acceptedFiles[0];
      setFile(selectedFile);
      setError(null);
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
      }

      onFileSelect(selectedFile);
    }
  }, [onFileSelect, multiple, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize
  });

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(0);
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    return <FileIcon />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DropzoneArea
              {...getRootProps()}
              isDragActive={isDragActive}
              hasError={!!error}
              elevation={0}
            >
              <input {...getInputProps()} />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <motion.div
                  animate={{
                    scale: isDragActive ? 1.1 : 1,
                    rotate: isDragActive ? [0, -10, 10, -10, 0] : 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: 64,
                      color: isDragActive ? 'primary.main' : 'text.secondary',
                    }}
                  />
                </motion.div>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Max file size: {maxSize / 1048576}MB
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  component="span"
                  sx={{ mt: 2 }}
                  startIcon={<CloudUploadIcon />}
                >
                  Browse Files
                </Button>
              </Box>
            </DropzoneArea>

            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ mt: 2 }}
                  onClose={() => setError(null)}
                >
                  <AlertTitle>Upload Failed</AlertTitle>
                  {error}
                </Alert>
              </Fade>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Zoom in>
              <FileInfoCard elevation={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.lighter',
                      borderRadius: 2,
                      color: 'primary.main',
                    }}
                  >
                    {getFileIcon(file.type)}
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                    </Typography>
                    
                    {uploadProgress < 100 && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress} 
                          sx={{ borderRadius: 1 }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {uploadProgress === 100 && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Ready"
                        color="success"
                        size="small"
                      />
                    )}
                    
                    <Button
                      size="small"
                      color="error"
                      onClick={handleRemove}
                      startIcon={<DeleteIcon />}
                      sx={{ ml: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>

                {showPreview && preview && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Preview
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <PreviewImage src={preview} alt="Preview" />
                    </Box>
                  </Box>
                )}
              </FileInfoCard>
            </Zoom>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default FileUploader;
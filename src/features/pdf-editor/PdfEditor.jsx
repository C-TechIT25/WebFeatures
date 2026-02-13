import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Slider,
  Divider,
  Drawer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Badge,
  Alert,
  AlertTitle,
  LinearProgress,
  Fab,
  useMediaQuery,
  useTheme,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Draggable from "react-draggable";
import { saveAs } from "file-saver";
import { HexColorPicker } from "react-colorful";

// Icons
import {
  FileText,
  Type,
  Square,
  Circle,
  Highlighter,
  Eraser,
  Image as ImageIcon,
  Save,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Trash2,
  Palette,
  Download,
  Layers,
  X,
  RotateCw,
  Plus,
  Minus,
  Edit3,
  Move,
  Copy,
  Undo2,
  Redo2,
  Grid,
  Maximize2,
  Minimize2,
  Upload,
  AlertCircle
} from "lucide-react";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

// Styled Components
const EditorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "calc(100vh - 120px)",
  backgroundColor: theme.palette.background.default,
}));

const CanvasContainer = styled(Paper)(({ theme, fullscreen }) => ({
  position: "relative",
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "auto",
  minHeight: fullscreen ? "100vh" : 600,
  height: fullscreen ? "100vh" : "calc(85vh - 100px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const PdfPageWrapper = styled(Box)({
  position: "relative",
  display: "inline-block",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
});

const ElementBox = styled(Box, {
  shouldForwardProp: (prop) => !["isSelected", "elementType"].includes(prop),
})(({ theme, isSelected, elementType }) => ({
  position: "absolute",
  cursor: "move",
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
  backgroundColor: elementType === "highlight" ? "transparent" : "transparent",
  "&:hover": {
    borderColor: theme.palette.primary.light,
  },
}));

const EditableText = styled(Typography)({
  "&:focus": {
    outline: "none",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  minWidth: 50,
  minHeight: 24,
  padding: "2px 4px",
  cursor: "text",
});

const ControlPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  height: "fit-content",
  position: "sticky",
  top: 100,
}));

const PdfEditor = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTinyMobile = useMediaQuery("(max-width:350px)");
  
  // State
  const [file, setFile] = useState(null);
  const [elements, setElements] = useState([]);
  const [pdfSize, setPdfSize] = useState({ width: 0, height: 0 });
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [color, setColor] = useState("#6366f1");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Helvetica");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Calculate PDF page width based on container
  const getPageWidth = useCallback(() => {
    if (!containerRef.current) return 600;
    const containerWidth = containerRef.current.clientWidth - 40;
    return Math.min(containerWidth, isTinyMobile ? 250 : isSmallMobile ? 350 : 600);
  }, [isSmallMobile, isTinyMobile]);

  // Handle file upload
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setElements([]);
    setSelectedElement(null);
    setError(null);
    setSuccess(null);
    setPageNumber(1);
    setHistory([]);
    setHistoryIndex(-1);
  };

  // Add to history
  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Add text element
  const addText = () => {
    const newElement = {
      id: Date.now(),
      type: "text",
      x: 100,
      y: 100,
      content: "Double click to edit",
      fontSize,
      fontFamily,
      color,
      width: 150,
      height: 30,
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    addToHistory(newElements);
  };

  // Add rectangle
  const addRectangle = () => {
    const newElement = {
      id: Date.now(),
      type: "rectangle",
      x: 100,
      y: 150,
      width: 100,
      height: 60,
      color,
      strokeWidth: 2,
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    addToHistory(newElements);
  };

  // Add circle
  const addCircle = () => {
    const newElement = {
      id: Date.now(),
      type: "circle",
      x: 100,
      y: 230,
      radius: 30,
      color,
      strokeWidth: 2,
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    addToHistory(newElements);
  };

  // Add highlight
  const addHighlight = () => {
    const newElement = {
      id: Date.now(),
      type: "highlight",
      x: 100,
      y: 300,
      width: 200,
      height: 30,
      color,
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    addToHistory(newElements);
  };

  // Add eraser (white rectangle)
  const addEraser = () => {
    const newElement = {
      id: Date.now(),
      type: "eraser",
      x: 100,
      y: 350,
      width: 100,
      height: 40,
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    addToHistory(newElements);
  };

  // Upload image
  const handleImageUpload = (e) => {
    const imgFile = e.target.files[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newElement = {
        id: Date.now(),
        type: "image",
        x: 100,
        y: 420,
        width: 100,
        height: 100,
        content: reader.result,
      };
      
      const newElements = [...elements, newElement];
      setElements(newElements);
      setSelectedElement(newElement.id);
      addToHistory(newElements);
    };
    reader.readAsDataURL(imgFile);
  };

  // Delete selected element
  const deleteSelected = () => {
    if (selectedElement) {
      const newElements = elements.filter(el => el.id !== selectedElement);
      setElements(newElements);
      setSelectedElement(null);
      addToHistory(newElements);
    }
  };

  // Duplicate selected element
  const duplicateSelected = () => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        const newElement = {
          ...element,
          id: Date.now(),
          x: element.x + 30,
          y: element.y + 30,
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        setSelectedElement(newElement.id);
        addToHistory(newElements);
      }
    }
  };

  // Clear all elements
  const clearAll = () => {
    setElements([]);
    setSelectedElement(null);
    addToHistory([]);
  };

  // Update element position
  const handleDragStop = (id, data) => {
    const updated = elements.map(el => 
      el.id === id ? { ...el, x: data.x, y: data.y } : el
    );
    setElements(updated);
    addToHistory(updated);
  };

  // Update text content
  const handleTextBlur = (id, content) => {
    const updated = elements.map(el => 
      el.id === id ? { ...el, content } : el
    );
    setElements(updated);
    addToHistory(updated);
  };

  // Convert hex to rgb
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.4, g: 0.4, b: 0.4 };
  };

  // Download edited PDF - FIXED VERSION
  const downloadPdf = async () => {
    if (!file) {
      setError("Please upload a PDF file first");
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      // Load the existing PDF
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get the current page
      const page = pdfDoc.getPages()[pageNumber - 1];
      const { width, height } = page.getSize();

      // Calculate scale factors between preview and actual PDF
      const scaleX = width / pdfSize.width;
      const scaleY = height / pdfSize.height;

      // Embed standard font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Draw all elements on the PDF
      for (let el of elements) {
        try {
          if (el.type === "text") {
            const rgbColor = hexToRgb(el.color || color);
            
            page.drawText(el.content || "Edit me", {
              x: el.x * scaleX,
              y: height - (el.y * scaleY) - ((el.fontSize || fontSize) * 0.75),
              size: (el.fontSize || fontSize) * 0.75,
              font: helveticaFont,
              color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
            });
          }

          if (el.type === "rectangle") {
            const rgbColor = hexToRgb(el.color || color);
            
            page.drawRectangle({
              x: el.x * scaleX,
              y: height - (el.y * scaleY) - (el.height * scaleY),
              width: el.width * scaleX,
              height: el.height * scaleY,
              borderColor: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
              borderWidth: (el.strokeWidth || 2) * scaleX,
            });
          }

          if (el.type === "circle") {
            const rgbColor = hexToRgb(el.color || color);
            const radius = el.radius * scaleX;
            
            page.drawCircle({
              x: (el.x * scaleX) + radius,
              y: height - (el.y * scaleY) - radius,
              size: radius,
              borderColor: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
              borderWidth: (el.strokeWidth || 2) * scaleX,
            });
          }

          if (el.type === "highlight") {
            const rgbColor = hexToRgb(el.color || "#ffff00");
            
            page.drawRectangle({
              x: el.x * scaleX,
              y: height - (el.y * scaleY) - (el.height * scaleY),
              width: el.width * scaleX,
              height: el.height * scaleY,
              color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
              opacity: 0.4,
            });
          }

          if (el.type === "eraser") {
            page.drawRectangle({
              x: el.x * scaleX,
              y: height - (el.y * scaleY) - (el.height * scaleY),
              width: el.width * scaleX,
              height: el.height * scaleY,
              color: rgb(1, 1, 1),
            });
          }

          if (el.type === "image") {
            try {
              const base64Data = el.content.split(",")[1];
              const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              
              let image;
              if (el.content.includes("image/png")) {
                image = await pdfDoc.embedPng(imageBytes);
              } else {
                image = await pdfDoc.embedJpg(imageBytes);
              }

              page.drawImage(image, {
                x: el.x * scaleX,
                y: height - (el.y * scaleY) - (el.height * scaleY),
                width: el.width * scaleX,
                height: el.height * scaleY,
              });
            } catch (imgErr) {
              console.error("Error embedding image:", imgErr);
            }
          }
        } catch (elErr) {
          console.error("Error drawing element:", elErr);
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      
      // Generate filename
      const timestamp = new Date().getTime();
      const originalName = file.name.replace(".pdf", "");
      saveAs(blob, `${originalName}_edited_${timestamp}.pdf`);
      
      setSuccess("PDF downloaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error("Error saving PDF:", err);
      setError("Failed to save PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle page load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle page load success
  const onPageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfSize({
      width: viewport.width,
      height: viewport.height,
    });
  };

  // Zoom controls
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // Page navigation
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <EditorContainer>
      {/* Header */}
      <Box sx={{ mb: { xs: 1, sm: 2, md: 3 }, textAlign: "center" }}>
        <Badge badgeContent="BETA" color="secondary" sx={{ mb: 1 }}>
          <Avatar
            sx={{
              width: { xs: 50, sm: 60, md: 80 },
              height: { xs: 50, sm: 60, md: 80 },
              bgcolor: "primary.main",
              mx: "auto",
            }}
          >
            <FileText size={isTinyMobile ? 24 : isSmallMobile ? 30 : 40} />
          </Avatar>
        </Badge>
        
        <Typography 
          variant={isTinyMobile ? "h6" : isSmallMobile ? "h5" : "h3"} 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
        >
          PDF Editor
        </Typography>
        <Typography 
          variant={isTinyMobile ? "caption" : isSmallMobile ? "body2" : "h6"} 
          color="text.secondary"
        >
          Edit PDF documents with text, shapes, images, and annotations
        </Typography>
      </Box>

      {/* Mobile Menu Button */}
      {isMobile && file && (
        <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
          <Fab
            color="primary"
            onClick={() => setIsDrawerOpen(true)}
            size={isTinyMobile ? "medium" : "large"}
          >
            <Layers size={isTinyMobile ? 20 : 24} />
          </Fab>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2 }}>
        {/* PDF Canvas Area */}
        <Box sx={{ flex: 1 }}>
          <CanvasContainer 
            ref={containerRef} 
            fullscreen={isFullscreen}
            elevation={3}
          >
            {!file ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                  p: { xs: 2, sm: 3, md: 4 },
                }}
              >
                <Upload 
                  size={isTinyMobile ? 32 : isSmallMobile ? 48 : 64} 
                  color={theme.palette.text.secondary} 
                />
                <Typography 
                  variant={isTinyMobile ? "body2" : "h6"} 
                  color="text.secondary" 
                  sx={{ mt: 2, textAlign: "center" }}
                >
                  Upload a PDF file to start editing
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mt: 2 }}
                  size={isTinyMobile ? "small" : "medium"}
                >
                  Browse Files
                  <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            ) : (
              <Box sx={{ position: "relative" }}>
                {/* PDF Page */}
                <PdfPageWrapper>
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <Box sx={{ p: 4, textAlign: "center" }}>
                        <LinearProgress sx={{ width: 200, mx: "auto" }} />
                        <Typography sx={{ mt: 2 }}>Loading PDF...</Typography>
                      </Box>
                    }
                  >
                    <Page
                      key={`page_${pageNumber}`}
                      pageNumber={pageNumber}
                      width={getPageWidth() * scale}
                      onLoadSuccess={onPageLoadSuccess}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </Document>

                  {/* Draggable Elements */}
                  {elements.map((el) => (
                    <Draggable
                      key={el.id}
                      position={{ x: el.x, y: el.y }}
                      onStop={(e, data) => handleDragStop(el.id, data)}
                      bounds="parent"
                      scale={scale}
                    >
                      <ElementBox
                        isSelected={selectedElement === el.id}
                        elementType={el.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement(el.id);
                        }}
                      >
                        {el.type === "text" && (
                          <EditableText
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleTextBlur(el.id, e.target.innerText)}
                            sx={{
                              fontSize: (el.fontSize || fontSize) / scale,
                              fontFamily: el.fontFamily || fontFamily,
                              color: el.color || color,
                            }}
                          >
                            {el.content}
                          </EditableText>
                        )}

                        {el.type === "rectangle" && (
                          <Box
                            sx={{
                              width: el.width,
                              height: el.height,
                              border: `${el.strokeWidth}px solid ${el.color || color}`,
                              borderRadius: 1,
                            }}
                          />
                        )}

                        {el.type === "circle" && (
                          <Box
                            sx={{
                              width: el.radius * 2,
                              height: el.radius * 2,
                              border: `${el.strokeWidth}px solid ${el.color || color}`,
                              borderRadius: "50%",
                            }}
                          />
                        )}

                        {el.type === "highlight" && (
                          <Box
                            sx={{
                              width: el.width,
                              height: el.height,
                              bgcolor: `${el.color || "#ffff00"}40`,
                            }}
                          />
                        )}

                        {el.type === "eraser" && (
                          <Box
                            sx={{
                              width: el.width,
                              height: el.height,
                              bgcolor: "white",
                              border: "2px dashed #ef4444",
                            }}
                          />
                        )}

                        {el.type === "image" && (
                          <img
                            src={el.content}
                            alt=""
                            width={el.width}
                            height={el.height}
                            style={{ objectFit: "contain" }}
                          />
                        )}
                      </ElementBox>
                    </Draggable>
                  ))}
                </PdfPageWrapper>

                {/* PDF Controls Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    right: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    pointerEvents: "none",
                  }}
                >
                  {/* Page Navigation */}
                  <Paper elevation={2} sx={{ p: 0.5, pointerEvents: "auto", display: "flex" }}>
                    <Tooltip title="Previous Page">
                      <IconButton 
                        size="small" 
                        onClick={goToPrevPage} 
                        disabled={pageNumber <= 1}
                      >
                        <ChevronLeft size={16} />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
                      <Typography variant="caption">
                        {pageNumber} / {numPages || 1}
                      </Typography>
                    </Box>
                    <Tooltip title="Next Page">
                      <IconButton 
                        size="small" 
                        onClick={goToNextPage} 
                        disabled={pageNumber >= (numPages || 1)}
                      >
                        <ChevronRight size={16} />
                      </IconButton>
                    </Tooltip>
                  </Paper>

                  {/* View Controls */}
                  <Paper elevation={2} sx={{ p: 0.5, pointerEvents: "auto", display: "flex" }}>
                    <Tooltip title="Zoom Out">
                      <IconButton size="small" onClick={handleZoomOut} disabled={scale <= 0.5}>
                        <ZoomOut size={16} />
                      </IconButton>
                    </Tooltip>
                    <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
                      <Typography variant="caption">
                        {Math.round(scale * 100)}%
                      </Typography>
                    </Box>
                    <Tooltip title="Zoom In">
                      <IconButton size="small" onClick={handleZoomIn} disabled={scale >= 2.5}>
                        <ZoomIn size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Fullscreen">
                      <IconButton size="small" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Grid">
                      <IconButton size="small" onClick={() => setShowGrid(!showGrid)}>
                        <Grid size={16} />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Box>

                {/* Grid Overlay */}
                {showGrid && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `
                        linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
                        linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)
                      `,
                      backgroundSize: "20px 20px",
                      pointerEvents: "none",
                      opacity: 0.3,
                    }}
                  />
                )}
              </Box>
            )}
          </CanvasContainer>
        </Box>

        {/* Desktop Control Panel */}
        {!isMobile && file && (
          <Box sx={{ width: { lg: 300, xl: 350 } }}>
            <ControlPanel elevation={3}>
              <PdfControls
                file={file}
                elements={elements}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                color={color}
                setColor={setColor}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                isColorPickerOpen={isColorPickerOpen}
                setIsColorPickerOpen={setIsColorPickerOpen}
                addText={addText}
                addRectangle={addRectangle}
                addCircle={addCircle}
                addHighlight={addHighlight}
                addEraser={addEraser}
                handleImageUpload={handleImageUpload}
                deleteSelected={deleteSelected}
                duplicateSelected={duplicateSelected}
                clearAll={clearAll}
                downloadPdf={downloadPdf}
                isProcessing={isProcessing}
                undo={undo}
                redo={redo}
                historyIndex={historyIndex}
                historyLength={history.length}
                imageInputRef={imageInputRef}
                isSmallMobile={isSmallMobile}
                isTinyMobile={isTinyMobile}
              />
            </ControlPanel>
          </Box>
        )}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: "80vh",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              PDF Tools
            </Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}>
              <X size={20} />
            </IconButton>
          </Box>
          
          <PdfControls
            file={file}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            color={color}
            setColor={setColor}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            isColorPickerOpen={isColorPickerOpen}
            setIsColorPickerOpen={setIsColorPickerOpen}
            addText={addText}
            addRectangle={addRectangle}
            addCircle={addCircle}
            addHighlight={addHighlight}
            addEraser={addEraser}
            handleImageUpload={handleImageUpload}
            deleteSelected={deleteSelected}
            duplicateSelected={duplicateSelected}
            clearAll={clearAll}
            downloadPdf={downloadPdf}
            isProcessing={isProcessing}
            undo={undo}
            redo={redo}
            historyIndex={historyIndex}
            historyLength={history.length}
            imageInputRef={imageInputRef}
            isMobile={true}
            isSmallMobile={isSmallMobile}
            isTinyMobile={isTinyMobile}
            onClose={() => setIsDrawerOpen(false)}
          />
        </Box>
      </Drawer>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: "fixed",
              bottom: isMobile ? 80 : 24,
              right: 24,
              zIndex: 9999,
            }}
          >
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ borderRadius: 2, minWidth: isTinyMobile ? 200 : 300 }}
            >
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: "fixed",
              bottom: isMobile ? 80 : 24,
              right: 24,
              zIndex: 9999,
            }}
          >
            <Alert 
              severity="success" 
              onClose={() => setSuccess(null)}
              sx={{ borderRadius: 2, minWidth: isTinyMobile ? 200 : 300 }}
            >
              <AlertTitle>Success</AlertTitle>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </EditorContainer>
  );
};

// PDF Controls Component
const PdfControls = ({
  file,
  elements,
  selectedElement,
  setSelectedElement,
  color,
  setColor,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  isColorPickerOpen,
  setIsColorPickerOpen,
  addText,
  addRectangle,
  addCircle,
  addHighlight,
  addEraser,
  handleImageUpload,
  deleteSelected,
  duplicateSelected,
  clearAll,
  downloadPdf,
  isProcessing,
  undo,
  redo,
  historyIndex,
  historyLength,
  imageInputRef,
  isMobile = false,
  isSmallMobile = false,
  isTinyMobile = false,
  onClose,
}) => {
  return (
    <Box>
      {/* Tools Section */}
      <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Layers size={16} />
        Annotation Tools
      </Typography>
      
      <Box sx={{ 
        display: "grid", 
        gridTemplateColumns: isTinyMobile ? "repeat(2, 1fr)" : isSmallMobile ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
        gap: 1,
        mb: 2 
      }}>
        <Tooltip title="Add Text">
          <Button
            variant="outlined"
            onClick={() => {
              addText();
              if (onClose) onClose();
            }}
            size="small"
            sx={{ minWidth: 0, py: 1 }}
          >
            <Type size={16} />
            {!isTinyMobile && <span style={{ marginLeft: 4 }}>Text</span>}
          </Button>
        </Tooltip>
        
        <Tooltip title="Add Rectangle">
          <Button
            variant="outlined"
            onClick={() => {
              addRectangle();
              if (onClose) onClose();
            }}
            size="small"
            sx={{ minWidth: 0, py: 1 }}
          >
            <Square size={16} />
            {!isTinyMobile && <span style={{ marginLeft: 4 }}>Rect</span>}
          </Button>
        </Tooltip>
        
        <Tooltip title="Add Circle">
          <Button
            variant="outlined"
            onClick={() => {
              addCircle();
              if (onClose) onClose();
            }}
            size="small"
            sx={{ minWidth: 0, py: 1 }}
          >
            <Circle size={16} />
            {!isTinyMobile && <span style={{ marginLeft: 4 }}>Circle</span>}
          </Button>
        </Tooltip>
        
        <Tooltip title="Add Highlight">
          <Button
            variant="outlined"
            onClick={() => {
              addHighlight();
              if (onClose) onClose();
            }}
            size="small"
            sx={{ minWidth: 0, py: 1 }}
          >
            <Highlighter size={16} />
            {!isTinyMobile && <span style={{ marginLeft: 4 }}>Highlight</span>}
          </Button>
        </Tooltip>
        
        <Tooltip title="Add Eraser">
          <Button
            variant="outlined"
            onClick={() => {
              addEraser();
              if (onClose) onClose();
            }}
            size="small"
            sx={{ minWidth: 0, py: 1 }}
          >
            <Eraser size={16} />
            {!isTinyMobile && <span style={{ marginLeft: 4 }}>Eraser</span>}
          </Button>
        </Tooltip>
        
        <Tooltip title="Upload Image">
          <Button
            variant="outlined"
            onClick={() => imageInputRef.current?.click()}
            size="small"
            sx={{ minWidth: 0, py: 1 }}
          >
            <ImageIcon size={16} />
            {!isTinyMobile && <span style={{ marginLeft: 4 }}>Image</span>}
          </Button>
        </Tooltip>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Color Picker */}
      <Typography variant="subtitle2" gutterBottom>
        Color
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1,
              bgcolor: color,
              border: "2px solid",
              borderColor: "divider",
              cursor: "pointer",
            }}
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
          />
          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
            {color}
          </Typography>
        </Box>
        
        <Collapse in={isColorPickerOpen}>
          <Paper elevation={3} sx={{ p: 2, mt: 1 }}>
            <HexColorPicker color={color} onChange={setColor} />
            <Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
              {["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6", "#14b8a6"].map((c) => (
                <Box
                  key={c}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.5,
                    bgcolor: c,
                    cursor: "pointer",
                    border: c === color ? "2px solid" : "1px solid",
                    borderColor: c === color ? "primary.main" : "divider",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </Box>
          </Paper>
        </Collapse>
      </Box>

      {/* Text Settings */}
      <Typography variant="subtitle2" gutterBottom>
        Text Settings
      </Typography>
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel>Font Size</InputLabel>
          <Select
            value={fontSize}
            label="Font Size"
            onChange={(e) => setFontSize(e.target.value)}
          >
            <MenuItem value={12}>12px</MenuItem>
            <MenuItem value={14}>14px</MenuItem>
            <MenuItem value={16}>16px</MenuItem>
            <MenuItem value={18}>18px</MenuItem>
            <MenuItem value={20}>20px</MenuItem>
            <MenuItem value={24}>24px</MenuItem>
            <MenuItem value={30}>30px</MenuItem>
            <MenuItem value={36}>36px</MenuItem>
            <MenuItem value={48}>48px</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Font Family</InputLabel>
          <Select
            value={fontFamily}
            label="Font Family"
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <MenuItem value="Helvetica">Helvetica</MenuItem>
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Times-Roman">Times New Roman</MenuItem>
            <MenuItem value="Courier">Courier</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Element Selection */}
      {elements.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Selected Element
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={selectedElement || ""}
              onChange={(e) => setSelectedElement(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">None</MenuItem>
              {elements.map((el) => (
                <MenuItem key={el.id} value={el.id}>
                  {el.type} - {el.id.toString().slice(-4)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Tooltip title="Undo">
          <span>
            <IconButton size="small" onClick={undo} disabled={historyIndex <= 0}>
              <Undo2 size={18} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton size="small" onClick={redo} disabled={historyIndex >= historyLength - 1}>
              <Redo2 size={18} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Duplicate">
          <span>
            <IconButton 
              size="small" 
              onClick={duplicateSelected} 
              disabled={!selectedElement}
            >
              <Copy size={18} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Delete">
          <span>
            <IconButton 
              size="small" 
              onClick={deleteSelected} 
              disabled={!selectedElement}
              color="error"
            >
              <Trash2 size={18} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Clear All">
          <IconButton size="small" onClick={clearAll} color="error">
            <X size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Download Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={downloadPdf}
        disabled={isProcessing}
        startIcon={isProcessing ? <RotateCw size={18} className="spin" /> : <Download size={18} />}
        sx={{
          py: 1.5,
          background: "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)",
          },
        }}
      >
        {isProcessing ? "Processing..." : "Download PDF"}
      </Button>

      {/* Close Button for Mobile */}
      {isMobile && (
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{ mt: 1 }}
        >
          Close
        </Button>
      )}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default PdfEditor;
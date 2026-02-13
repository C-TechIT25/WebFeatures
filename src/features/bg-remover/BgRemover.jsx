import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Download, RefreshCw, X, AlertCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import { removeBackground } from '@imgly/background-removal';
import FileUploader from '../../components/FileUploader/FileUploader';
import { useToast } from '../../context/ToastContext';

const BgRemover = () => {
    const [file, setFile] = useState(null);
    const [originalPreview, setOriginalPreview] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    const handleFileSelect = (selected) => {
        setFile(selected);
        setOriginalPreview(URL.createObjectURL(selected));
        setProcessedImage(null);
        setError(null);
    };

    const handleRemoveBackground = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            // Processing
            const blob = await removeBackground(file, {
                progress: (key, current, total) => {
                    // Optional: could implement detailed progress bar
                    console.log(`Downloading ${key}: ${current} of ${total}`);
                },
                // If assets are local
                // publicPath: '/assets/imgly-background-removal-data/' 
            });

            const processedUrl = URL.createObjectURL(blob);
            setProcessedImage(processedUrl);
            addToast("Background removed successfully!", "success");
        } catch (err) {
            console.error("BG Removal failed", err);
            setError("Failed to remove background. Please try again or check your connection.");
            addToast("Failed to remove background.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (processedImage) {
            const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
            saveAs(processedImage, `${originalName}-bg-removed.png`);
        }
    };

    const reset = () => {
        setFile(null);
        setOriginalPreview(null);
        setProcessedImage(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Background Remover</h2>
                <p className="text-gray-600 dark:text-gray-400">Remove image backgrounds instantly using AI.</p>
            </div>

            <AnimatePresence mode="wait">
                {!file ? (
                    <FileUploader
                        onFileSelect={handleFileSelect}
                        title="Drop your image for background removal"
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Scissors className="w-5 h-5 text-indigo-600" />
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">{file.name}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-md uppercase">
                                    {(file.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                            <button onClick={reset} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2">
                            {/* Content Area */}
                            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center gap-4 relative min-h-[400px]">
                                {error ? (
                                    <div className="text-center text-red-500 space-y-2">
                                        <AlertCircle className="w-10 h-10 mx-auto" />
                                        <p>{error}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Image Display */}
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            {/* We show original until we have processed result, or side-by-side if you prefer. 
                                                Let's do a toggle or overlay? 
                                                Simpler: Show processed if available, else original. 
                                            */}
                                            <img
                                                src={processedImage || originalPreview}
                                                alt="Preview"
                                                className={`max-h-[350px] w-auto max-w-full object-contain rounded-lg shadow-sm transition-opacity duration-300 ${isProcessing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                                            />
                                            {isProcessing && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-white/90 dark:bg-gray-800/90 px-6 py-4 rounded-xl shadow-xl flex flex-col items-center gap-3">
                                                        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                                                        <span className="font-medium text-gray-900 dark:text-white">Processing...</span>
                                                        <span className="text-xs text-gray-500">This may take a moment</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Sidebar Controls */}
                            <div className="p-8 border-l border-gray-100 dark:border-gray-700 flex flex-col justify-center gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">How it works</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Our AI automatically detects the subject and makes the background transparent.
                                        {processedImage && " Your image is ready to download!"}
                                    </p>
                                </div>

                                <div className="mt-4">
                                    {!processedImage ? (
                                        <button
                                            onClick={handleRemoveBackground}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            <Scissors className="w-5 h-5" /> Remove Background
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <button
                                                onClick={handleDownload}
                                                className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                                            >
                                                <Download className="w-5 h-5" /> Download Result
                                            </button>
                                            <button
                                                onClick={() => { setProcessedImage(null); }}
                                                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-colors"
                                            >
                                                Undo / Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BgRemover;

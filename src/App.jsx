import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
// import { AuthProvider } from './context/AuthContext';
import { lightTheme, darkTheme } from './theme';

import Layout from './components/layout/Layouts';
import Home from './pages/Home';
import ImageConverter from './features/converter/ImageConverter';
import BgRemover from './features/bg-remover/BgRemover';
import PdfEditor from './features/pdf-editor/PdfEditor';
import SmartTool from './features/smart-tool/SmartTool';
import SplashScreen from './pages/SplashScreen'; // Create this component

const AppContent = () => {
  const { isDark } = useTheme();
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="converter" element={<ImageConverter />} />
              <Route path="bg-remover" element={<BgRemover />} />
              <Route path="pdf-editor" element={<PdfEditor />} />
              <Route path="smart-tool" element={<SmartTool />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Always show splash screen on every load/refresh
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      {/* <AuthProvider> */}
      <ToastProvider>
        <AppContent />
      </ToastProvider>
      {/* </AuthProvider> */}
    </ThemeProvider>
  );
}

export default App;
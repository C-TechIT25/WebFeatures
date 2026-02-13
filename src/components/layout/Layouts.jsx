import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  Fab,
  Zoom,
  Tooltip,
  Chip,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Slide,
  useScrollTrigger
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Image as ImageIcon,
  ContentCut as ScissorsIcon,
  PictureAsPdf as PdfIcon,
  AutoFixHigh as AutoFixHighIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    paddingBottom: theme.spacing(10), // Add padding for bottom navigation on mobile
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(10),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
      paddingBottom: theme.spacing(10),
    },
    [theme.breakpoints.down(350)]: {
      padding: theme.spacing(1),
      paddingBottom: theme.spacing(9),
    },
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: `${drawerWidth}px`,
    }),
  }),
);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('md')]: {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(30, 41, 59, 0.98)' 
      : 'rgba(255, 255, 255, 0.98)',
  },
}));

const BottomAppBar = styled(AppBar)(({ theme }) => ({
  top: 'auto',
  bottom: 0,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderTop: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
  [theme.breakpoints.down(350)]: {
    '& .MuiBottomNavigation-root': {
      height: 64,
    },
    '& .MuiBottomNavigationAction-root': {
      minWidth: 50,
      padding: '6px 0',
    },
    '& .MuiBottomNavigationAction-label': {
      fontSize: '0.65rem',
    },
  },
  [theme.breakpoints.down(300)]: {
    '& .MuiBottomNavigation-root': {
      height: 56,
    },
    '& .MuiBottomNavigationAction-root': {
      minWidth: 44,
      padding: '4px 0',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    },
  },
  [theme.breakpoints.down(250)]: {
    '& .MuiBottomNavigation-root': {
      height: 48,
    },
    '& .MuiBottomNavigationAction-root': {
      minWidth: 40,
      padding: '2px 0',
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
    '& .MuiBottomNavigationAction-label': {
      fontSize: '0.55rem',
    },
  },
}));

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  backgroundColor: 'transparent',
  height: 80,
  [theme.breakpoints.down('sm')]: {
    height: 72,
  },
  [theme.breakpoints.down(350)]: {
    height: 64,
  },
  [theme.breakpoints.down(300)]: {
    height: 56,
  },
  [theme.breakpoints.down(250)]: {
    height: 48,
  },
}));

const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down(350)]: {
    minWidth: 50,
    padding: '6px 0',
  },
  [theme.breakpoints.down(300)]: {
    minWidth: 44,
    padding: '4px 0',
  },
  [theme.breakpoints.down(250)]: {
    minWidth: 40,
    padding: '2px 0',
    '& .MuiBottomNavigationAction-label': {
      fontSize: '0.55rem',
      marginTop: 2,
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
  },
}));

const MobileMenuDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '80%',
    maxWidth: 320,
    minWidth: 200,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    [theme.breakpoints.down(300)]: {
      minWidth: 180,
    },
    [theme.breakpoints.down(250)]: {
      minWidth: 160,
    },
  },
}));

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  
  const theme = useTheme();
  const { isDark, toggleTheme } = useCustomTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmall = useMediaQuery('(max-width:350px)');
  const isExtremeSmall = useMediaQuery('(max-width:250px)');
  
  // Update bottom nav value based on current path
  useEffect(() => {
    const index = navigationItems.findIndex(item => item.path === location.pathname);
    if (index !== -1) {
      setBottomNavValue(index);
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    navigate(navigationItems[newValue].path);
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Image', path: '/converter', icon: ImageIcon },
    { name: 'PDF', path: '/pdf-editor', icon: PdfIcon },
    { name: 'Smart', path: '/smart-tool', icon: AutoFixHighIcon },
  ];

  const mobileNavigationItems = [
    { name: isExtremeSmall ? '' : 'Home', path: '/', icon: HomeIcon },
    { name: isExtremeSmall ? '' : 'Tools', path: '/converter', icon: ImageIcon },
    { name: isExtremeSmall ? '' : 'PDF', path: '/pdf-editor', icon: PdfIcon },
    { name: isExtremeSmall ? '' : 'Smart', path: '/smart-tool', icon: AutoFixHighIcon },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%'
    }}>
      <Box sx={{ 
        p: isExtremeSmall ? 1.5 : 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: isExtremeSmall ? 0.5 : 1 
      }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main',
            width: isExtremeSmall ? 32 : 40,
            height: isExtremeSmall ? 32 : 40
          }}
        >
          <AutoFixHighIcon sx={{ 
            color: 'white',
            fontSize: isExtremeSmall ? 18 : 24 
          }} />
        </Avatar>
        <Typography 
          variant={isExtremeSmall ? "body2" : "h6"} 
          fontWeight="bold"
          sx={{
            fontSize: isExtremeSmall ? '0.8rem' : '1.25rem',
          }}
        >
          {isExtremeSmall ? 'C-Tech' : 'C-Tech Soft Tools'}
        </Typography>
      </Box>
      
      <Divider sx={{ mx: 2 }} />
      
      <List sx={{ flex: 1, px: isExtremeSmall ? 1 : 2, py: isExtremeSmall ? 1.5 : 3 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <ListItem
              key={item.name}
              component={motion.li}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItem
                component="a"
                href={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: isExtremeSmall ? 1 : 1.5,
                  px: isExtremeSmall ? 1.5 : 2,
                  width: '100%',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white !important',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white !important',
                    },
                    '& .MuiListItemText-root': {
                      color: 'white !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                      fontWeight: 600,
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: isExtremeSmall ? 32 : 40, 
                  color: isActive ? 'white' : 'text.secondary',
                }}>
                  <Icon sx={{ fontSize: isExtremeSmall ? 20 : 24 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.name} 
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'white' : 'text.primary',
                    fontSize: isExtremeSmall ? '0.85rem' : '1rem',
                  }}
                />
              </ListItem>
            </ListItem>
          );
        })}
        
        <Divider sx={{ my: 2 }} />
        
        <ListItem
          component="li"
          disablePadding
          sx={{ mb: 1 }}
        >
          <ListItem
            component="button"
            onClick={toggleTheme}
            sx={{
              borderRadius: 2,
              py: isExtremeSmall ? 1 : 1.5,
              px: isExtremeSmall ? 1.5 : 2,
              width: '100%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: isExtremeSmall ? 32 : 40, 
              color: 'text.secondary'
            }}>
              {isDark ? <LightModeIcon sx={{ fontSize: isExtremeSmall ? 20 : 24 }} /> : <DarkModeIcon sx={{ fontSize: isExtremeSmall ? 20 : 24 }} />}
            </ListItemIcon>
            <ListItemText 
              primary={isDark ? 'Light Mode' : 'Dark Mode'} 
              primaryTypographyProps={{
                fontSize: isExtremeSmall ? '0.85rem' : '1rem',
              }}
            />
          </ListItem>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StyledAppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{
          minHeight: { xs: 56, sm: 64 },
          [theme.breakpoints.down(300)]: {
            minHeight: 48,
            px: 1,
          },
        }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon sx={{ fontSize: { xs: 24, sm: 24, [theme.breakpoints.down(300)]: 20 } }} />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: {
                xs: '1rem',
                sm: '1.25rem',
                [theme.breakpoints.down(300)]: '0.9rem',
                [theme.breakpoints.down(250)]: '0.8rem',
              },
            }}
          >
            {navigationItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {!isMobile && (
              <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleTheme}
                  component={motion.button}
                  whileTap={{ scale: 0.9 }}
                  size={isExtremeSmall ? 'small' : 'medium'}
                >
                  {isDark ? <LightModeIcon fontSize={isExtremeSmall ? 'small' : 'medium'} /> : <DarkModeIcon fontSize={isExtremeSmall ? 'small' : 'medium'} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Bottom App Bar */}
      {isMobile && (
        <Slide direction="up" in={true}>
          <BottomAppBar position="fixed" color="inherit" elevation={0}>
            <StyledBottomNavigation
              value={bottomNavValue}
              onChange={handleBottomNavChange}
              showLabels={!isExtremeSmall}
            >
              {mobileNavigationItems.map((item) => (
                <StyledBottomNavigationAction
                  key={item.name}
                  icon={<item.icon />}
                  label={item.name}
                  onClick={item.action}
                />
              ))}
            </StyledBottomNavigation>
          </BottomAppBar>
        </Slide>
      )}

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawer}
      </MobileMenuDrawer>

      {/* Desktop Drawer */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                border: 'none',
                boxShadow: 2,
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
      )}

      <Main open={!isMobile}>
        <Toolbar sx={{
          [theme.breakpoints.down(300)]: {
            minHeight: 48,
          },
        }} />
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: {
              xs: 1,
              sm: 2,
              md: 3,
              [theme.breakpoints.down(300)]: 0.5,
              [theme.breakpoints.down(250)]: 0.25,
            },
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Container>
      </Main>
    </Box>
  );
};

export default Layout;
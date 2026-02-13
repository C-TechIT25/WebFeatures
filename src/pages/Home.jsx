import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  Container,
  IconButton,
  Fade,
  Zoom,
  useMediaQuery
} from '@mui/material';
import {
  Image as ImageIcon,
  ContentCut as ScissorsIcon,
  PictureAsPdf as PdfIcon,
  AutoFixHigh as AutoFixHighIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  CloudDone as CloudDoneIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled, useTheme } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[20],
    '&::before': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  [theme.breakpoints.down(350)]: {
    borderRadius: 12,
  },
  [theme.breakpoints.down(300)]: {
    borderRadius: 10,
  },
  [theme.breakpoints.down(250)]: {
    borderRadius: 8,
    '&::before': {
      height: '3px',
    },
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2.5),
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.down(350)]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius * 1.5,
  },
  [theme.breakpoints.down(300)]: {
    padding: theme.spacing(1.25),
  },
  [theme.breakpoints.down(250)]: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    fontSize: '3rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down(350)]: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1.5),
  },
  [theme.breakpoints.down(300)]: {
    fontSize: '1.35rem',
  },
  [theme.breakpoints.down(250)]: {
    fontSize: '1.2rem',
    marginBottom: theme.spacing(1),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
    marginBottom: theme.spacing(2.5),
  },
  [theme.breakpoints.down(350)]: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(2),
  },
  [theme.breakpoints.down(300)]: {
    fontSize: '1.35rem',
  },
  [theme.breakpoints.down(250)]: {
    fontSize: '1.2rem',
    marginBottom: theme.spacing(1.5),
  },
}));

const tools = [
  {
    title: 'Image Converter',
    description: 'Convert images between PNG, JPG, WEBP, ICO, and more formats instantly.',
    shortDesc: 'Convert images instantly',
    icon: ImageIcon,
    path: '/converter',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    stats: 'Converted 2.3K+ images',
    shortStats: '2.3K+',
  },
  {
    title: 'Background Remover',
    description: 'Remove image backgrounds automatically using AI directly in your browser.',
    shortDesc: 'Remove backgrounds',
    icon: ScissorsIcon,
    path: '/bg-remover',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    stats: 'Processed 1.5K+ images',
    shortStats: '1.5K+',
  },
  {
    title: 'PDF Editor',
    description: 'Add text, shapes, highlights, and annotations to PDF documents.',
    shortDesc: 'Edit PDFs easily',
    icon: PdfIcon,
    path: '/pdf-editor',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    stats: 'Edited 800+ PDFs',
    shortStats: '800+',
  },
  {
    title: 'Smart Image Tool',
    description: 'All-in-one tool: Remove background and convert formats simultaneously.',
    shortDesc: 'AI-powered tool',
    icon: AutoFixHighIcon,
    path: '/smart-tool',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    stats: 'Used 1.2K+ times',
    shortStats: '1.2K+',
  },
];

const Home = () => {
  const theme = useTheme();
  const isExtraSmall = useMediaQuery('(max-width:350px)');
  const isTiny = useMediaQuery('(max-width:300px)');
  const isMinimal = useMediaQuery('(max-width:250px)');

  const getStatValue = (full, short) => {
    if (isMinimal) return short;
    return full;
  };

  const getDescription = (full, short) => {
    if (isExtraSmall) return short;
    return full;
  };

  return (
    <Box sx={{ 
      py: { 
        xs: 3, 
        sm: 4, 
        md: 5,
        [theme.breakpoints.down(350)]: 2,
        [theme.breakpoints.down(250)]: 1.5,
      } 
    }}>
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          mb: { 
            xs: 4, 
            sm: 5, 
            md: 6,
            [theme.breakpoints.down(350)]: 3,
            [theme.breakpoints.down(250)]: 2,
          }, 
          textAlign: 'center' 
        }}
      >
        <HeroTitle
          variant="h2"
          component="h1"
          gutterBottom
        >
          {isMinimal ? 'Web Utility Hub' : 
           isTiny ? 'All-in-One Tools' :
           isExtraSmall ? 'Your Web Utility Hub' :
           'Your All-in-One Web Utility Hub'}
        </HeroTitle>
        
        <Typography 
          variant={isMinimal ? "body2" : isTiny ? "body1" : "h5"} 
          color="text.secondary" 
          sx={{ 
            mb: { 
              xs: 3, 
              sm: 4,
              [theme.breakpoints.down(350)]: 2,
            }, 
            maxWidth: 800, 
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 0 },
            fontSize: {
              xs: '1rem',
              sm: '1.25rem',
              [theme.breakpoints.down(350)]: '0.9rem',
              [theme.breakpoints.down(300)]: '0.85rem',
              [theme.breakpoints.down(250)]: '0.75rem',
            },
          }}
        >
          {isMinimal ? 'Fast, secure, free browser tools.' :
           isTiny ? 'Powerful tools in your browser. Secure & free.' :
           'Powerful tools running entirely in your browser. Secure, fast, and completely free.'}
        </Typography>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={{ 
        xs: 2, 
        sm: 3,
        [theme.breakpoints.down(350)]: 1.5,
        [theme.breakpoints.down(250)]: 1,
      }} sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
        <Grid item xs={12} md={4}>
          <Zoom in timeout={500}>
            <StatCard elevation={2}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: { xs: 48, sm: 56, [theme.breakpoints.down(350)]: 40, [theme.breakpoints.down(250)]: 32 }, 
                height: { xs: 48, sm: 56, [theme.breakpoints.down(350)]: 40, [theme.breakpoints.down(250)]: 32 } 
              }}>
                <SpeedIcon sx={{ fontSize: { xs: 24, sm: 28, [theme.breakpoints.down(350)]: 20, [theme.breakpoints.down(250)]: 16 } }} />
              </Avatar>
              <Box>
                <Typography variant={isMinimal ? "body1" : "h4"} fontWeight="bold" sx={{
                  fontSize: {
                    xs: '2rem',
                    sm: '2.125rem',
                    [theme.breakpoints.down(350)]: '1.5rem',
                    [theme.breakpoints.down(300)]: '1.35rem',
                    [theme.breakpoints.down(250)]: '1.1rem',
                  },
                }}>
                  100%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: {
                    xs: '0.875rem',
                    [theme.breakpoints.down(350)]: '0.75rem',
                    [theme.breakpoints.down(250)]: '0.65rem',
                  },
                }}>
                  {isMinimal ? 'Client-side' : 'Client-side Processing'}
                </Typography>
              </Box>
            </StatCard>
          </Zoom>
        </Grid>
        <Grid item xs={12} md={4}>
          <Zoom in timeout={700}>
            <StatCard elevation={2}>
              <Avatar sx={{ 
                bgcolor: 'success.main', 
                width: { xs: 48, sm: 56, [theme.breakpoints.down(350)]: 40, [theme.breakpoints.down(250)]: 32 }, 
                height: { xs: 48, sm: 56, [theme.breakpoints.down(350)]: 40, [theme.breakpoints.down(250)]: 32 } 
              }}>
                <CloudDoneIcon sx={{ fontSize: { xs: 24, sm: 28, [theme.breakpoints.down(350)]: 20, [theme.breakpoints.down(250)]: 16 } }} />
              </Avatar>
              <Box>
                <Typography variant={isMinimal ? "body1" : "h4"} fontWeight="bold" sx={{
                  fontSize: {
                    xs: '2rem',
                    sm: '2.125rem',
                    [theme.breakpoints.down(350)]: '1.5rem',
                    [theme.breakpoints.down(300)]: '1.35rem',
                    [theme.breakpoints.down(250)]: '1.1rem',
                  },
                }}>
                  {isMinimal ? 'No' : 'No Upload'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: {
                    xs: '0.875rem',
                    [theme.breakpoints.down(350)]: '0.75rem',
                    [theme.breakpoints.down(250)]: '0.65rem',
                  },
                }}>
                  {isMinimal ? 'Private' : 'Your files stay private'}
                </Typography>
              </Box>
            </StatCard>
          </Zoom>
        </Grid>
        <Grid item xs={12} md={4}>
          <Zoom in timeout={900}>
            <StatCard elevation={2}>
              <Avatar sx={{ 
                bgcolor: 'warning.main', 
                width: { xs: 48, sm: 56, [theme.breakpoints.down(350)]: 40, [theme.breakpoints.down(250)]: 32 }, 
                height: { xs: 48, sm: 56, [theme.breakpoints.down(350)]: 40, [theme.breakpoints.down(250)]: 32 } 
              }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 24, sm: 28, [theme.breakpoints.down(350)]: 20, [theme.breakpoints.down(250)]: 16 } }} />
              </Avatar>
              <Box>
                <Typography variant={isMinimal ? "body1" : "h4"} fontWeight="bold" sx={{
                  fontSize: {
                    xs: '2rem',
                    sm: '2.125rem',
                    [theme.breakpoints.down(350)]: '1.5rem',
                    [theme.breakpoints.down(300)]: '1.35rem',
                    [theme.breakpoints.down(250)]: '1.1rem',
                  },
                }}>
                  10K+
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: {
                    xs: '0.875rem',
                    [theme.breakpoints.down(350)]: '0.75rem',
                    [theme.breakpoints.down(250)]: '0.65rem',
                  },
                }}>
                  {isMinimal ? 'Files' : 'Files processed'}
                </Typography>
              </Box>
            </StatCard>
          </Zoom>
        </Grid>
      </Grid>

      {/* Tools Grid */}
      <SectionTitle variant="h4" component="h2">
        {isMinimal ? 'Tools' : 'Available Tools'}
      </SectionTitle>
      
      <Grid container spacing={{ 
        xs: 2, 
        sm: 3,
        [theme.breakpoints.down(350)]: 1.5,
        [theme.breakpoints.down(250)]: 1,
      }}>
        {tools.map((tool, index) => (
          <Grid item xs={12} sm={6} lg={3} key={tool.title}>
            <Fade in timeout={1000 + index * 200}>
              <StyledCard
                component={motion.div}
                whileHover={{ y: isExtraSmall ? -4 : -8 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: { 
                    xs: 2, 
                    sm: 2.5,
                    [theme.breakpoints.down(350)]: 1.75,
                    [theme.breakpoints.down(300)]: 1.5,
                    [theme.breakpoints.down(250)]: 1.25,
                  },
                  '&:last-child': { 
                    pb: { 
                      xs: 2, 
                      sm: 2.5,
                      [theme.breakpoints.down(350)]: 1.75,
                      [theme.breakpoints.down(250)]: 1.25,
                    } 
                  },
                }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: { xs: 1.5, sm: 2, [theme.breakpoints.down(250)]: 1 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      textAlign: { xs: 'center', sm: 'left' },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: tool.color,
                        background: tool.gradient,
                        width: { 
                          xs: 48, 
                          sm: 56,
                          [theme.breakpoints.down(350)]: 44,
                          [theme.breakpoints.down(300)]: 40,
                          [theme.breakpoints.down(250)]: 36,
                        },
                        height: { 
                          xs: 48, 
                          sm: 56,
                          [theme.breakpoints.down(350)]: 44,
                          [theme.breakpoints.down(300)]: 40,
                          [theme.breakpoints.down(250)]: 36,
                        },
                        mr: { xs: 0, sm: 2 },
                        mb: { xs: 1, sm: 0 },
                      }}
                    >
                      <tool.icon sx={{ 
                        fontSize: { 
                          xs: 24, 
                          sm: 28,
                          [theme.breakpoints.down(350)]: 22,
                          [theme.breakpoints.down(250)]: 20,
                        } 
                      }} />
                    </Avatar>
                    <Typography 
                      variant={isMinimal ? "body2" : "h6"} 
                      component="h3" 
                      fontWeight="bold"
                      sx={{
                        fontSize: {
                          xs: '1rem',
                          sm: '1.25rem',
                          [theme.breakpoints.down(350)]: '0.95rem',
                          [theme.breakpoints.down(300)]: '0.9rem',
                          [theme.breakpoints.down(250)]: '0.85rem',
                        },
                      }}
                    >
                      {isMinimal && tool.title === 'Image Converter' ? 'Converter' :
                       isMinimal && tool.title === 'Background Remover' ? 'BG Remover' :
                       isMinimal && tool.title === 'PDF Editor' ? 'PDF' :
                       isMinimal && tool.title === 'Smart Image Tool' ? 'Smart' :
                       tool.title}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: { xs: 1.5, sm: 2 },
                      fontSize: {
                        xs: '0.875rem',
                        [theme.breakpoints.down(350)]: '0.8rem',
                        [theme.breakpoints.down(300)]: '0.75rem',
                        [theme.breakpoints.down(250)]: '0.7rem',
                      },
                      textAlign: { xs: 'center', sm: 'left' },
                    }}
                  >
                    {getDescription(tool.description, tool.shortDesc)}
                  </Typography>
                  
                  <Chip
                    label={getStatValue(tool.stats, tool.shortStats)}
                    size={isMinimal ? "small" : "small"}
                    sx={{
                      bgcolor: `${tool.color}20`,
                      color: tool.color,
                      fontWeight: 500,
                      width: { xs: '100%', sm: 'auto' },
                      '& .MuiChip-label': {
                        fontSize: {
                          xs: '0.75rem',
                          [theme.breakpoints.down(350)]: '0.7rem',
                          [theme.breakpoints.down(250)]: '0.65rem',
                        },
                      },
                    }}
                  />
                </CardContent>
                
                <CardActions sx={{ 
                  p: { 
                    xs: 2, 
                    sm: 2.5,
                    [theme.breakpoints.down(350)]: 1.75,
                    [theme.breakpoints.down(250)]: 1.25,
                  }, 
                  pt: 0 
                }}>
                  <Button
                    component={RouterLink}
                    to={tool.path}
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForwardIcon sx={{ 
                      fontSize: { 
                        xs: 20, 
                        [theme.breakpoints.down(350)]: 18,
                        [theme.breakpoints.down(250)]: 16,
                      } 
                    }} />}
                    sx={{
                      background: tool.gradient,
                      py: { xs: 1, sm: 1.5, [theme.breakpoints.down(250)]: 0.75 },
                      fontSize: {
                        xs: '0.875rem',
                        [theme.breakpoints.down(350)]: '0.8rem',
                        [theme.breakpoints.down(250)]: '0.7rem',
                      },
                      '&:hover': {
                        background: tool.gradient,
                        filter: 'brightness(1.1)',
                      },
                    }}
                  >
                    {isMinimal ? 'Open' : 'Open Tool'}
                  </Button>
                </CardActions>
              </StyledCard>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import loaderImage from '../assets/logo.svg';

const Loader = ({ text = "Cargando Datos..." }) => (
  <Box className="loader-root">
    <div className="loader-backdrop" />
    <Box className="loader-image-container-reveal">
      <img src={loaderImage} alt="Cargando" className="loader-image-reveal" />
      <div className="loader-reveal-overlay" />
    </Box>
    <Typography
      variant="h6"
      color="primary"
      sx={{ mt: 3, fontWeight: 'bold', letterSpacing: 2 }}
    >
      {text}
    </Typography>
  </Box>
);

export default Loader;
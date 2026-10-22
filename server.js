import express  from 'express';
import 'dotenv/config';
import ventasRoutes from './routes/ventas';

const app = express();
//1. Middleware para procesar req.body
app.use(express.json());
//2. Montamos
app.use('/api/v1/ventas', ventasRoutes);

//Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
});

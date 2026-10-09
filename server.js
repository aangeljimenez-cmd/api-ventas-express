import express  from 'express';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();

app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10 
});

app.get('/api/v1/ventas/consolidado', async (req, res) => {
    try{
       const {sucursal, anio} = req.query;

       //Validación de parámetros obligatorios
       if(!sucursal || !anio) {
        return res.status(400).json({error: 'Bad request', message: 'Debe enviar ambos parámetros'});
       }
       //Se ejecuta el SP en BD
       const [rows] = await pool.query('CALL db_ventas_tech(?, ?)', [sucursal, anio]);
       //Enviamos la respuesta al cliente
       res.status(200).json({
        status: 'success',
        total_registros: rows[0] ? rows[0].length : 0,
        data: rows[0]
       })
    }catch (error) {
        console.log('Error en GET /ventas/consolidado', error);
        res.status(500).json({error: ' Internal Server Error', message: 'Error en MYSQL'});
    }
});

//Endpoint get: consultar sobre venta en especifico

app.get('/api/v1/ventas/consolidado', async (req, res) => {
    try{
       const {idVenta} = req.query;

       //Validación de parámetros obligatorios
       if(idVenta) {
        return res.status(400).json({error: 'Bad request', message: 'El parametro es obligatorio'});
       }
       //Se ejecuta el SP en BD
       const [rows] = await pool.query('CALL sp_venta_id(?)', [idVenta]);
       //Enviamos la respuesta al cliente
       res.status(200).json({
        status: 'success',
        total_registros: rows[0] ? rows[0].length : 0,
        data: rows[0]
       })
    }catch (error) {
        console.log('Error en GET /ventas/consolidado', error);
        res.status(500).json({error: ' Internal Server Error', message: 'Error en MYSQL'});
    }
});
//endpoint post: ingresar nueva venta

app.post('/api/v1/ventas', async (req, res) => {
    try{
       const{id_producto, id_cliente, cantidad, fecha_venta} =req.body;

       //Validación de datos
       if(!id_producto || id_cliente || cantidad || fecha_venta) {
        return res.status(400).json({error: 'Bad request', message: 'Todos los parametros son obligatorios'});
       }
       //Inserta datos en la BD
       await pool.query('CALL db_registrar_venta(?, ?, ?, ?)'[id_producto, id_cliente, cantidad, fecha_venta]);
    }catch (error) {
        console.log('Error en POST /ventas: ', error);
        res.status(500).json({error: ' Internal Server Error', message: 'Error en MYSQL'});
    }
    //Respuesta 201 Created
    res.status(201).json({
        status: 'Created',
        message: 'Venta registrada exitosamente',
        datos_registrados: {id_producto, id_cliente, cantidad, fecha_venta}
    });
});

//Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
});

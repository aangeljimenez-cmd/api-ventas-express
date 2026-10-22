import { Router } from "express";
import { Pool } from "../db.js";

const router = Router();


router.get('/consolidado', async (req, res) => {
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

//Endpoint GET: Consultar venta según el id 
router.get('/', async (req, res) => {
    try {
        const { idVenta } = req.query;

        // Validación: si NO viene idVenta, retorna error
        if (!idVenta) {
            return res.status(400).json({ error: 'Bad Request', message: 'El parámetro idVenta es obligatorio' });
        }

        // Se ejecuta el SP en BD
        const [rows] = await pool.query('CALL sp_venta_id(?)', [idVenta]);

        // rows[0] contiene las filas devueltas por el Stored Procedure
        const resultado = rows[0] || [];

        // Enviamos la respuesta al cliente
        res.status(200).json({
            status: 'success',
            total_registros: resultado.length,
            data: resultado
        });
    } catch (error) {
        console.error('Error en GET /ventas/consolidado', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Error en MYSQL' });
    }
});
//endpoint post: ingresar nueva venta

router.post('/', async (req, res) => {
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

export default router;
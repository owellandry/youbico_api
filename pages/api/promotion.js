import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

// Manejo de la solicitud
export default async function handler(req, res) {
    console.log('Iniciando manejo de la solicitud...');

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        console.log('Solicitud OPTIONS recibida.');
        return res.status(200).end();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.error('Token requerido pero no proporcionado.');
        return res.status(401).json({ success: false, message: 'Token requerido.' });
    }

    try {
        console.log('Verificando el token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);

        // Manejar método GET
        if (req.method === 'GET') {
            console.log('Método GET recibido. Obteniendo promociones...');
            const [promotions] = await pool.query('SELECT * FROM promotions');
            return res.status(200).json({ success: true, data: promotions });
        }

        // Manejar método POST
        if (req.method === 'POST') {
            console.log('Método POST recibido. Procesando la carga...');
            const { business_id, description, start_date, end_date, image_url } = req.body;

            if (!business_id || !description || !start_date || !end_date) {
                console.error('Faltan datos de la promoción.');
                return res.status(400).json({ success: false, message: 'Faltan datos de la promoción.' });
            }

            console.log(`Datos de la promoción: ${description}, desde ${start_date} hasta ${end_date}, imagen: ${image_url}`);

            console.log('Ejecutando consulta a la base de datos para insertar la promoción...');
            const [result] = await pool.query('INSERT INTO promotions (business_id, description, start_date, end_date, image_url) VALUES (?, ?, ?, ?, ?)', 
                [business_id, description, start_date, end_date, image_url]);
            console.log('Promoción añadida, ID:', result.insertId);
            return res.status(201).json({ success: true, message: 'Promoción añadida exitosamente.', id: result.insertId });
        }

        // Manejar método PUT
        if (req.method === 'PUT') {
            const { id, business_id, description, start_date, end_date, image_url } = req.body;

            if (!id || !business_id || !description || !start_date || !end_date) {
                return res.status(400).json({ success: false, message: 'Faltan datos para actualizar la promoción.' });
            }

            console.log(`Actualizando promoción con ID: ${id}`);
            await pool.query('UPDATE promotions SET business_id = ?, description = ?, start_date = ?, end_date = ?, image_url = ? WHERE id = ?', 
                [business_id, description, start_date, end_date, image_url, id]);
            return res.status(200).json({ success: true, message: 'Promoción actualizada exitosamente.' });
        }

        // Manejar método DELETE
        if (req.method === 'DELETE') {
            const id = req.query.id || req.body.id;

            if (!id) {
                return res.status(400).json({ success: false, message: 'ID requerido.' });
            }

            console.log(`Eliminando promoción con ID: ${id}`);
            await pool.query('DELETE FROM promotions WHERE id = ?', [id]);
            return res.status(200).json({ success: true, message: 'Promoción eliminada exitosamente.' });
        }

        console.error('Método no permitido:', req.method);
        return res.status(405).json({ success: false, message: 'Método no permitido.' });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
    }
}

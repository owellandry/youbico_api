import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import validator from 'validator';

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
            console.log('Método GET recibido. Obteniendo categorías...');
            const [categories] = await pool.query('SELECT * FROM categories');
            return res.status(200).json({ success: true, data: categories });
        }

        // Manejar método POST
        if (req.method === 'POST') {
            console.log('Método POST recibido. Procesando la carga...');
            const { name, icon } = req.body;

            if (!name || !icon) {
                console.error('Faltan datos de la categoría: nombre o icono no proporcionados.');
                return res.status(400).json({ success: false, message: 'Faltan datos de la categoría.' });
            }

            // Usando validator.js para validar la URL
            if (!validator.isURL(icon, { protocols: ['http', 'https'], require_tld: true })) {
                console.error('URL del icono no válida:', icon);
                return res.status(400).json({ success: false, message: 'URL del icono no válida.' });
            }

            console.log(`Nombre de la categoría: ${name}`);
            console.log(`Icono URL: ${icon}`);

            console.log('Ejecutando consulta a la base de datos para insertar la categoría...');
            const [result] = await pool.query('INSERT INTO categories (name, icon) VALUES (?, ?)', [name, icon]);
            console.log('Categoría añadida, ID:', result.insertId);
            return res.status(201).json({ success: true, message: 'Categoría añadida exitosamente.', id: result.insertId });
        }

        // Manejar método DELETE
        if (req.method === 'DELETE') {
            const id = req.query.id || req.body.id;

            if (!id) {
                return res.status(400).json({ success: false, message: 'ID requerido.' });
            }

            console.log(`Eliminando categoría con ID: ${id}`);

            // Eliminar negocios asociados
            await pool.query('DELETE FROM businesses WHERE category_id = ?', [id]);

            // Ahora eliminar la categoría
            await pool.query('DELETE FROM categories WHERE id = ?', [id]);
            return res.status(200).json({ success: true, message: 'Categoría eliminada exitosamente.' });
        }

        // Manejar método PUT
        if (req.method === 'PUT') {
            const { id, name, icon } = req.body;

            if (!id || !name || !icon) {
                return res.status(400).json({ success: false, message: 'Faltan datos para actualizar la categoría.' });
            }

            console.log(`Actualizando categoría con ID: ${id}`);
            await pool.query('UPDATE categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id]);
            return res.status(200).json({ success: true, message: 'Categoría actualizada exitosamente.' });
        }

        console.error('Método no permitido:', req.method);
        return res.status(405).json({ success: false, message: 'Método no permitido.' });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
    }
}

import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    // Manejar preflight request de CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token requerido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);

        const { id } = req.query;

        if (req.method === 'POST') {
            const { name, description, location, coordinates, category, openingHours, contactPhone, contactEmail, whatsapp, franchise, website, franchiseDetails, logo } = req.body;
            const { lat, lng } = coordinates;

            if (!name || !description || !location || !coordinates || !category || !openingHours || !lat || !lng || !logo) {
                return res.status(400).json({ success: false, message: 'Faltan datos del negocio.' });
            }

            await pool.query(
                `INSERT INTO businesses (name, description, location, latitude, longitude, category, opening_hours_open, opening_hours_close, contact_phone, contact_email, whatsapp, franchise, website, franchise_details, logo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name, description, location, lat, lng, category, openingHours.open, openingHours.close,
                    contactPhone, contactEmail, whatsapp, franchise, website, franchiseDetails, logo
                ]
            );

            return res.status(201).json({ success: true, message: 'Negocio añadido correctamente.' });

        } else if (req.method === 'GET') {
            // Lógica para obtener todos los negocios
            const [businesses] = await pool.query('SELECT * FROM businesses'); // Asegúrate de que devuelva solo un array
            return res.status(200).json({ success: true, data: businesses });

        } else if (req.method === 'PUT') {
            // Lógica para actualizar un negocio
            if (!id) {
                return res.status(400).json({ success: false, message: 'Falta el ID del negocio.' });
            }

            const { name, description, location, coordinates, category, openingHours, contactPhone, contactEmail, whatsapp, franchise, website, franchiseDetails, logo } = req.body;
            const { lat, lng } = coordinates;

            if (!name || !description || !location || !coordinates || !category || !openingHours || !lat || !lng || !logo) {
                return res.status(400).json({ success: false, message: 'Faltan datos del negocio.' });
            }

            await pool.query(
                `UPDATE businesses SET name = ?, description = ?, location = ?, latitude = ?, longitude = ?, category = ?, opening_hours_open = ?, opening_hours_close = ?, contact_phone = ?, contact_email = ?, whatsapp = ?, franchise = ?, website = ?, franchise_details = ?, logo = ? WHERE id = ?`,
                [
                    name, description, location, lat, lng, category, openingHours.open, openingHours.close,
                    contactPhone, contactEmail, whatsapp, franchise, website, franchiseDetails, logo, id
                ]
            );

            return res.status(200).json({ success: true, message: 'Negocio actualizado correctamente.' });

        } else if (req.method === 'DELETE') {
            // Lógica para eliminar un negocio
            if (!id) {
                return res.status(400).json({ success: false, message: 'Falta el ID del negocio.' });
            }

            await pool.query(`DELETE FROM businesses WHERE id = ?`, [id]);

            return res.status(200).json({ success: true, message: 'Negocio eliminado correctamente.' });

        } else {
            return res.status(405).json({ success: false, message: 'Método no permitido.' });
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
    }
}

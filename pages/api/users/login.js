import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export default async function handler(req, res) {
  // Configurar CORS para todas las solicitudes
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request de CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); 
  }

  // Manejar solicitud POST (login)
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Faltan datos de inicio de sesión.' });
    }

    try {
      const [user] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);

      if (user.length === 0) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
      }

      const isPasswordValid = bcrypt.compareSync(password, user[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
      }

      // Generar el token de JWT
      const token = jwt.sign({ id: user[0].id, username: user[0].username }, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      // Modificar la respuesta para incluir el usuario
      return res.status(200).json({ success: true, token, user: { id: user[0].id, username: user[0].username } });
    } catch (error) {
      console.error('Error en el servidor:', error);
      return res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
  }

  // Método no permitido
  return res.status(405).json({ success: false, message: 'Método no permitido.' });
}

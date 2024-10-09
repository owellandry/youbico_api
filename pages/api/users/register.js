import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      console.error('Faltan datos de registro:', req.body);
      return res.status(400).json({ success: false, message: 'Faltan datos de registro.' });
    }

    try {
      const [existingUser] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);

      if (existingUser.length > 0) {
        console.error('El usuario ya existe:', username);
        return res.status(400).json({ success: false, message: 'El usuario ya existe.' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      // No se necesita generar el ID, la base de datos lo manejará
      await pool.query('INSERT INTO admin (username, password) VALUES (?, ?)', [username, hashedPassword]);

      // Obtén el ID del último usuario insertado
      const [newUser] = await pool.query('SELECT LAST_INSERT_ID() AS id');
      const token = jwt.sign({ id: newUser[0].id, username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(201).json({ success: true, message: 'Usuario registrado exitosamente.', token });
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      return res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
  } else {
    console.error('Método no permitido:', req.method);
    res.status(405).json({ success: false, message: 'Método no permitido.' });
  }
}

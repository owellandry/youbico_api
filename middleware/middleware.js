//middleware/middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Asegúrate de que esta variable esté en .env

export function middleware(req) {
  const token = req.headers.get('authorization')?.split(' ')[1]; // Obtén el token del encabezado Authorization

  if (!token) {
    console.error('Token no proporcionado');
    return NextResponse.json({ success: false, message: 'Token no proporcionado.' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Añadir el usuario decodificado al request
  } catch (error) {
    console.error('Token inválido o expirado:', error);
    return NextResponse.json({ success: false, message: 'Token inválido o expirado.' }, { status: 403 });
  }

  return NextResponse.next();
}

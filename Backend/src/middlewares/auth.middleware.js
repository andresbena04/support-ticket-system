import { verifyAccessToken, verifySuperUserToken } from "../services/auth.service.js";

/* export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
export const authenticateSuperToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  try {
    const decoded = verifySuperUserToken(token);
    
    // Si la verificación es exitosa, se adjunta el usuario al request
    req.user = decoded;
    next();  
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
 */
// Middleware que permite la autenticación con accessToken o superuserToken
export const authenticateUserToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  try {
    // Intentar verificar el superuserToken primero
    let decoded = verifySuperUserToken(token);
    req.user = decoded; // Si es un superusuario, se adjunta al req
    return next(); // Continuar con el siguiente middleware si es superusuario

  } catch (error) {
    // Si no es superusuario, intentamos verificar como usuario normal
    try {
      let decoded = verifyAccessToken(token);
      req.user = decoded; // Si es un accessToken válido, se decodifica y se adjunta al req
      return next(); // Continuar con el siguiente middleware si es un usuario normal
    } catch (error) {
      // Si ambos fallan, enviamos un error detallado
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  }
};


// Middleware que solo permite el superuserToken
export const authenticateSuperToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  try {
    const decoded = verifySuperUserToken(token); 
    req.user = decoded; // Si es válido, se adjunta al req
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

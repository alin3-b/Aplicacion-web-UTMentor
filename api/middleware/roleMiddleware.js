// api/middleware/roleMiddleware.js
export function roleMiddleware(rolesPermitidos = []) {
    return (req, res, next) => {
        const { roles } = req.usuario; // viene del authMiddleware
        const tieneAcceso = roles.some(r => rolesPermitidos.includes(r));
        if (!tieneAcceso) {
            return res.status(403).json({ error: "Acceso denegado" });
        }
        next();
    };
}

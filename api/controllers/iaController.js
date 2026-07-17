// controllers/iaController.js
import fetch from 'node-fetch';  // Necesitas instalar: npm install node-fetch

const API_KEY = process.env.IA_KEY;
const MODEL = process.env.IA_MODEL || 'gemini-2.0-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export async function generarDescripcion(req, res) {
    try {
        const { nombre, carrera, semestre, temas, area, rating, totalClases } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El campo 'nombre' es obligatorio" });
        }

        const prompt = `Eres un redactor experto en plataformas de mentorías académicas. 
Tu tarea es generar un texto corto (1-2 oraciones máximo) que explique por qué este asesor es una excelente opción para los estudiantes, destacando sus fortalezas de forma natural y convincente:
{
  "descripcion": "Aquí va el texto persuasivo"
}

Datos del asesor:
Nombre: ${nombre}
Carrera: ${carrera || 'Ingeniería'}
Semestre: ${semestre ? `${semestre}° semestre` : 'avanzado'}
Área: ${area || 'Ciencias/Tecnología'}
Temas que domina: ${Array.isArray(temas) ? temas.join(', ') : 'varios temas'}
Calificación promedio: ${rating || '4.9'}/5.0
Total de sesiones impartidas: ${totalClases || 'más de 40'}

El texto debe ser profesional, cercano y motivar al estudiante a reservar. Usa "este asesor", "él/ella", o el nombre directamente. NO uses primera persona ("yo"). NO agregues texto fuera del JSON.`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    responseMimeType: "application/json"  // ¡Clave! Fuerza JSON directo
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Respuesta de Gemini:", data);

        // Extrae el JSON directamente (gracias a responseMimeType)
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) {
            throw new Error('Respuesta inválida de Gemini');
        }

        // Si no es JSON puro, parsea (fallback)
        let descripcionObj;
        try {
            descripcionObj = typeof textResult === 'string' ? JSON.parse(textResult) : textResult;
        } catch (parseErr) {
            // Si falla el parse, usa el texto como fallback
            descripcionObj = { descripcion: textResult.trim() };
        }

        res.json({ descripcion: descripcionObj.descripcion || descripcionObj });

    } catch (error) {
        console.error('Error con Gemini:', error.message);
        res.status(500).json({ 
            error: 'No se pudo generar la descripción', 
            detalles: error.message 
        });
    }
}
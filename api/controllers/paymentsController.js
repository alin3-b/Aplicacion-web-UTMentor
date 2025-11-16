// api/controllers/paymentsController.js
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =============================
//     CREAR DONACIÓN
// =============================
export async function crearDonacion(req, res) {
    try {
        const { amount, currency = "mxn" } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "El monto es inválido" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // centavos
            currency,
            automatic_payment_methods: { enabled: true },
            description: "Donación para la plataforma UTmentor",
            metadata: {
                tipo: "donacion",
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error al crear donación:", error);
        res.status(500).json({ error: "Error al procesar la donación" });
    }
}

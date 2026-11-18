<?php

namespace App\Services;

use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\StripeClient;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $secretKey = config('services.stripe.secret');

        if (empty($secretKey)) {
            throw new \RuntimeException('La clave secreta de Stripe no está configurada.');
        }

        Stripe::setApiKey($secretKey);
        $this->stripe = new StripeClient($secretKey);
    }

    /**
     * Crear una sesión de pago en Stripe Checkout.
     */
    public function crearSesionPago(
        int $compraId,
        int $valor,
        string $descripcion,
        string $moneda = 'COP'
    ): array {
        $moneda = strtoupper($moneda);

        $sesion = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => $moneda,
                    'product_data' => [
                        'name' => $descripcion,
                    ],
                    'unit_amount' => $valor,
                ],
                'quantity' => 1,
            ]],
            'metadata' => [
                'compra_id' => (string) $compraId,
            ],
            'success_url' => url('/pago/exitoso') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => url('/pago/cancelado'),
        ]);

        return [
            'id' => $sesion->id,
            'url' => $sesion->url,
            'payment_intent' => $sesion->payment_intent ?? null,
        ];
    }

    public function consultarSesion(string $sessionId): ?Session
    {
        try {
            return $this->stripe->checkout->sessions->retrieve($sessionId, [
                'expand' => ['payment_intent'],
            ]);
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function verificarFirmaWebhook(string $payload, ?string $signature): \Stripe\Event
    {
        $secret = config('services.stripe.webhook_secret');

        if (empty($secret)) {
            throw new \RuntimeException('El secreto del webhook de Stripe no está configurado.');
        }

        if (empty($signature)) {
            throw new SignatureVerificationException('Falta la firma del webhook.', $payload, 'missing');
        }

        return Webhook::constructEvent($payload, $signature, $secret);
    }
}

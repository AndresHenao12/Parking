<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compra_id')->constrained('compras')->cascadeOnDelete();
            $table->string('proveedor')->default('stripe');
            $table->string('referencia_externa')->nullable();
            $table->string('session_id')->nullable()->unique();
            $table->string('payment_intent_id')->nullable();
            $table->decimal('monto', 10, 2)->default(0);
            $table->string('moneda', 10)->default('COP');
            $table->string('estado')->default('pendiente');
            $table->string('metodo_pago')->nullable();
            $table->json('respuesta_proveedor')->nullable();
            $table->dateTime('pagado_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};

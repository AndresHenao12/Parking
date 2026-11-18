<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boletas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compra_id')->constrained('compras')->cascadeOnDelete();
            $table->foreignId('funcion_id')->constrained('funciones')->restrictOnDelete();
            $table->foreignId('silla_id')->constrained('sillas')->restrictOnDelete();
            $table->string('codigo_boleta')->unique();
            $table->decimal('precio', 10, 2);
            $table->string('estado')->default('pendiente');
            $table->timestamps();

            $table->unique(['funcion_id', 'silla_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boletas');
    }
};

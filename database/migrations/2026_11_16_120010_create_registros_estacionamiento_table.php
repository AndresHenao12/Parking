<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registros_estacionamiento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->cascadeOnDelete();
            $table->foreignId('celda_id')->constrained('celdas')->cascadeOnDelete();
            $table->foreignId('tarifa_id')->nullable()->constrained('tarifas')->nullOnDelete();
            $table->dateTime('hora_entrada');
            $table->dateTime('hora_salida')->nullable();
            $table->unsignedInteger('tiempo_minutos')->default(0);
            $table->decimal('valor_total', 10, 2)->default(0);
            $table->string('estado', 20)->default('activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registros_estacionamiento');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('placa', 20)->unique();
            $table->string('marca', 80);
            $table->string('modelo', 80);
            $table->string('color', 50);
            $table->string('tipo_vehiculo', 30);
            $table->string('propietario', 150);
            $table->string('telefono_propietario', 30)->nullable();
            $table->string('estado', 30)->default('activo');
            $table->text('observacion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};

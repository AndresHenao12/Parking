<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sucursales', function (Blueprint $table) {
            $table->id();
        // Llave foránea hacia ciudades
            $table->foreignId('ciudad_id')->constrained('ciudades')->onDelete('cascade');
            $table->string('nombre', 150);
            $table->string('direccion', 255);
            $table->string('descripcion', 500)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sucursales');
    }
};

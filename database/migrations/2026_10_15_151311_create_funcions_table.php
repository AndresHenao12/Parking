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
    Schema::create('funciones', function (Blueprint $table) {
        $table->id();
        
        // Relaciones con películas y salas con restricción de borrado si tienen funciones activas
        $table->foreignId('pelicula_id')->constrained('peliculas')->restrictOnDelete();
        $table->foreignId('sala_id')->constrained('salas')->restrictOnDelete();

        $table->date('fecha');
        $table->time('hora_inicio');
        $table->time('hora_fin');
        $table->decimal('precio', 8, 2);
        $table->boolean('estado')->default(true);
        $table->timestamps();

        // Índice para optimizar búsquedas y validación de cruces por sala y día
        $table->index(['sala_id', 'fecha']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funciones');
    }
};

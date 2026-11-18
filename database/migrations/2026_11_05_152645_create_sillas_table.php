<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sillas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained('salas')->cascadeOnDelete();
            $table->string('fila', 10)->nullable();
            $table->unsignedInteger('numero');
            $table->string('estado')->default('disponible');
            $table->string('codigo')->nullable()->unique();
            $table->timestamps();

            $table->unique(['sala_id', 'numero', 'fila']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sillas');
    }
};

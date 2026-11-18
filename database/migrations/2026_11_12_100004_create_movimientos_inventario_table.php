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
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')
                ->constrained('productos')
                ->onDelete('cascade');
            $table->enum('tipo', ['entrada', 'salida'])->index();
            $table->integer('cantidad');
            $table->integer('stock_anterior');
            $table->integer('stock_nuevo');
            $table->string('motivo', 100)->index();
            $table->text('observacion')->nullable();
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('restrict');
            $table->foreignId('trabajador_id')
                ->nullable()
                ->constrained('trabajadores')
                ->nullOnDelete();
            $table->foreignId('venta_producto_id')
                ->nullable()
                ->constrained('ventas_productos')
                ->nullOnDelete();
            $table->dateTime('fecha')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
    }
};

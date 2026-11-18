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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_producto_id')
                ->constrained('categorias_productos')
                ->onDelete('restrict');
            $table->string('nombre', 150)->index();
            $table->text('descripcion')->nullable();
            $table->decimal('precio_venta', 12, 2);
            $table->decimal('costo_compra', 12, 2)->default(0);
            $table->integer('cantidad_disponible')->default(0)->index();
            $table->integer('stock_minimo')->default(5);
            $table->boolean('activo')->default(true)->index();
            $table->string('imagen', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};

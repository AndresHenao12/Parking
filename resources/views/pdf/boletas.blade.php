<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Boletas - {{ $compra->codigo_compra }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1f2937; margin: 30px; }
        .header { border-bottom: 2px solid #111827; margin-bottom: 24px; padding-bottom: 12px; }
        .title { font-size: 24px; font-weight: bold; }
        .meta { font-size: 12px; color: #374151; }
        .ticket { border: 1px solid #d1d5db; padding: 16px; margin-bottom: 18px; page-break-inside: avoid; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .label { font-weight: bold; }
        .pill { display: inline-block; background: #f3f4f6; border-radius: 9999px; padding: 4px 8px; font-size: 11px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Cine Nexo</div>
        <div class="meta">Compra: {{ $compra->codigo_compra }} | Estado: {{ strtoupper($compra->estado) }}</div>
    </div>

    @foreach($compra->boletas as $boleta)
        <div class="ticket">
            <div class="row">
                <span class="label">Boleta</span>
                <span class="pill">{{ $boleta->codigo_boleta }}</span>
            </div>
            <div class="row">
                <span class="label">Película</span>
                <span>{{ $boleta->funcion->pelicula->titulo ?? 'Película' }}</span>
            </div>
            <div class="row">
                <span class="label">Función</span>
                <span>{{ $boleta->funcion->fecha ?? '' }} {{ $boleta->funcion->hora_inicio ?? '' }}</span>
            </div>
            <div class="row">
                <span class="label">Sala</span>
                <span>{{ $boleta->funcion->sala->nombre ?? 'Sala' }}</span>
            </div>
            <div class="row">
                <span class="label">Silla</span>
                <span>{{ $boleta->silla->fila ?? '' }}{{ $boleta->silla->numero ?? '' }}</span>
            </div>
            <div class="row">
                <span class="label">Precio</span>
                <span>${{ number_format((float) $boleta->precio, 2, ',', '.') }}</span>
            </div>
        </div>
    @endforeach
</body>
</html>

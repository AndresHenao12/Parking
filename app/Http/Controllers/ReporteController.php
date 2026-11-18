<?php

namespace App\Http\Controllers;

use App\Models\Mensualidad;
use App\Models\RegistroEstacionamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeRole(['admin', 'operario']);

        $inicio = $request->query('inicio', now()->startOfMonth()->format('Y-m-d'));
        $fin = $request->query('fin', now()->format('Y-m-d'));

        $ingresos = (float) RegistroEstacionamiento::query()
            ->where('estado', 'finalizado')
            ->whereBetween('hora_salida', [
                $inicio.' 00:00:00',
                $fin.' 23:59:59',
            ])
            ->sum('valor_total');

        $ocupacion = DB::table('celdas')
            ->select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->get()
            ->map(fn ($item) => [
                'estado' => $item->estado,
                'total' => (int) $item->total,
            ]);

        $mensualidades = DB::table('mensualidades')
            ->select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')
            ->get()
            ->map(fn ($item) => [
                'estado' => $item->estado,
                'total' => (int) $item->total,
            ]);

        return Inertia::render('Park/Reportes/Index', [
            'filtros' => ['inicio' => $inicio, 'fin' => $fin],
            'ingresos' => $ingresos,
            'ocupacion' => $ocupacion,
            'mensualidades' => $mensualidades,
        ]);
    }
}

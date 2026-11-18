<?php

namespace App\Http\Controllers;

use App\Models\sillas;
use Illuminate\Http\Request;

class SillasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(sillas $sillas)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(sillas $sillas)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, sillas $sillas)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(sillas $sillas)
    {
        //
    }

    public function SillasDisponibles($id)
    {
        $sillas = sillas::where('funcion_id', $id)
            ->where('estado', 'disponible')
            ->get();
    }
}

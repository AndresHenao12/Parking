import { Head } from '@inertiajs/react';

export default function Cancelado({ mensaje }) {
    return (
        <>
            <Head title="Pago cancelado" />
            <div className="mx-auto max-w-2xl px-6 py-12">
                <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-amber-700">Pago cancelado</h1>
                    <p className="mt-3 text-sm text-slate-600">{mensaje ?? 'La operación fue cancelada antes de confirmar la compra.'}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a href="/funciones" className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                            Volver a funciones
                        </a>
                        <a href="/" className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Inicio
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

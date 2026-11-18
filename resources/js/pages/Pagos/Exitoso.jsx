import { Head } from '@inertiajs/react';

export default function Exitoso({ compra, session_id }) {
    const boletasUrl = compra ? `/compras/${compra.id}/boletas/pdf` : '#';

    return (
        <>
            <Head title="Compra confirmada" />
            <div className="mx-auto max-w-3xl px-6 py-12">
                <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-emerald-700">Compra confirmada</h1>
                    <p className="mt-3 text-sm text-slate-600">Tu pago fue verificado por Stripe.</p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Código de compra</p>
                            <p className="mt-1 text-lg font-semibold">{compra?.codigo_compra ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Sesión</p>
                            <p className="mt-1 text-lg font-semibold">{session_id ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                            <p className="mt-1 text-lg font-semibold">{compra?.estado ?? 'pagada'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                            <p className="mt-1 text-lg font-semibold">${Number(compra?.total ?? 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href={boletasUrl}
                            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                        >
                            Descargar boletas PDF
                        </a>
                        <a
                            href="/"
                            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Volver al cine
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

import { Head } from '@inertiajs/react';

export default function Index({
    filtros,
    ingresos,
    ocupacion,
    mensualidades,
}: {
    filtros: { inicio: string; fin: string };
    ingresos: number;
    ocupacion: Array<{ estado: string; total: number }>;
    mensualidades: Array<{ estado: string; total: number }>;
}) {
    return (
        <>
            <Head title="Reportes" />
            <main className="flex min-h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <header className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Administración</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Reportes</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">Ingresos, ocupación y mensualidades actuales del parqueadero.</p>
                </header>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Ingresos del período</p>
                        <p className="mt-2 text-2xl font-semibold">${Number(ingresos).toLocaleString('es-CO')}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Celdas ocupadas</p>
                        <p className="mt-2 text-2xl font-semibold">{ocupacion.find((item) => item.estado === 'ocupada')?.total ?? 0}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Mensualidades vigentes</p>
                        <p className="mt-2 text-2xl font-semibold">{mensualidades.find((item) => item.estado === 'vigente')?.total ?? 0}</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border bg-card p-4">
                        <h2 className="mb-4 font-medium">Ocupación</h2>
                        <ul className="space-y-2 text-sm">
                            {ocupacion.map((item) => (
                                <li key={item.estado} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                                    <span className="capitalize">{item.estado}</span>
                                    <span className="font-medium">{item.total}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-xl border bg-card p-4">
                        <h2 className="mb-4 font-medium">Mensualidades</h2>
                        <ul className="space-y-2 text-sm">
                            {mensualidades.map((item) => (
                                <li key={item.estado} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                                    <span className="capitalize">{item.estado}</span>
                                    <span className="font-medium">{item.total}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Período:</strong> {filtros.inicio} - {filtros.fin}
                </div>
            </main>
        </>
    );
}

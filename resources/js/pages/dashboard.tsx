import { Head } from '@inertiajs/react';
import { CarFront, CircleDollarSign, MapPinned, ParkingCircle, ShieldCheck, Users } from 'lucide-react';
import { dashboard } from '@/routes';

interface Stats {
    total_vehiculos: number;
    vehiculos_dentro: number;
    celdas_disponibles: number;
    celdas_ocupadas: number;
    total_empleados: number;
    ingresos_hoy: number;
    ingresos_mes: number;
}

interface Entry {
    id: number;
    vehiculo: string;
    celda: string;
    hora_entrada: string;
}

interface Exit {
    id: number;
    vehiculo: string;
    celda: string;
    valor_total: number;
    hora_salida: string;
}

export default function Dashboard({
    stats,
    recentEntries,
    recentExits,
}: {
    stats: Stats;
    recentEntries: Entry[];
    recentExits: Exit[];
}) {
    const cards = [
        { label: 'Total de vehículos', value: stats.total_vehiculos, icon: CarFront },
        { label: 'Vehículos dentro', value: stats.vehiculos_dentro, icon: ParkingCircle },
        { label: 'Celdas disponibles', value: stats.celdas_disponibles, icon: MapPinned },
        { label: 'Celdas ocupadas', value: stats.celdas_ocupadas, icon: ShieldCheck },
        { label: 'Total empleados', value: stats.total_empleados, icon: Users },
        { label: 'Ingresos del día', value: `$${Number(stats.ingresos_hoy).toLocaleString('es-CO')}`, icon: CircleDollarSign },
        { label: 'Ingresos del mes', value: `$${Number(stats.ingresos_mes).toLocaleString('es-CO')}`, icon: CircleDollarSign },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-8">
                <header className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Panel administrativo</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Dashboard ParkControl</h1>
                </header>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <div className="rounded-md bg-muted p-2">
                                    <Icon className="size-4 text-primary" />
                                </div>
                            </div>
                            <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
                        </div>
                    ))}
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-4">
                        <h2 className="mb-4 text-lg font-semibold">Últimos vehículos ingresados</h2>
                        <div className="space-y-3">
                            {recentEntries.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay registros activos.</p>
                            ) : (
                                recentEntries.map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                                        <div>
                                            <p className="font-medium">{entry.vehiculo}</p>
                                            <p className="text-xs text-muted-foreground">Celda {entry.celda}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{new Date(entry.hora_entrada).toLocaleString('es-CO')}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-4">
                        <h2 className="mb-4 text-lg font-semibold">Últimos vehículos retirados</h2>
                        <div className="space-y-3">
                            {recentExits.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay salidas registradas.</p>
                            ) : (
                                recentExits.map((exit) => (
                                    <div key={exit.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                                        <div>
                                            <p className="font-medium">{exit.vehiculo}</p>
                                            <p className="text-xs text-muted-foreground">Celda {exit.celda}</p>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            <p>${Number(exit.valor_total).toLocaleString('es-CO')}</p>
                                            <p>{new Date(exit.hora_salida).toLocaleString('es-CO')}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};

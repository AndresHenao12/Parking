import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    DollarSign,
    Printer,
    Receipt,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DetalleVenta {
    id: number;
    producto_id: number;
    producto?: {
        id: number;
        nombre: string;
        categoria?: {
            id: number;
            nombre: string;
        };
    };
    cantidad: number;
    precio_unitario: string | number;
    subtotal: string | number;
}

interface Venta {
    id: number;
    numero_venta: string;
    subtotal: string | number;
    total: string | number;
    cantidad_productos: number;
    estado: string;
    fecha_venta: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    trabajador?: {
        id: number;
        nombres: string;
        apellidos: string;
    };
    detalles: DetalleVenta[];
}

interface Props {
    venta: Venta;
}

export default function Show({ venta }: Props) {
    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return new Intl.DateTimeFormat('es-CO', {
                dateStyle: 'full',
                timeStyle: 'medium',
            }).format(d);
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            <Head title={`Venta ${venta.numero_venta} - Cafetería`} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
                {/* Cabecera y botón regresar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get('/cafeteria/ventas')}
                            className="h-8 w-8 p-0"
                            title="Volver al historial"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold font-mono tracking-tight text-primary">
                                    {venta.numero_venta}
                                </h1>
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    {venta.estado}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Registrada el {formatDate(venta.fecha_venta)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="gap-1.5"
                        >
                            <Printer className="size-3.5" />
                            Imprimir Comprobante
                        </Button>
                    </div>
                </div>

                {/* Tarjeta de Información General */}
                <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
                    <h2 className="text-sm font-semibold text-foreground border-b pb-2">
                        Información del Responsable
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Trabajador que atendió:
                            </p>
                            <p className="font-semibold text-foreground mt-0.5">
                                {venta.trabajador
                                    ? `${venta.trabajador.nombres} ${venta.trabajador.apellidos}`
                                    : 'No especificado (Venta general)'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Usuario en sesión de sistema:
                            </p>
                            <p className="font-medium text-foreground mt-0.5">
                                {venta.user?.name} ({venta.user?.email})
                            </p>
                        </div>
                    </div>
                </div>

                {/* Desglose de Productos */}
                <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <h2 className="text-sm font-semibold text-foreground">
                            Productos Vendidos ({venta.cantidad_productos} unidades)
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/20 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Ítem / Producto</th>
                                    <th className="px-4 py-3">Categoría</th>
                                    <th className="px-4 py-3 text-center">Cantidad</th>
                                    <th className="px-4 py-3 text-right">Precio Unitario</th>
                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {venta.detalles.map((detalle) => (
                                    <tr key={detalle.id}>
                                        <td className="px-4 py-3 font-semibold text-foreground">
                                            {detalle.producto?.nombre || `Producto #${detalle.producto_id}`}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {detalle.producto?.categoria?.nombre || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold">
                                            {detalle.cantidad}
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">
                                            {formatCurrency(detalle.precio_unitario)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground">
                                            {formatCurrency(detalle.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t bg-muted/20">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right font-semibold">
                                        Total Venta:
                                    </td>
                                    <td className="px-4 py-3 text-right text-lg font-bold text-primary">
                                        {formatCurrency(venta.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

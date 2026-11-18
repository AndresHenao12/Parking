import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    Filter,
    Package,
    Receipt,
    Search,
    ShoppingBag,
    UserCheck,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DetalleVenta {
    id: number;
    producto_id: number;
    producto?: {
        id: number;
        nombre: string;
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
        email?: string;
    };
    trabajador?: {
        id: number;
        nombres: string;
        apellidos: string;
    };
    detalles?: DetalleVenta[];
}

interface Trabajador {
    id: number;
    nombres: string;
    apellidos: string;
}

interface Props {
    ventas: {
        data: Venta[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    trabajadores: Trabajador[];
    filtros: {
        numero_venta: string;
        fecha_inicio: string;
        fecha_fin: string;
        trabajador_id: string;
        estado: string;
    };
    totales: {
        total_vendido: number;
        total_items: number;
    };
}

export default function Index({
    ventas,
    trabajadores,
    filtros,
    totales,
}: Props) {
    const [numeroVentaInput, setNumeroVentaInput] = useState(
        filtros.numero_venta || '',
    );
    const [fechaInicio, setFechaInicio] = useState(filtros.fecha_inicio || '');
    const [fechaFin, setFechaFin] = useState(filtros.fecha_fin || '');
    const [trabajadorId, setTrabajadorId] = useState(
        filtros.trabajador_id || '',
    );

    // Modal de Detalle de Venta
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

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
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(d);
        } catch {
            return dateStr;
        }
    };

    const handleApplyFilters = () => {
        router.get(
            '/cafeteria/ventas',
            {
                numero_venta: numeroVentaInput,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                trabajador_id: trabajadorId,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setNumeroVentaInput('');
        setFechaInicio('');
        setFechaFin('');
        setTrabajadorId('');
        router.get('/cafeteria/ventas', {}, { preserveState: true });
    };

    const handleOpenDetail = (venta: Venta) => {
        setSelectedVenta(venta);
    };

    return (
        <>
            <Head title="Historial de Ventas - Cafetería" />

            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Cabecera */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Receipt className="size-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                Historial de Ventas
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Consulta todas las órdenes de cafetería registradas, comprobantes y arqueos.
                        </p>
                    </div>

                    <Button
                        onClick={() => router.get('/cafeteria/pos')}
                        className="shadow-xs"
                    >
                        <ShoppingBag className="size-4 mr-2" />
                        Ir al POS (Nueva Venta)
                    </Button>
                </div>

                {/* Tarjetas de Métricas de Venta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-card p-4 shadow-2xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-medium">Total Facturado</span>
                            <DollarSign className="size-4 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mt-2">
                            {formatCurrency(totales.total_vendido)}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            En el período consultado
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-2xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-medium">Ventas Completadas</span>
                            <CheckCircle2 className="size-4 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mt-2">
                            {ventas.total}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Transacciones registradas
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-2xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-medium">Productos Despachados</span>
                            <Package className="size-4 text-sky-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mt-2">
                            {totales.total_items} uds.
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ítems vendidos en total
                        </p>
                    </div>
                </div>

                {/* Filtros de Búsqueda */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 rounded-xl border bg-card p-3 shadow-2xs items-end">
                    {/* Búsqueda por número de venta */}
                    <div className="space-y-1">
                        <Label className="text-xs">Número de Venta</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Ej. VTA-2026..."
                                value={numeroVentaInput}
                                onChange={(e) => setNumeroVentaInput(e.target.value)}
                                className="h-9 pl-8 text-xs font-mono"
                            />
                        </div>
                    </div>

                    {/* Fecha Desde */}
                    <div className="space-y-1">
                        <Label className="text-xs">Fecha Desde</Label>
                        <Input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="h-9 text-xs"
                        />
                    </div>

                    {/* Fecha Hasta */}
                    <div className="space-y-1">
                        <Label className="text-xs">Fecha Hasta</Label>
                        <Input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="h-9 text-xs"
                        />
                    </div>

                    {/* Trabajador */}
                    <div className="space-y-1">
                        <Label className="text-xs">Trabajador</Label>
                        <select
                            value={trabajadorId}
                            onChange={(e) => setTrabajadorId(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Todos los trabajadores</option>
                            {trabajadores.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombres} {t.apellidos}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleApplyFilters}
                            className="flex-1 h-9 text-xs"
                        >
                            <Filter className="size-3.5 mr-1" />
                            Filtrar
                        </Button>
                        {(numeroVentaInput ||
                            fechaInicio ||
                            fechaFin ||
                            trabajadorId) && (
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="h-9 text-xs px-2.5"
                                title="Limpiar filtros"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabla de Historial de Ventas */}
                <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">N° de Venta</th>
                                    <th className="px-4 py-3">Fecha y Hora</th>
                                    <th className="px-4 py-3">Trabajador Responsable</th>
                                    <th className="px-4 py-3 text-center">Cant. Ítems</th>
                                    <th className="px-4 py-3 text-right">Total Vendido</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-right">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {ventas.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No se encontraron ventas registradas con los filtros aplicados.
                                        </td>
                                    </tr>
                                ) : (
                                    ventas.data.map((venta) => {
                                        return (
                                            <tr
                                                key={venta.id}
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                {/* Número de venta */}
                                                <td className="px-4 py-3 font-mono font-bold text-xs text-primary">
                                                    {venta.numero_venta}
                                                </td>

                                                {/* Fecha */}
                                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDate(venta.fecha_venta)}
                                                </td>

                                                {/* Trabajador */}
                                                <td className="px-4 py-3 text-xs">
                                                    <div className="font-medium text-foreground">
                                                        {venta.trabajador
                                                            ? `${venta.trabajador.nombres} ${venta.trabajador.apellidos}`
                                                            : venta.user?.name || 'Administrador'}
                                                    </div>
                                                    {venta.trabajador && venta.user && (
                                                        <div className="text-[10px] text-muted-foreground">
                                                            Usuario: {venta.user.name}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Cantidad de productos */}
                                                <td className="px-4 py-3 text-center text-xs font-medium">
                                                    {venta.cantidad_productos} uds.
                                                </td>

                                                {/* Total vendido */}
                                                <td className="px-4 py-3 text-right font-bold text-foreground">
                                                    {formatCurrency(venta.total)}
                                                </td>

                                                {/* Estado */}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                        {venta.estado}
                                                    </Badge>
                                                </td>

                                                {/* Botón Ver Detalle */}
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDetail(venta)}
                                                        className="h-8 text-xs gap-1"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Ver Detalle
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal para ver Detalle de la Venta */}
            <Dialog
                open={!!selectedVenta}
                onOpenChange={(open) => !open && setSelectedVenta(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    {selectedVenta && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="font-mono text-lg text-primary">
                                        Venta {selectedVenta.numero_venta}
                                    </DialogTitle>
                                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                        {selectedVenta.estado}
                                    </Badge>
                                </div>
                                <DialogDescription className="text-xs">
                                    Registrada el {formatDate(selectedVenta.fecha_venta)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                {/* Info del operador */}
                                <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Trabajador responsable:</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedVenta.trabajador
                                                ? `${selectedVenta.trabajador.nombres} ${selectedVenta.trabajador.apellidos}`
                                                : selectedVenta.user?.name || 'Administrador'}
                                        </span>
                                    </div>
                                    {selectedVenta.user && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Cuenta en sesión:</span>
                                            <span className="text-foreground">
                                                {selectedVenta.user.name} {selectedVenta.user.email ? `(${selectedVenta.user.email})` : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Tabla de ítems vendidos */}
                                <div className="rounded-lg border overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
                                            <tr>
                                                <th className="p-2.5">Producto</th>
                                                <th className="p-2.5 text-center">Cant.</th>
                                                <th className="p-2.5 text-right">Precio</th>
                                                <th className="p-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {selectedVenta.detalles &&
                                            selectedVenta.detalles.length > 0 ? (
                                                selectedVenta.detalles.map((d) => (
                                                    <tr key={d.id}>
                                                        <td className="p-2.5 font-medium text-foreground">
                                                            {d.producto?.nombre || `Producto #${d.producto_id}`}
                                                        </td>
                                                        <td className="p-2.5 text-center font-bold">
                                                            {d.cantidad}
                                                        </td>
                                                        <td className="p-2.5 text-right text-muted-foreground">
                                                            {formatCurrency(d.precio_unitario)}
                                                        </td>
                                                        <td className="p-2.5 text-right font-semibold text-foreground">
                                                            {formatCurrency(d.subtotal)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                                        No hay detalles cargados para esta venta.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Total general */}
                                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <span className="font-semibold text-foreground">Total Pagado:</span>
                                    <span className="text-xl font-bold text-primary">
                                        {formatCurrency(selectedVenta.total)}
                                    </span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedVenta(null)}
                                >
                                    Cerrar
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

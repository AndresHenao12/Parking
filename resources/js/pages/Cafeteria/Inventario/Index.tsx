import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    Boxes,
    Calendar,
    Filter,
    Package,
    Plus,
    RefreshCw,
    Search,
    User,
    UserCheck,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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

interface Producto {
    id: number;
    nombre: string;
    categoria?: {
        id: number;
        nombre: string;
    };
    cantidad_disponible: number;
    stock_minimo: number;
    precio_venta: number | string;
    costo_compra: number | string;
    activo: boolean;
    es_stock_bajo: boolean;
}

interface Movimiento {
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
    tipo: 'entrada' | 'salida';
    cantidad: number;
    stock_anterior: number;
    stock_nuevo: number;
    motivo: string;
    observacion: string | null;
    fecha: string;
    user?: {
        id: number;
        name: string;
    };
    trabajador?: {
        id: number;
        nombres: string;
        apellidos: string;
    };
    venta?: {
        id: number;
        numero_venta: string;
    };
}

interface Trabajador {
    id: number;
    nombres: string;
    apellidos: string;
}

interface Props {
    existencias: Producto[];
    movimientos: {
        data: Movimiento[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    trabajadores: Trabajador[];
    filtros: {
        producto_id: string;
        tipo: string;
        fecha_inicio: string;
        fecha_fin: string;
        search: string;
        tab: string;
    };
    resumen: {
        total_productos: number;
        stock_bajo_count: number;
        total_unidades: number;
    };
}

export default function Index({
    existencias,
    movimientos,
    trabajadores,
    filtros,
    resumen,
}: Props) {
    const [activeTab, setActiveTab] = useState<'movimientos' | 'existencias'>(
        filtros.tab === 'existencias' ? 'existencias' : 'movimientos',
    );

    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

    // Filtros de movimientos
    const [filtroProducto, setFiltroProducto] = useState(filtros.producto_id || '');
    const [filtroTipo, setFiltroTipo] = useState(filtros.tipo || '');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState(
        filtros.fecha_inicio || '',
    );
    const [filtroFechaFin, setFiltroFechaFin] = useState(filtros.fecha_fin || '');

    // Buscador local para existencias
    const [searchExistencias, setSearchExistencias] = useState('');

    const form = useForm({
        producto_id: '',
        tipo: 'entrada',
        cantidad: '',
        motivo: 'compra_proveedor',
        observacion: '',
        trabajador_id: '',
    });

    // Formatear fechas
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

    // Aplicar filtros en el backend para movimientos
    const applyMovementFilters = () => {
        router.get(
            '/cafeteria/inventario',
            {
                tab: 'movimientos',
                producto_id: filtroProducto,
                tipo: filtroTipo,
                fecha_inicio: filtroFechaInicio,
                fecha_fin: filtroFechaFin,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearMovementFilters = () => {
        setFiltroProducto('');
        setFiltroTipo('');
        setFiltroFechaInicio('');
        setFiltroFechaFin('');
        router.get(
            '/cafeteria/inventario',
            { tab: 'movimientos' },
            { preserveState: true },
        );
    };

    // Filtrar existencias en frontend
    const filteredExistencias = useMemo(() => {
        if (!searchExistencias) return existencias;
        const q = searchExistencias.toLowerCase();
        return existencias.filter(
            (p) =>
                p.nombre.toLowerCase().includes(q) ||
                (p.categoria?.nombre &&
                    p.categoria.nombre.toLowerCase().includes(q)),
        );
    }, [existencias, searchExistencias]);

    // Producto seleccionado en el modal
    const selectedProduct = useMemo(() => {
        return existencias.find((p) => String(p.id) === String(form.data.producto_id));
    }, [existencias, form.data.producto_id]);

    const handleOpenMovementModal = (initialProductId?: number, tipo: 'entrada' | 'salida' = 'entrada') => {
        form.reset();
        form.clearErrors();
        form.setData({
            producto_id: initialProductId ? String(initialProductId) : (existencias[0]?.id ? String(existencias[0].id) : ''),
            tipo: tipo,
            cantidad: '',
            motivo: tipo === 'entrada' ? 'compra_proveedor' : 'merma_dano',
            observacion: '',
            trabajador_id: trabajadores[0]?.id ? String(trabajadores[0].id) : '',
        });
        setIsMovementModalOpen(true);
    };

    const handleSaveMovement = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar salida contra stock
        if (form.data.tipo === 'salida' && selectedProduct) {
            const cant = parseInt(form.data.cantidad);
            if (cant > selectedProduct.cantidad_disponible) {
                toast.error(
                    `No puedes retirar ${cant} unidades. Solo hay ${selectedProduct.cantidad_disponible} en inventario.`,
                );
                return;
            }
        }

        form.post('/cafeteria/inventario/movimientos', {
            preserveScroll: true,
            onSuccess: () => {
                setIsMovementModalOpen(false);
                form.reset();
                toast.success('Movimiento registrado correctamente.');
            },
            onError: (err) => {
                toast.error(
                    Object.values(err)[0] ||
                        'Error al registrar el movimiento.',
                );
            },
        });
    };

    return (
        <>
            <Head title="Inventario Cafetería" />

            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Cabecera y Resumen */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Boxes className="size-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                Control de Inventario
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Consulta existencias actuales, entradas, salidas y auditoría de movimientos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenMovementModal(undefined, 'entrada')}
                            className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                        >
                            <ArrowDownLeft className="size-4 mr-1.5" />
                            Registrar Entrada
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleOpenMovementModal(undefined, 'salida')}
                            className="text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                        >
                            <ArrowUpRight className="size-4 mr-1.5" />
                            Registrar Salida
                        </Button>
                    </div>
                </div>

                {/* Tarjetas de métricas rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-card p-4 shadow-2xs">
                        <p className="text-xs font-medium text-muted-foreground">
                            Total de Productos
                        </p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">
                            {resumen.total_productos}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Registrados en catálogo
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-2xs">
                        <p className="text-xs font-medium text-muted-foreground">
                            Unidades en Bodega / Barra
                        </p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">
                            {resumen.total_unidades} uds.
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Inventario total consolidado
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 shadow-2xs border-amber-500/20 bg-amber-500/5">
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                            Productos con Stock Bajo
                        </p>
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {resumen.stock_bajo_count}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Requieren reabastecimiento
                        </p>
                    </div>
                </div>

                {/* Pestañas: Movimientos vs Existencias */}
                <div className="flex border-b border-border">
                    <button
                        type="button"
                        onClick={() => setActiveTab('movimientos')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'movimientos'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Calendar className="size-4" />
                        Historial de Movimientos
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {movimientos.total}
                        </Badge>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('existencias')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'existencias'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Boxes className="size-4" />
                        Existencias Actuales
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {existencias.length}
                        </Badge>
                    </button>
                </div>

                {/* ======================================================== */}
                {/* TAB 1: MOVIMIENTOS DE INVENTARIO                         */}
                {/* ======================================================== */}
                {activeTab === 'movimientos' && (
                    <div className="space-y-4">
                        {/* Filtros de movimientos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 rounded-xl border bg-card p-3 shadow-2xs items-end">
                            {/* Producto */}
                            <div className="space-y-1">
                                <Label className="text-xs">Producto</Label>
                                <select
                                    value={filtroProducto}
                                    onChange={(e) => setFiltroProducto(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Todos los productos</option>
                                    {existencias.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tipo */}
                            <div className="space-y-1">
                                <Label className="text-xs">Tipo de movimiento</Label>
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Todos (Entrada / Salida)</option>
                                    <option value="entrada">Solo Entradas (+)</option>
                                    <option value="salida">Solo Salidas (-)</option>
                                </select>
                            </div>

                            {/* Fecha Desde */}
                            <div className="space-y-1">
                                <Label className="text-xs">Fecha Desde</Label>
                                <Input
                                    type="date"
                                    value={filtroFechaInicio}
                                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* Fecha Hasta */}
                            <div className="space-y-1">
                                <Label className="text-xs">Fecha Hasta</Label>
                                <Input
                                    type="date"
                                    value={filtroFechaFin}
                                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            {/* Botones Filtrar / Limpiar */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={applyMovementFilters}
                                    className="flex-1 h-9 text-xs"
                                >
                                    <Filter className="size-3.5 mr-1" />
                                    Filtrar
                                </Button>
                                {(filtroProducto ||
                                    filtroTipo ||
                                    filtroFechaInicio ||
                                    filtroFechaFin) && (
                                    <Button
                                        variant="outline"
                                        onClick={clearMovementFilters}
                                        className="h-9 text-xs px-2.5"
                                        title="Limpiar filtros"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Tabla de Movimientos */}
                        <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Fecha y Hora</th>
                                            <th className="px-4 py-3">Producto</th>
                                            <th className="px-4 py-3 text-center">Tipo</th>
                                            <th className="px-4 py-3 text-center">Cantidad</th>
                                            <th className="px-4 py-3 text-center">Previo → Nuevo</th>
                                            <th className="px-4 py-3">Motivo / Venta</th>
                                            <th className="px-4 py-3">Responsable</th>
                                            <th className="px-4 py-3">Observación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {movimientos.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-4 py-8 text-center text-muted-foreground"
                                                >
                                                    No se encontraron movimientos registrados con los filtros aplicados.
                                                </td>
                                            </tr>
                                        ) : (
                                            movimientos.data.map((m) => {
                                                const isEntrada = m.tipo === 'entrada';

                                                return (
                                                    <tr
                                                        key={m.id}
                                                        className="hover:bg-muted/30 transition-colors"
                                                    >
                                                        {/* Fecha y hora */}
                                                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                                                            {formatDate(m.fecha)}
                                                        </td>

                                                        {/* Producto */}
                                                        <td className="px-4 py-3 font-medium text-foreground">
                                                            {m.producto?.nombre || `Producto #${m.producto_id}`}
                                                        </td>

                                                        {/* Badge Tipo */}
                                                        <td className="px-4 py-3 text-center">
                                                            {isEntrada ? (
                                                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                                    <ArrowDownLeft className="size-3 mr-1" />
                                                                    Entrada
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                                                    <ArrowUpRight className="size-3 mr-1" />
                                                                    Salida
                                                                </Badge>
                                                            )}
                                                        </td>

                                                        {/* Cantidad */}
                                                        <td className="px-4 py-3 text-center font-bold">
                                                            <span
                                                                className={
                                                                    isEntrada
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : 'text-rose-600 dark:text-rose-400'
                                                                }
                                                            >
                                                                {isEntrada ? `+${m.cantidad}` : `-${m.cantidad}`}
                                                            </span>
                                                        </td>

                                                        {/* Transición de stock */}
                                                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                                                            {m.stock_anterior} →{' '}
                                                            <strong className="text-foreground">
                                                                {m.stock_nuevo}
                                                            </strong>
                                                        </td>

                                                        {/* Motivo */}
                                                        <td className="px-4 py-3 text-xs">
                                                            <span className="font-medium text-foreground capitalize">
                                                                {m.motivo.replace('_', ' ')}
                                                            </span>
                                                            {m.venta && (
                                                                <div className="text-[11px] text-primary font-mono mt-0.5">
                                                                    {m.venta.numero_venta}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Responsable */}
                                                        <td className="px-4 py-3 text-xs">
                                                            <div className="font-medium text-foreground">
                                                                {m.trabajador
                                                                    ? `${m.trabajador.nombres} ${m.trabajador.apellidos}`
                                                                    : m.user?.name || 'Sistema'}
                                                            </div>
                                                            {m.trabajador && m.user && (
                                                                <div className="text-[10px] text-muted-foreground">
                                                                    Usuario: {m.user.name}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Observación */}
                                                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                                                            {m.observacion || '-'}
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
                )}

                {/* ======================================================== */}
                {/* TAB 2: EXISTENCIAS ACTUALES                             */}
                {/* ======================================================== */}
                {activeTab === 'existencias' && (
                    <div className="space-y-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Filtrar existencias por producto o categoría..."
                                value={searchExistencias}
                                onChange={(e) => setSearchExistencias(e.target.value)}
                                className="pl-9 bg-card"
                            />
                        </div>

                        <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Producto</th>
                                            <th className="px-4 py-3">Categoría</th>
                                            <th className="px-4 py-3 text-center">Stock Actual</th>
                                            <th className="px-4 py-3 text-center">Stock Mínimo</th>
                                            <th className="px-4 py-3 text-center">Estado Stock</th>
                                            <th className="px-4 py-3 text-right">Acción Rápida</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {filteredExistencias.map((prod) => {
                                            const isAgotado =
                                                prod.cantidad_disponible <= 0;
                                            const isBajo =
                                                prod.cantidad_disponible <=
                                                    prod.stock_minimo && !isAgotado;

                                            return (
                                                <tr
                                                    key={prod.id}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="px-4 py-3 font-semibold text-foreground">
                                                        {prod.nombre}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        <Badge variant="outline">
                                                            {prod.categoria?.nombre || 'General'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-base">
                                                        {prod.cantidad_disponible} uds.
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-muted-foreground">
                                                        {prod.stock_minimo} uds.
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {isAgotado ? (
                                                            <Badge variant="destructive">
                                                                Agotado (0)
                                                            </Badge>
                                                        ) : isBajo ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                                            >
                                                                Stock Bajo
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                                Óptimo
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleOpenMovementModal(
                                                                        prod.id,
                                                                        'entrada',
                                                                    )
                                                                }
                                                                className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                                            >
                                                                + Ingresar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    handleOpenMovementModal(
                                                                        prod.id,
                                                                        'salida',
                                                                    )
                                                                }
                                                                className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                                                            >
                                                                - Retirar
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para Registrar Movimiento Manual */}
            <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
                        <DialogDescription>
                            Ajusta las cantidades del almacén indicando el motivo y trabajador responsable.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveMovement} className="space-y-4 py-2">
                        {/* Selector de Producto */}
                        <div className="space-y-1">
                            <Label htmlFor="mov-producto">Producto *</Label>
                            <select
                                id="mov-producto"
                                value={form.data.producto_id}
                                onChange={(e) =>
                                    form.setData('producto_id', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                            >
                                <option value="">Selecciona el producto...</option>
                                {existencias.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} (Stock actual: {p.cantidad_disponible} uds)
                                    </option>
                                ))}
                            </select>
                            {form.errors.producto_id && (
                                <p className="text-xs text-destructive">
                                    {form.errors.producto_id}
                                </p>
                            )}
                        </div>

                        {/* Tipo de Movimiento: Entrada o Salida */}
                        <div className="space-y-1">
                            <Label>Tipo de Movimiento *</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        form.setData('tipo', 'entrada');
                                        if (form.data.motivo === 'merma_dano' || form.data.motivo === 'ajuste_negativo') {
                                            form.setData('motivo', 'compra_proveedor');
                                        }
                                    }}
                                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                                        form.data.tipo === 'entrada'
                                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                                            : 'border-input hover:bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <ArrowDownLeft className="size-4 text-emerald-600" />
                                    Entrada (Ingreso)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        form.setData('tipo', 'salida');
                                        if (form.data.motivo === 'compra_proveedor') {
                                            form.setData('motivo', 'merma_dano');
                                        }
                                    }}
                                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                                        form.data.tipo === 'salida'
                                            ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30'
                                            : 'border-input hover:bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <ArrowUpRight className="size-4 text-rose-600" />
                                    Salida (Egreso)
                                </button>
                            </div>
                        </div>

                        {/* Cantidad */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="mov-cantidad">Cantidad a mover *</Label>
                                {selectedProduct && (
                                    <span className="text-xs text-muted-foreground">
                                        Existencias: <strong>{selectedProduct.cantidad_disponible}</strong>
                                    </span>
                                )}
                            </div>
                            <Input
                                id="mov-cantidad"
                                type="number"
                                min="1"
                                value={form.data.cantidad}
                                onChange={(e) => form.setData('cantidad', e.target.value)}
                                placeholder="Ej. 10"
                                required
                            />
                            {form.errors.cantidad && (
                                <p className="text-xs text-destructive">
                                    {form.errors.cantidad}
                                </p>
                            )}
                        </div>

                        {/* Motivo */}
                        <div className="space-y-1">
                            <Label htmlFor="mov-motivo">Motivo del Movimiento *</Label>
                            <select
                                id="mov-motivo"
                                value={form.data.motivo}
                                onChange={(e) => form.setData('motivo', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                            >
                                {form.data.tipo === 'entrada' ? (
                                    <>
                                        <option value="compra_proveedor">
                                            Compra o recepción de proveedor
                                        </option>
                                        <option value="devolucion_cliente">
                                            Devolución de cliente
                                        </option>
                                        <option value="ajuste_positivo">
                                            Ajuste positivo por conteo físico
                                        </option>
                                    </>
                                ) : (
                                    <>
                                        <option value="merma_dano">
                                            Merma, daño o producto vencido
                                        </option>
                                        <option value="consumo_interno">
                                            Consumo interno / Cortesía
                                        </option>
                                        <option value="ajuste_negativo">
                                            Ajuste negativo por descuadre físico
                                        </option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Trabajador Responsable */}
                        <div className="space-y-1">
                            <Label htmlFor="mov-trabajador">Trabajador Responsable</Label>
                            <select
                                id="mov-trabajador"
                                value={form.data.trabajador_id}
                                onChange={(e) =>
                                    form.setData('trabajador_id', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">Sesión actual / General</option>
                                {trabajadores.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombres} {t.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Observación */}
                        <div className="space-y-1">
                            <Label htmlFor="mov-obs">Observación / Justificación</Label>
                            <textarea
                                id="mov-obs"
                                rows={2}
                                value={form.data.observacion}
                                onChange={(e) =>
                                    form.setData('observacion', e.target.value)
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Notas opcionales sobre la factura, lote o motivo..."
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsMovementModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Registrando...' : 'Registrar Movimiento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

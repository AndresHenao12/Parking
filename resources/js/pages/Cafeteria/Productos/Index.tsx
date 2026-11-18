import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Check,
    Edit,
    Filter,
    Image as ImageIcon,
    Package,
    Plus,
    Power,
    Search,
    Trash2,
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

interface Categoria {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    categoria_producto_id: number;
    categoria?: Categoria;
    nombre: string;
    descripcion: string | null;
    precio_venta: string | number;
    costo_compra: string | number;
    cantidad_disponible: number;
    stock_minimo: number;
    activo: boolean;
    imagen: string | null;
    es_stock_bajo: boolean;
}

interface Props {
    productos: Producto[];
    categorias: Categoria[];
    filtros: {
        search: string;
        categoria_id: string;
        activo: string;
        stock_bajo: boolean;
    };
    alertaStockBajo: number;
}

export default function Index({
    productos,
    categorias,
    filtros,
    alertaStockBajo,
}: Props) {
    const [search, setSearch] = useState(filtros.search || '');
    const [categoriaFilter, setCategoriaFilter] = useState(
        filtros.categoria_id || '',
    );
    const [stockBajoFilter, setStockBajoFilter] = useState(
        filtros.stock_bajo || false,
    );

    // Modal de creación / edición
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

    const form = useForm({
        nombre: '',
        categoria_producto_id: '',
        descripcion: '',
        precio_venta: '',
        costo_compra: '',
        cantidad_disponible: '0',
        stock_minimo: '5',
        activo: true,
        imagen: '',
    });

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    // Filtrado de productos en frontend
    const filteredProductos = useMemo(() => {
        return productos.filter((prod) => {
            const matchesSearch =
                !search ||
                prod.nombre.toLowerCase().includes(search.toLowerCase()) ||
                (prod.descripcion &&
                    prod.descripcion
                        .toLowerCase()
                        .includes(search.toLowerCase()));

            const matchesCategory =
                !categoriaFilter ||
                String(prod.categoria_producto_id) === String(categoriaFilter);

            const matchesStockBajo =
                !stockBajoFilter ||
                prod.cantidad_disponible <= prod.stock_minimo;

            return matchesSearch && matchesCategory && matchesStockBajo;
        });
    }, [productos, search, categoriaFilter, stockBajoFilter]);

    const handleOpenCreate = () => {
        setEditingProduct(null);
        form.reset();
        form.clearErrors();
        if (categorias.length > 0) {
            form.setData('categoria_producto_id', String(categorias[0].id));
        }
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (prod: Producto) => {
        setEditingProduct(prod);
        form.clearErrors();
        form.setData({
            nombre: prod.nombre,
            categoria_producto_id: String(prod.categoria_producto_id),
            descripcion: prod.descripcion || '',
            precio_venta: String(prod.precio_venta),
            costo_compra: String(prod.costo_compra),
            cantidad_disponible: String(prod.cantidad_disponible),
            stock_minimo: String(prod.stock_minimo),
            activo: prod.activo,
            imagen: prod.imagen || '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            form.put(`/cafeteria/productos/${editingProduct.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Producto actualizado exitosamente.');
                },
                onError: (err) => {
                    toast.error(
                        Object.values(err)[0] ||
                            'Ocurrió un error al actualizar el producto.',
                    );
                },
            });
        } else {
            form.post('/cafeteria/productos', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDialogOpen(false);
                    form.reset();
                    toast.success('Producto creado exitosamente.');
                },
                onError: (err) => {
                    toast.error(
                        Object.values(err)[0] ||
                            'Ocurrió un error al registrar el producto.',
                    );
                },
            });
        }
    };

    const handleToggleActivo = (prod: Producto) => {
        router.post(
            `/cafeteria/productos/${prod.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        prod.activo
                            ? `"${prod.nombre}" desactivado.`
                            : `"${prod.nombre}" activado.`,
                    );
                },
            },
        );
    };

    const handleDelete = (prod: Producto) => {
        if (
            confirm(
                `¿Deseas eliminar o desactivar "${prod.nombre}"? Si tiene ventas previas se desactivará para mantener el historial.`,
            )
        ) {
            router.delete(`/cafeteria/productos/${prod.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Operación completada.');
                },
            });
        }
    };

    return (
        <>
            <Head title="Productos Cafetería" />

            <div className="flex flex-col gap-6 p-4 md:p-8">
                {/* Cabecera y alerta de stock bajo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Package className="size-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                Catálogo de Productos
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Administra crispetas, bebidas, dulces y combos de la cafetería del cine.
                        </p>
                    </div>

                    <Button onClick={handleOpenCreate} className="shadow-xs">
                        <Plus className="size-4 mr-2" />
                        Nuevo Producto
                    </Button>
                </div>

                {/* Banner de alerta de inventario bajo */}
                {alertaStockBajo > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="text-sm font-medium">
                                Hay <strong>{alertaStockBajo}</strong> producto(s) con inventario bajo o igual a su stock mínimo.
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStockBajoFilter((prev) => !prev)}
                            className="h-8 text-xs bg-background/80 hover:bg-background border-amber-500/40"
                        >
                            {stockBajoFilter ? 'Ver todos' : 'Filtrar stock bajo'}
                        </Button>
                    </div>
                )}

                {/* Filtros y Buscador */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-xl border bg-card p-3 shadow-2xs">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o descripción..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-background"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Selector de Categoría */}
                        <select
                            value={categoriaFilter}
                            onChange={(e) => setCategoriaFilter(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nombre}
                                </option>
                            ))}
                        </select>

                        {/* Toggle Stock Bajo */}
                        <Button
                            variant={stockBajoFilter ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => setStockBajoFilter(!stockBajoFilter)}
                            className={`h-9 text-xs gap-1.5 ${
                                stockBajoFilter
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                    : ''
                            }`}
                        >
                            <AlertTriangle className="size-3.5" />
                            Solo stock bajo
                        </Button>
                    </div>
                </div>

                {/* Tabla de Productos */}
                <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3">Categoría</th>
                                    <th className="px-4 py-3 text-right">Precio Venta</th>
                                    <th className="px-4 py-3 text-right">Costo Compra</th>
                                    <th className="px-4 py-3 text-center">Disponible</th>
                                    <th className="px-4 py-3 text-center">Stock Mín.</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredProductos.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No se encontraron productos registrados con los criterios seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProductos.map((prod) => {
                                        const isLow =
                                            prod.cantidad_disponible <=
                                            prod.stock_minimo;
                                        const isZero =
                                            prod.cantidad_disponible <= 0;

                                        return (
                                            <tr
                                                key={prod.id}
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                {/* Imagen y Nombre */}
                                                <td className="px-4 py-3 font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border flex items-center justify-center">
                                                            {prod.imagen ? (
                                                                <img
                                                                    src={prod.imagen}
                                                                    alt={prod.nombre}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <ImageIcon className="size-5 text-muted-foreground/60" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">
                                                                {prod.nombre}
                                                            </div>
                                                            {prod.descripcion && (
                                                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                                                    {prod.descripcion}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Categoría */}
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    <Badge variant="outline">
                                                        {prod.categoria?.nombre || 'Sin categoría'}
                                                    </Badge>
                                                </td>

                                                {/* Precios */}
                                                <td className="px-4 py-3 text-right font-semibold text-foreground">
                                                    {formatCurrency(prod.precio_venta)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-muted-foreground">
                                                    {formatCurrency(prod.costo_compra)}
                                                </td>

                                                {/* Stock disponible con alertas de color */}
                                                <td className="px-4 py-3 text-center">
                                                    {isZero ? (
                                                        <Badge variant="destructive">
                                                            0 uds (Agotado)
                                                        </Badge>
                                                    ) : isLow ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                                        >
                                                            {prod.cantidad_disponible} uds (Bajo)
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            {prod.cantidad_disponible} uds
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-center text-muted-foreground">
                                                    {prod.stock_minimo} uds
                                                </td>

                                                {/* Estado */}
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActivo(prod)}
                                                        title="Clic para activar/desactivar"
                                                        className="inline-flex items-center"
                                                    >
                                                        {prod.activo ? (
                                                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25">
                                                                Activo
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-muted-foreground hover:bg-muted">
                                                                Inactivo
                                                            </Badge>
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Acciones */}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(prod)}
                                                            className="h-8 w-8 p-0"
                                                            title="Editar producto"
                                                        >
                                                            <Edit className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(prod)}
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            title="Eliminar o desactivar"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
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

            {/* Modal de Registro / Edición de Producto */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los datos del producto para la cafetería del cine.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="nombre">Nombre del Producto *</Label>
                                <Input
                                    id="nombre"
                                    value={form.data.nombre}
                                    onChange={(e) => form.setData('nombre', e.target.value)}
                                    placeholder="Ej. Crispetas Grandes de Caramelo"
                                    required
                                />
                                {form.errors.nombre && (
                                    <p className="text-xs text-destructive">{form.errors.nombre}</p>
                                )}
                            </div>

                            {/* Categoría */}
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="categoria_producto_id">Categoría *</Label>
                                <select
                                    id="categoria_producto_id"
                                    value={form.data.categoria_producto_id}
                                    onChange={(e) =>
                                        form.setData('categoria_producto_id', e.target.value)
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="">Selecciona una categoría...</option>
                                    {categorias.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.categoria_producto_id && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.categoria_producto_id}
                                    </p>
                                )}
                            </div>

                            {/* Precio de Venta */}
                            <div className="space-y-1">
                                <Label htmlFor="precio_venta">Precio de Venta ($ COP) *</Label>
                                <Input
                                    id="precio_venta"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={form.data.precio_venta}
                                    onChange={(e) => form.setData('precio_venta', e.target.value)}
                                    placeholder="14000"
                                    required
                                />
                                {form.errors.precio_venta && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.precio_venta}
                                    </p>
                                )}
                            </div>

                            {/* Costo de Compra */}
                            <div className="space-y-1">
                                <Label htmlFor="costo_compra">Costo de Compra ($ COP) *</Label>
                                <Input
                                    id="costo_compra"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={form.data.costo_compra}
                                    onChange={(e) => form.setData('costo_compra', e.target.value)}
                                    placeholder="4500"
                                    required
                                />
                                {form.errors.costo_compra && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.costo_compra}
                                    </p>
                                )}
                            </div>

                            {/* Cantidad Inicial (solo al crear) */}
                            {!editingProduct && (
                                <div className="space-y-1">
                                    <Label htmlFor="cantidad_disponible">
                                        Inventario Inicial (uds)
                                    </Label>
                                    <Input
                                        id="cantidad_disponible"
                                        type="number"
                                        min="0"
                                        value={form.data.cantidad_disponible}
                                        onChange={(e) =>
                                            form.setData('cantidad_disponible', e.target.value)
                                        }
                                        placeholder="0"
                                    />
                                    {form.errors.cantidad_disponible && (
                                        <p className="text-xs text-destructive">
                                            {form.errors.cantidad_disponible}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Stock Mínimo */}
                            <div className="space-y-1">
                                <Label htmlFor="stock_minimo">Stock Mínimo de Alerta</Label>
                                <Input
                                    id="stock_minimo"
                                    type="number"
                                    min="0"
                                    value={form.data.stock_minimo}
                                    onChange={(e) => form.setData('stock_minimo', e.target.value)}
                                    placeholder="5"
                                    required
                                />
                                {form.errors.stock_minimo && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.stock_minimo}
                                    </p>
                                )}
                            </div>

                            {/* Imagen URL o ruta */}
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="imagen">URL o Ruta de Imagen (opcional)</Label>
                                <Input
                                    id="imagen"
                                    value={form.data.imagen}
                                    onChange={(e) => form.setData('imagen', e.target.value)}
                                    placeholder="https://ejemplo.com/crispetas.jpg"
                                />
                                {form.errors.imagen && (
                                    <p className="text-xs text-destructive">{form.errors.imagen}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                                <textarea
                                    id="descripcion"
                                    rows={2}
                                    value={form.data.descripcion}
                                    onChange={(e) => form.setData('descripcion', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Detalles sobre presentación, sabor, tamaño..."
                                />
                            </div>

                            {/* Estado activo/inactivo */}
                            <div className="flex items-center gap-2 sm:col-span-2 pt-1">
                                <input
                                    id="activo"
                                    type="checkbox"
                                    checked={form.data.activo}
                                    onChange={(e) => form.setData('activo', e.target.checked)}
                                    className="rounded border-input text-primary focus:ring-ring size-4"
                                />
                                <Label htmlFor="activo" className="cursor-pointer text-sm font-medium">
                                    Producto activo (disponible para venta en el POS)
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Guardando...'
                                    : editingProduct
                                    ? 'Actualizar Producto'
                                    : 'Guardar Producto'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Minus,
    Package,
    Plus,
    Receipt,
    RefreshCw,
    Search,
    ShoppingBag,
    Trash2,
    UserCheck,
    UtensilsCrossed,
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
    categoria?: {
        id: number;
        nombre: string;
    };
    nombre: string;
    descripcion: string | null;
    precio_venta: string | number;
    costo_compra: string | number;
    cantidad_disponible: number;
    stock_minimo: number;
    activo: boolean;
    imagen: string | null;
    es_stock_bajo?: boolean;
}

interface Trabajador {
    id: number;
    nombres: string;
    apellidos: string;
}

interface UserAuth {
    id: number;
    name: string;
    email: string;
}

interface CartItem {
    producto: Producto;
    cantidad: number;
}

interface Props {
    categorias: Categoria[];
    productos: Producto[];
    trabajadores: Trabajador[];
    usuarioActual?: UserAuth;
}

export default function Pos({
    categorias,
    productos,
    trabajadores,
    usuarioActual,
}: Props) {
    const [search, setSearch] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal de confirmación de venta exitosa
    const [saleSuccessModal, setSaleSuccessModal] = useState<{
        open: boolean;
        numeroVenta: string;
        total: number;
        itemsCount: number;
    }>({
        open: false,
        numeroVenta: '',
        total: 0,
        itemsCount: 0,
    });

    // Formateador de moneda colombiana (COP)
    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    // Productos filtrados por búsqueda y categoría
    const filteredProductos = useMemo(() => {
        return productos.filter((prod) => {
            const matchesSearch = prod.nombre
                .toLowerCase()
                .includes(search.toLowerCase()) ||
                (prod.descripcion &&
                    prod.descripcion.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory =
                selectedCategoria === null ||
                prod.categoria_producto_id === selectedCategoria;

            return matchesSearch && matchesCategory;
        });
    }, [productos, search, selectedCategoria]);

    // Agregar producto al carrito
    const addToCart = (producto: Producto) => {
        if (!producto.activo) {
            toast.error('Este producto está inactivo y no se puede vender.');
            return;
        }

        if (producto.cantidad_disponible <= 0) {
            toast.error(`"${producto.nombre}" está agotado en inventario.`);
            return;
        }

        setCart((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.producto.id === producto.id,
            );

            if (existingIndex > -1) {
                const currentQty = prev[existingIndex].cantidad;
                if (currentQty + 1 > producto.cantidad_disponible) {
                    toast.warning(
                        `Solo hay ${producto.cantidad_disponible} unidades disponibles de "${producto.nombre}".`,
                    );
                    return prev;
                }

                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    cantidad: currentQty + 1,
                };
                return updated;
            }

            return [...prev, { producto, cantidad: 1 }];
        });
    };

    // Actualizar cantidad de un ítem en el carrito
    const updateQuantity = (productoId: number, newQty: number) => {
        setCart((prev) => {
            if (newQty <= 0) {
                return prev.filter((item) => item.producto.id !== productoId);
            }

            return prev.map((item) => {
                if (item.producto.id === productoId) {
                    if (newQty > item.producto.cantidad_disponible) {
                        toast.warning(
                            `Solo hay ${item.producto.cantidad_disponible} unidades disponibles de "${item.producto.nombre}".`,
                        );
                        return {
                            ...item,
                            cantidad: item.producto.cantidad_disponible,
                        };
                    }
                    return { ...item, cantidad: newQty };
                }
                return item;
            });
        });
    };

    // Remover ítem del carrito
    const removeFromCart = (productoId: number) => {
        setCart((prev) => prev.filter((item) => item.producto.id !== productoId));
    };

    // Vaciar todo el carrito
    const clearCart = () => {
        if (cart.length === 0) return;
        setCart([]);
    };

    // Totales calculados
    const totalItems = useMemo(
        () => cart.reduce((sum, item) => sum + item.cantidad, 0),
        [cart],
    );

    const totalAmount = useMemo(
        () =>
            cart.reduce(
                (sum, item) =>
                    sum +
                    Number(item.producto.precio_venta) * item.cantidad,
                0,
            ),
        [cart],
    );

    // Finalizar la venta enviando el payload a /cafeteria/ventas
    const handleFinalizarVenta = () => {
        if (cart.length === 0) {
            toast.error('Agrega productos al carrito antes de finalizar la venta.');
            return;
        }

        // Validación frontend de existencias
        for (const item of cart) {
            if (item.cantidad > item.producto.cantidad_disponible) {
                toast.error(
                    `Inventario insuficiente para "${item.producto.nombre}". Stock: ${item.producto.cantidad_disponible}, solicitado: ${item.cantidad}.`,
                );
                return;
            }
        }

        setIsSubmitting(true);

        const payload = {
            items: cart.map((item) => ({
                producto_id: item.producto.id,
                cantidad: item.cantidad,
            })),
            trabajador_id: selectedTrabajadorId
                ? parseInt(selectedTrabajadorId)
                : null,
        };

        router.post('/cafeteria/ventas', payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = (page.props as any).flash;
                const successMsg =
                    flash?.success || 'Venta finalizada exitosamente.';

                // Extraer número de venta del mensaje si está disponible
                const match = successMsg.match(/VTA-\d+-\d+/);
                const numeroVenta = match ? match[0] : 'Venta procesada';

                setSaleSuccessModal({
                    open: true,
                    numeroVenta,
                    total: totalAmount,
                    itemsCount: totalItems,
                });

                toast.success(successMsg);
                setCart([]);
            },
            onError: (errors) => {
                const errorMsg =
                    errors.items ||
                    errors.trabajador_id ||
                    Object.values(errors)[0] ||
                    'Error al procesar la venta.';
                toast.error(String(errorMsg));
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <>
            <Head title="POS Cafetería - Punto de Venta" />

            <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row overflow-hidden bg-background">
                {/* ======================================================== */}
                {/* SECCIÓN IZQUIERDA: CATÁLOGO Y BUSCADOR DE PRODUCTOS     */}
                {/* ======================================================== */}
                <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
                    {/* Barra de cabecera con buscador y filtros */}
                    <div className="border-b border-border bg-card p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-background"
                                    placeholder="Buscar producto por nombre..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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

                            <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-auto">
                                <UtensilsCrossed className="size-4 text-primary" />
                                <span>{filteredProductos.length} productos disponibles</span>
                            </div>
                        </div>

                        {/* Filtros de Categoría tipo chips */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                            <button
                                type="button"
                                onClick={() => setSelectedCategoria(null)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                                    selectedCategoria === null
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                Todas las categorías
                            </button>
                            {categorias.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategoria(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                                        selectedCategoria === cat.id
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    {cat.nombre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cuadrícula de Productos */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {filteredProductos.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center text-center">
                                <Package className="size-12 text-muted-foreground/50 mb-2" />
                                <h3 className="font-medium text-foreground">
                                    No se encontraron productos
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Intenta con otro término de búsqueda o categoría.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredProductos.map((producto) => {
                                    const agotado = producto.cantidad_disponible <= 0;
                                    const stockBajo =
                                        producto.cantidad_disponible <=
                                            producto.stock_minimo && !agotado;

                                    return (
                                        <div
                                            key={producto.id}
                                            onClick={() => !agotado && addToCart(producto)}
                                            className={`group relative flex flex-col justify-between rounded-xl border bg-card p-3 shadow-2xs transition-all ${
                                                agotado
                                                    ? 'opacity-60 border-destructive/30 cursor-not-allowed bg-muted/30'
                                                    : 'hover:border-primary/50 hover:shadow-md cursor-pointer active:scale-[0.98]'
                                            }`}
                                        >
                                            {/* Imagen o Placeholder */}
                                            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted mb-2">
                                                {producto.imagen ? (
                                                    <img
                                                        src={producto.imagen}
                                                        alt={producto.nombre}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
                                                        <UtensilsCrossed className="size-8" />
                                                    </div>
                                                )}

                                                {/* Badge de Stock en esquina */}
                                                <div className="absolute top-1.5 right-1.5">
                                                    {agotado ? (
                                                        <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                                                            Agotado
                                                        </Badge>
                                                    ) : stockBajo ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] py-0 px-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                                        >
                                                            Stock: {producto.cantidad_disponible}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] py-0 px-1.5 bg-background/80 backdrop-blur-xs"
                                                        >
                                                            {producto.cantidad_disponible} disp.
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info del producto */}
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-medium text-muted-foreground line-clamp-1">
                                                    {producto.categoria?.nombre || 'General'}
                                                </p>
                                                <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                                                    {producto.nombre}
                                                </h4>
                                            </div>

                                            {/* Precio y Botón Agregar */}
                                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                                                <span className="text-sm font-bold text-primary">
                                                    {formatCurrency(producto.precio_venta)}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant={agotado ? 'outline' : 'secondary'}
                                                    disabled={agotado}
                                                    className="h-7 px-2 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(producto);
                                                    }}
                                                >
                                                    <Plus className="size-3.5 mr-1" />
                                                    Agregar
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ======================================================== */}
                {/* SECCIÓN DERECHA: CARRITO DE COMPRAS Y TOTALES POS        */}
                {/* ======================================================== */}
                <div className="w-full lg:w-96 flex flex-col bg-card border-t lg:border-t-0 shadow-lg shrink-0">
                    {/* Encabezado del carrito */}
                    <div className="p-4 border-b border-border bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="size-5 text-primary" />
                                <h2 className="text-base font-semibold">Orden de Cafetería</h2>
                            </div>
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearCart}
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                >
                                    Vaciar
                                </Button>
                            )}
                        </div>

                        {/* Asignación de Trabajador responsable */}
                        <div className="space-y-1">
                            <Label htmlFor="trabajador-pos" className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <UserCheck className="size-3.5 text-primary" />
                                <span>Trabajador de turno (responsable):</span>
                            </Label>
                            <select
                                id="trabajador-pos"
                                value={selectedTrabajadorId}
                                onChange={(e) => setSelectedTrabajadorId(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">
                                    {usuarioActual
                                        ? `Sesión actual: ${usuarioActual.name}`
                                        : 'Seleccionar trabajador...'}
                                </option>
                                {trabajadores.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombres} {t.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Lista de productos seleccionados en el carrito */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-muted-foreground">
                                <Receipt className="size-12 stroke-1 mb-2 text-muted-foreground/40" />
                                <p className="text-sm font-medium">El carrito está vacío</p>
                                <p className="text-xs text-muted-foreground/80 mt-1">
                                    Haz clic en los productos para agregarlos a la venta.
                                </p>
                            </div>
                        ) : (
                            cart.map((item) => {
                                const subtotal =
                                    Number(item.producto.precio_venta) *
                                    item.cantidad;

                                return (
                                    <div
                                        key={item.producto.id}
                                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/70 bg-background/50 hover:bg-background transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h5 className="text-xs font-semibold text-foreground truncate">
                                                {item.producto.nombre}
                                            </h5>
                                            <p className="text-[11px] text-muted-foreground">
                                                {formatCurrency(item.producto.precio_venta)} c/u
                                            </p>
                                        </div>

                                        {/* Selector de cantidad rápido */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.producto.id,
                                                        item.cantidad - 1,
                                                    )
                                                }
                                                className="size-6 rounded border border-input bg-background flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
                                            >
                                                <Minus className="size-3" />
                                            </button>

                                            <span className="w-7 text-center text-xs font-bold">
                                                {item.cantidad}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.producto.id,
                                                        item.cantidad + 1,
                                                    )
                                                }
                                                className="size-6 rounded border border-input bg-background flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95"
                                            >
                                                <Plus className="size-3" />
                                            </button>
                                        </div>

                                        {/* Subtotal del ítem */}
                                        <div className="text-right min-w-[70px]">
                                            <p className="text-xs font-bold text-foreground">
                                                {formatCurrency(subtotal)}
                                            </p>
                                        </div>

                                        {/* Botón eliminar */}
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.producto.id)}
                                            className="text-muted-foreground/60 hover:text-destructive p-1 rounded transition-colors"
                                            title="Eliminar producto"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Resumen del Total y Botón de Cobro */}
                    <div className="p-4 border-t border-border bg-muted/20 space-y-3">
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Cantidad de artículos:</span>
                                <span className="font-medium text-foreground">
                                    {totalItems} uds.
                                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal:</span>
                                <span className="font-medium text-foreground">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                                <span>Total a cobrar:</span>
                                <span className="text-primary text-lg">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Botón Finalizar Venta */}
                        <Button
                            size="lg"
                            className="w-full text-sm font-semibold tracking-wide shadow-md"
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleFinalizarVenta}
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="size-4 mr-2 animate-spin" />
                                    Procesando venta...
                                </>
                            ) : (
                                <>
                                    <Check className="size-4 mr-2" />
                                    FINALIZAR VENTA ({formatCurrency(totalAmount)})
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal de Venta Exitosa */}
            <Dialog
                open={saleSuccessModal.open}
                onOpenChange={(open) =>
                    setSaleSuccessModal((prev) => ({ ...prev, open }))
                }
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center sm:text-center items-center">
                        <div className="size-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                            <CheckCircle2 className="size-8" />
                        </div>
                        <DialogTitle className="text-xl">¡Venta Exitosa!</DialogTitle>
                        <DialogDescription>
                            La venta ha sido registrada y el inventario fue descontado correctamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Comprobante / N°:</span>
                            <span className="font-mono font-bold text-foreground">
                                {saleSuccessModal.numeroVenta}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Artículos vendidos:</span>
                            <span className="font-medium text-foreground">
                                {saleSuccessModal.itemsCount} unidades
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                            <span>Total cobrado:</span>
                            <span className="text-primary">
                                {formatCurrency(saleSuccessModal.total)}
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-center">
                        <Button
                            type="button"
                            className="w-full sm:w-auto"
                            onClick={() =>
                                setSaleSuccessModal((prev) => ({ ...prev, open: false }))
                            }
                        >
                            Nueva Venta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

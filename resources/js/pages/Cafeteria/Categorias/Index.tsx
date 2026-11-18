import { Head, router, useForm } from '@inertiajs/react';
import { Edit, FolderTree, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
    descripcion: string | null;
    activo: boolean;
    productos_count?: number;
}

interface Props {
    categorias: Categoria[];
}

export default function Index({ categorias }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

    const form = useForm({
        nombre: '',
        descripcion: '',
        activo: true,
    });

    const handleOpenCreate = () => {
        setEditingCategoria(null);
        form.reset();
        form.clearErrors();
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (cat: Categoria) => {
        setEditingCategoria(cat);
        form.clearErrors();
        form.setData({
            nombre: cat.nombre,
            descripcion: cat.descripcion || '',
            activo: cat.activo,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategoria) {
            form.put(`/cafeteria/categorias/${editingCategoria.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Categoría actualizada.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] || 'Error al actualizar.');
                },
            });
        } else {
            form.post('/cafeteria/categorias', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDialogOpen(false);
                    form.reset();
                    toast.success('Categoría creada exitosamente.');
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] || 'Error al registrar.');
                },
            });
        }
    };

    const handleDelete = (cat: Categoria) => {
        if (confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
            router.delete(`/cafeteria/categorias/${cat.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Categoría eliminada.'),
                onError: (err) => toast.error(Object.values(err)[0] || 'No se pudo eliminar.'),
            });
        }
    };

    return (
        <>
            <Head title="Categorías de Cafetería" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <FolderTree className="size-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                Categorías de Productos
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Clasificación de artículos: Bebidas, Comidas, Dulces, Combos, etc.
                        </p>
                    </div>

                    <Button onClick={handleOpenCreate}>
                        <Plus className="size-4 mr-2" />
                        Nueva Categoría
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Descripción</th>
                                <th className="px-4 py-3 text-center">Productos</th>
                                <th className="px-4 py-3 text-center">Estado</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {categorias.map((cat) => (
                                <tr key={cat.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-semibold text-foreground">
                                        {cat.nombre}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {cat.descripcion || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-xs font-medium">
                                        {cat.productos_count ?? 0}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {cat.activo ? (
                                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                Activa
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">Inactiva</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenEdit(cat)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(cat)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                        <DialogDescription>
                            Define el nombre y descripción de la categoría.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="cat-nombre">Nombre de la Categoría *</Label>
                            <Input
                                id="cat-nombre"
                                value={form.data.nombre}
                                onChange={(e) => form.setData('nombre', e.target.value)}
                                placeholder="Ej. Bebidas Calientes"
                                required
                            />
                            {form.errors.nombre && (
                                <p className="text-xs text-destructive">{form.errors.nombre}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="cat-desc">Descripción (opcional)</Label>
                            <textarea
                                id="cat-desc"
                                rows={2}
                                value={form.data.descripcion}
                                onChange={(e) => form.setData('descripcion', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Breve detalle..."
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="cat-activo"
                                type="checkbox"
                                checked={form.data.activo}
                                onChange={(e) => form.setData('activo', e.target.checked)}
                                className="rounded border-input text-primary size-4"
                            />
                            <Label htmlFor="cat-activo" className="text-xs font-medium cursor-pointer">
                                Categoría activa
                            </Label>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
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

export interface ResourceRecord {
    id: string;
    [key: string]: string;
}

export interface ResourceOption {
    id: string;
    nombre: string;
}

export interface ResourceField {
    name: string;
    label: string;
    type?: 'text' | 'textarea' | 'select';
    placeholder?: string;
    options?: ResourceOption[];
}

export interface ResourceColumn {
    key: string;
    label: string;
}

interface ResourceManagerProps {
    title: string;
    description: string;
    endpoint: string;
    records: ResourceRecord[];
    fields: ResourceField[];
    columns: ResourceColumn[];
}

export default function ResourceManager({
    title,
    description,
    endpoint,
    records,
    fields,
    columns,
}: ResourceManagerProps) {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const initialData = Object.fromEntries(fields.map((field) => [field.name, '']));
    const form = useForm<Record<string, string>>(initialData);

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        if (!query) {
            return records;
        }

        return records.filter((record) =>
            columns.some((column) =>
                (record[column.key] ?? '').toLocaleLowerCase().includes(query),
            ),
        );
    }, [columns, records, search]);

    function openCreateDialog() {
        setEditingId(null);
        form.reset();
        form.clearErrors();
        setDialogOpen(true);
    }

    function openEditDialog(record: ResourceRecord) {
        setEditingId(record.id);
        form.setData(
            Object.fromEntries(
                fields.map((field) => [field.name, record[field.name] ?? '']),
            ),
        );
        form.clearErrors();
        setDialogOpen(true);
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                form.reset();
            },
        };

        if (editingId) {
            form.put(`${endpoint}/${editingId}`, options);
            return;
        }

        form.post(endpoint, options);
    }

    function destroy(record: ResourceRecord) {
        if (
            !window.confirm(
                '¿Eliminar este registro? Si tiene elementos asociados, también podrían eliminarse. Esta acción no se puede deshacer.',
            )
        ) {
            return;
        }

        router.delete(`${endpoint}/${record.id}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title={title} />
            <main className="flex min-h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Administración
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus />
                        Nuevo registro
                    </Button>
                </header>

                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-medium">Registros</h2>
                            <p className="text-sm text-muted-foreground">
                                {filteredRecords.length} de {records.length}
                            </p>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                aria-label={`Buscar ${title.toLocaleLowerCase()}`}
                                className="pl-9"
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar..."
                                value={search}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground">
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            className="px-4 py-3 font-medium"
                                            key={column.key}
                                            scope="col"
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="w-24 px-4 py-3 text-right font-medium">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredRecords.map((record) => (
                                    <tr
                                        className="transition-colors hover:bg-muted/30"
                                        key={record.id}
                                    >
                                        {columns.map((column) => (
                                            <td
                                                className="max-w-xs px-4 py-3"
                                                key={column.key}
                                            >
                                                <span className="block truncate">
                                                    {record[column.key] || '—'}
                                                </span>
                                            </td>
                                        ))}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    aria-label={`Editar ${record[columns[0].key]}`}
                                                    onClick={() =>
                                                        openEditDialog(record)
                                                    }
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Pencil />
                                                </Button>
                                                <Button
                                                    aria-label={`Eliminar ${record[columns[0].key]}`}
                                                    onClick={() =>
                                                        destroy(record)
                                                    }
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Trash2 className="text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRecords.length === 0 && (
                                    <tr>
                                        <td
                                            className="px-4 py-12 text-center text-muted-foreground"
                                            colSpan={columns.length + 1}
                                        >
                                            {search
                                                ? 'No se encontraron registros para esa búsqueda.'
                                                : 'Aún no hay registros. Crea el primero para comenzar.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? `Editar ${title.toLocaleLowerCase()}` : `Nuevo registro de ${title.toLocaleLowerCase()}`}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los campos y guarda los cambios.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={submit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {fields.map((field) => (
                                <div
                                    className={
                                        field.type === 'textarea'
                                            ? 'space-y-2 sm:col-span-2'
                                            : 'space-y-2'
                                    }
                                    key={field.name}
                                >
                                    <Label htmlFor={field.name}>
                                        {field.label}
                                    </Label>
                                    {field.type === 'select' ? (
                                        <select
                                            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={
                                                form.processing ||
                                                (field.options?.length ?? 0) === 0
                                            }
                                            id={field.name}
                                            onChange={(event) =>
                                                form.setData(
                                                    field.name,
                                                    event.target.value,
                                                )
                                            }
                                            value={form.data[field.name] ?? ''}
                                        >
                                            <option value="">
                                                {field.options?.length
                                                    ? 'Selecciona una opción'
                                                    : 'Primero crea registros relacionados'}
                                            </option>
                                            {field.options?.map((option) => (
                                                <option
                                                    key={option.id}
                                                    value={option.id}
                                                >
                                                    {option.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === 'textarea' ? (
                                        <textarea
                                            className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={form.processing}
                                            id={field.name}
                                            onChange={(event) =>
                                                form.setData(
                                                    field.name,
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={field.placeholder}
                                            value={form.data[field.name] ?? ''}
                                        />
                                    ) : (
                                        <Input
                                            disabled={form.processing}
                                            id={field.name}
                                            onChange={(event) =>
                                                form.setData(
                                                    field.name,
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={field.placeholder}
                                            value={form.data[field.name] ?? ''}
                                        />
                                    )}
                                    {form.errors[field.name] && (
                                        <p className="text-sm text-destructive">
                                            {form.errors[field.name]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => setDialogOpen(false)}
                                type="button"
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                            <Button disabled={form.processing} type="submit">
                                {form.processing
                                    ? 'Guardando...'
                                    : 'Guardar registro'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

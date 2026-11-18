import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Sucursal extends ResourceRecord {
    ciudad_id: string;
    ciudad: string;
    departamento: string;
    nombre: string;
    direccion: string;
    descripcion: string;
}

const columns: ResourceColumn[] = [
    { key: 'nombre', label: 'Sucursal' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'descripcion', label: 'Descripción' },
];

export default function Index({
    records,
    ciudades,
}: {
    records: Sucursal[];
    ciudades: ResourceOption[];
}) {
    const fields: ResourceField[] = [
        {
            name: 'ciudad_id',
            label: 'Ciudad',
            type: 'select',
            options: ciudades,
        },
        { name: 'nombre', label: 'Nombre', placeholder: 'Nombre de la sucursal' },
        { name: 'direccion', label: 'Dirección', placeholder: 'Dirección' },
        {
            name: 'descripcion',
            label: 'Descripción',
            type: 'textarea',
            placeholder: 'Descripción (opcional)',
        },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Gestiona las sucursales y su ubicación por ciudad."
            endpoint="/sucursales"
            fields={fields}
            records={records}
            title="Sucursales"
        />
    );
}

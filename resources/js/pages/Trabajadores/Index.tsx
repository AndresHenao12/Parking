import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Trabajador extends ResourceRecord {
    sucursal_id: string;
    sucursal: string;
    ciudad: string;
    departamento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    direccion: string;
}

const columns: ResourceColumn[] = [
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'sucursal', label: 'Sucursal' },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'direccion', label: 'Dirección' },
];

export default function Index({
    records,
    sucursales,
}: {
    records: Trabajador[];
    sucursales: ResourceOption[];
}) {
    const fields: ResourceField[] = [
        {
            name: 'sucursal_id',
            label: 'Sucursal',
            type: 'select',
            options: sucursales,
        },
        { name: 'nombres', label: 'Nombres', placeholder: 'Nombres' },
        { name: 'apellidos', label: 'Apellidos', placeholder: 'Apellidos' },
        { name: 'telefono', label: 'Teléfono', placeholder: 'Teléfono (opcional)' },
        { name: 'direccion', label: 'Dirección', placeholder: 'Dirección (opcional)' },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Registra al personal y asígnalo a una sucursal."
            endpoint="/trabajadores"
            fields={fields}
            records={records}
            title="Trabajadores"
        />
    );
}

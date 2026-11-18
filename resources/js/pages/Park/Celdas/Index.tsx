import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Celda extends ResourceRecord {
    codigo: string;
    tipo_vehiculo: string;
    estado: string;
    capacidad: string;
    descripcion: string;
}

const columns: ResourceColumn[] = [
    { key: 'codigo', label: 'Código' },
    { key: 'tipo_vehiculo', label: 'Tipo' },
    { key: 'estado', label: 'Estado' },
    { key: 'capacidad', label: 'Capacidad' },
    { key: 'descripcion', label: 'Descripción' },
];

export default function Index({ records }: { records: Celda[] }) {
    const fields: ResourceField[] = [
        { name: 'codigo', label: 'Código', placeholder: 'A-101' },
        { name: 'tipo_vehiculo', label: 'Tipo de vehículo', placeholder: 'Automóvil' },
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
                { id: 'disponible', nombre: 'Disponible' },
                { id: 'ocupada', nombre: 'Ocupada' },
                { id: 'mantenimiento', nombre: 'Mantenimiento' },
            ] as ResourceOption[],
        },
        { name: 'capacidad', label: 'Capacidad', placeholder: '1 vehículo' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Detalle del espacio' },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Administra las celdas del parqueadero con su tipo, disponibilidad y estado de mantenimiento."
            endpoint="/celdas"
            fields={fields}
            records={records}
            title="Celdas"
        />
    );
}

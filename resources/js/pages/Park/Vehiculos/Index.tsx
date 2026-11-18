import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Vehiculo extends ResourceRecord {
    placa: string;
    marca: string;
    modelo: string;
    color: string;
    tipo_vehiculo: string;
    propietario: string;
    telefono_propietario: string;
    estado: string;
}

const columns: ResourceColumn[] = [
    { key: 'placa', label: 'Placa' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'propietario', label: 'Propietario' },
    { key: 'tipo_vehiculo', label: 'Tipo' },
    { key: 'estado', label: 'Estado' },
];

export default function Index({ records }: { records: Vehiculo[] }) {
    const fields: ResourceField[] = [
        { name: 'placa', label: 'Placa', placeholder: 'ABC123' },
        { name: 'marca', label: 'Marca', placeholder: 'Toyota' },
        { name: 'modelo', label: 'Modelo', placeholder: 'Corolla' },
        { name: 'color', label: 'Color', placeholder: 'Blanco' },
        { name: 'tipo_vehiculo', label: 'Tipo de vehículo', placeholder: 'Automóvil' },
        { name: 'propietario', label: 'Propietario', placeholder: 'Nombre del cliente' },
        { name: 'telefono_propietario', label: 'Teléfono', placeholder: '3001234567' },
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
                { id: 'activo', nombre: 'Activo' },
                { id: 'inactivo', nombre: 'Inactivo' },
            ] as ResourceOption[],
        },
        { name: 'observacion', label: 'Observación', type: 'textarea', placeholder: 'Detalles adicionales' },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Administra los vehículos registrados, su propietario y su estado operativo."
            endpoint="/vehiculos"
            fields={fields}
            records={records}
            title="Vehículos"
        />
    );
}

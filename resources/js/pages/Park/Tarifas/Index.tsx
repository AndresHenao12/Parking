import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Tarifa extends ResourceRecord {
    nombre: string;
    tipo_vehiculo: string;
    precio_hora: string;
    precio_diario: string;
    activo: string;
}

const columns: ResourceColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'tipo_vehiculo', label: 'Tipo' },
    { key: 'precio_hora', label: 'Hora' },
    { key: 'precio_diario', label: 'Diario' },
    { key: 'activo', label: 'Estado' },
];

export default function Index({ records }: { records: Tarifa[] }) {
    const fields: ResourceField[] = [
        { name: 'nombre', label: 'Nombre', placeholder: 'Tarifa estándar' },
        { name: 'tipo_vehiculo', label: 'Tipo de vehículo', placeholder: 'Automóvil' },
        { name: 'precio_hora', label: 'Precio por hora', placeholder: '2500' },
        { name: 'precio_diario', label: 'Precio diario', placeholder: '20000' },
        {
            name: 'activo',
            label: 'Activo',
            type: 'select',
            options: [
                { id: '1', nombre: 'Activo' },
                { id: '0', nombre: 'Inactiva' },
            ] as ResourceOption[],
        },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Define las tarifas por tipo de vehículo y su vigencia en el parqueadero."
            endpoint="/tarifas"
            fields={fields}
            records={records}
            title="Tarifas"
        />
    );
}

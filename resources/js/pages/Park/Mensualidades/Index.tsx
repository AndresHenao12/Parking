import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Mensualidad extends ResourceRecord {
    vehiculo: string;
    tarifa: string;
    valor: string;
    fecha_inicio: string;
    fecha_vencimiento: string;
    estado: string;
}

const columns: ResourceColumn[] = [
    { key: 'vehiculo', label: 'Vehículo' },
    { key: 'tarifa', label: 'Tarifa' },
    { key: 'valor', label: 'Valor' },
    { key: 'fecha_inicio', label: 'Inicio' },
    { key: 'fecha_vencimiento', label: 'Vence' },
    { key: 'estado', label: 'Estado' },
];

export default function Index({
    records,
    vehiculos,
    tarifas,
}: {
    records: Mensualidad[];
    vehiculos: ResourceOption[];
    tarifas: ResourceOption[];
}) {
    const fields: ResourceField[] = [
        {
            name: 'vehiculo_id',
            label: 'Vehículo',
            type: 'select',
            options: vehiculos,
        },
        {
            name: 'tarifa_id',
            label: 'Tarifa',
            type: 'select',
            options: tarifas,
        },
        { name: 'valor', label: 'Valor', placeholder: '120000' },
        { name: 'fecha_inicio', label: 'Fecha de inicio', placeholder: '2026-11-01' },
        { name: 'fecha_vencimiento', label: 'Fecha de vencimiento', placeholder: '2026-12-01' },
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
                { id: 'vigente', nombre: 'Vigente' },
                { id: 'vencida', nombre: 'Vencida' },
                { id: 'desactivada', nombre: 'Desactivada' },
            ] as ResourceOption[],
        },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Administra planes de mensualidad vigentes, vencidos y desactivados."
            endpoint="/mensualidades"
            fields={fields}
            records={records}
            title="Mensualidades"
        />
    );
}

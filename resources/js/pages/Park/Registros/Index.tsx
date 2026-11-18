import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Registro extends ResourceRecord {
    vehiculo: string;
    celda: string;
    tarifa: string;
    hora_entrada: string;
    hora_salida: string;
    tiempo_minutos: string;
    valor_total: string;
    estado: string;
}

const columns: ResourceColumn[] = [
    { key: 'vehiculo', label: 'Vehículo' },
    { key: 'celda', label: 'Celda' },
    { key: 'hora_entrada', label: 'Entrada' },
    { key: 'hora_salida', label: 'Salida' },
    { key: 'valor_total', label: 'Valor' },
    { key: 'estado', label: 'Estado' },
];

export default function Index({
    records,
    vehiculos,
    celdas,
    tarifas,
}: {
    records: Registro[];
    vehiculos: ResourceOption[];
    celdas: ResourceOption[];
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
            name: 'celda_id',
            label: 'Celda',
            type: 'select',
            options: celdas,
        },
        {
            name: 'tarifa_id',
            label: 'Tarifa',
            type: 'select',
            options: tarifas,
        },
        { name: 'hora_entrada', label: 'Hora de entrada', placeholder: '2026-11-16 08:30:00' },
        { name: 'hora_salida', label: 'Hora de salida', placeholder: '2026-11-16 18:00:00' },
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
                { id: 'activo', nombre: 'Activo' },
                { id: 'finalizado', nombre: 'Finalizado' },
            ] as ResourceOption[],
        },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Registra las entradas y salidas de vehículos y actualiza automáticamente la disponibilidad de las celdas."
            endpoint="/registros"
            fields={fields}
            records={records}
            title="Entradas y salidas"
        />
    );
}

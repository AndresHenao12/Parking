import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Ciudad extends ResourceRecord {
    departamento_id: string;
    departamento: string;
    nombre: string;
    descripcion: string;
}

const columns: ResourceColumn[] = [
    { key: 'nombre', label: 'Ciudad' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'descripcion', label: 'Descripción' },
];

export default function Index({
    records,
    departamentos,
}: {
    records: Ciudad[];
    departamentos: ResourceOption[];
}) {
    const fields: ResourceField[] = [
        {
            name: 'departamento_id',
            label: 'Departamento',
            type: 'select',
            options: departamentos,
        },
        { name: 'nombre', label: 'Nombre', placeholder: 'Nombre de la ciudad' },
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
            description="Administra las ciudades y asígnalas a su departamento."
            endpoint="/ciudades"
            fields={fields}
            records={records}
            title="Ciudades"
        />
    );
}

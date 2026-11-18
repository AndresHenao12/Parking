import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Departamento extends ResourceRecord {
    nombre: string;
    descripcion: string;
    ciudades: string;
}

const fields: ResourceField[] = [
    { name: 'nombre', label: 'Nombre', placeholder: 'Nombre del departamento' },
    {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        placeholder: 'Descripción (opcional)',
    },
];

const columns: ResourceColumn[] = [
    { key: 'nombre', label: 'Departamento' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'ciudades', label: 'Ciudades' },
];

export default function Index({ records }: { records: Departamento[] }) {
    return (
        <ResourceManager
            columns={columns}
            description="Organiza las ciudades y sucursales por departamento."
            endpoint="/departamentos"
            fields={fields}
            records={records}
            title="Departamentos"
        />
    );
}

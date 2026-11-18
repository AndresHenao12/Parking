import ResourceManager, {
    type ResourceColumn,
    type ResourceField,
    type ResourceOption,
    type ResourceRecord,
} from '@/components/resource-manager';

interface Usuario extends ResourceRecord {
    name: string;
    email: string;
    role: string;
}

const columns: ResourceColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    { key: 'role', label: 'Rol' },
];

export default function Index({ records }: { records: Usuario[] }) {
    const fields: ResourceField[] = [
        { name: 'name', label: 'Nombre', placeholder: 'Nombre completo' },
        { name: 'email', label: 'Correo', placeholder: 'usuario@parking.com' },
        {
            name: 'role',
            label: 'Rol',
            type: 'select',
            options: [
                { id: 'admin', nombre: 'Administrador' },
                { id: 'operario', nombre: 'Operario' },
            ] as ResourceOption[],
        },
        { name: 'password', label: 'Contraseña', placeholder: 'Mínimo 8 caracteres' },
    ];

    return (
        <ResourceManager
            columns={columns}
            description="Administra los usuarios del sistema y sus permisos según el rol asignado."
            endpoint="/usuarios"
            fields={fields}
            records={records}
            title="Usuarios"
        />
    );
}

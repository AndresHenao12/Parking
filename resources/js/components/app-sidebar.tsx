import { Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    CarFront,
    ClipboardList,
    LayoutGrid,
    MapPinned,
    ShieldCheck,
    Users,
    Warehouse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as { auth?: { user?: { role?: string } } };
    const role = auth?.user?.role ?? 'admin';

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ...(role === 'admin' ? [{ title: 'Usuarios', href: '/usuarios', icon: Users }] : []),
        { title: 'Vehículos', href: '/vehiculos', icon: CarFront },
        { title: 'Tarifas', href: '/tarifas', icon: BadgeDollarSign },
        { title: 'Celdas', href: '/celdas', icon: Warehouse },
        { title: 'Entradas y salidas', href: '/registros', icon: ClipboardList },
        { title: 'Mensualidades', href: '/mensualidades', icon: ShieldCheck },
        { title: 'Reportes', href: '/reportes', icon: MapPinned },
    ];

    const footerNavItems: NavItem[] = [];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

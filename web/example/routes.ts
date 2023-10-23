import { Routes } from '@robertakarobin/web/routes.ts';

export const routes = {
	home: `/home`,
	splash: `/`,
	tenant: (id: string) => `/tenants/${id}`,
	tenants: `/tenants`,
} as const satisfies Routes;

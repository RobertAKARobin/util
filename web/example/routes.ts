import { Routes } from '@robertakarobin/web/routes.ts';

export const routes = {
	error404: `/404`,
	home: `/home`,
	splash: `/`,
	tenant: (id: string) => `/tenants/${id}`,
	tenants: `/tenants`,
} as const satisfies Routes;


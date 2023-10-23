import { routeFactory } from '@robertakarobin/web/components/route.ts';
import { Routes } from '@robertakarobin/web/index.ts';

export const routes = {
	error404: `/404` as string,
	home: `/home` as string,
	splash: `/` as string,
	tenant: (params: { id: string; }) => `/tenants/${params.id}`,
	tenants: `/tenants` as string,
} as const satisfies Routes;

export const route = routeFactory(routes);

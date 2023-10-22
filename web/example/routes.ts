export const routes = {
	home: `/home`,
	splash: `/`,
	tenant: (id: string) => `/tenants/${id}`,
	tenants: `/tenants`,
} as const;

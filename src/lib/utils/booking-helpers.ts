/** Get service config for a given service type from provider's offers. */
export function getServiceConfig<T extends { type: string }>(
  provider: { services: T[] },
  serviceType: string
): T | undefined {
  return provider.services.find((s) => s.type === serviceType);
}

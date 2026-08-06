type ServiceInput = {
  title?: unknown;
  price?: unknown;
  billingType?: unknown;
};

export type CheckoutLineItem = {
  name: string;
  unitAmountCents: number;
  currency: string;
  billingType: 'one_time' | 'month' | 'year';
  bundledAsOneTime?: boolean;
};

function normalizeProductInterval(interval: unknown): 'month' | 'year' {
  return interval === 'year' ? 'year' : 'month';
}

function serviceBillingInterval(billingType: unknown): 'one_time' | 'month' | 'year' {
  if (billingType === 'year') return 'year';
  if (billingType === 'month') return 'month';
  return 'one_time';
}

export function buildAdditionalLineItems(
  productInterval: unknown,
  services: ServiceInput[],
  currency: string,
): CheckoutLineItem[] {
  const productCycle = normalizeProductInterval(productInterval);

  return services
    .map((service) => {
      const price = Number(service.price || 0);
      const title = String(service.title || 'Servicio adicional');
      const billingType = String(service.billingType || 'one_time');
      const serviceCycle = serviceBillingInterval(billingType);
      const unitAmountCents = Math.round(price * 100);

      if (unitAmountCents <= 0) return null;

      if (billingType === 'one_time' || serviceCycle === productCycle) {
        return {
          name: title,
          unitAmountCents,
          currency,
          billingType: billingType === 'one_time' ? 'one_time' as const : serviceCycle,
        };
      }

      if (serviceCycle === 'month' && productCycle === 'year') {
        return {
          name: `${title} (1er mes)`,
          unitAmountCents,
          currency,
          billingType: 'one_time' as const,
          bundledAsOneTime: true,
        };
      }

      if (serviceCycle === 'year' && productCycle === 'month') {
        return {
          name: `${title} (1er mes)`,
          unitAmountCents: Math.round((price / 12) * 100),
          currency,
          billingType: 'one_time' as const,
          bundledAsOneTime: true,
        };
      }

      return {
        name: title,
        unitAmountCents,
        currency,
        billingType: 'one_time' as const,
        bundledAsOneTime: true,
      };
    })
    .filter((item): item is CheckoutLineItem => Boolean(item));
}

export function calculateDueTodayTotal(
  productPrice: number,
  productInterval: unknown,
  services: ServiceInput[],
): number {
  const productCycle = normalizeProductInterval(productInterval);
  const addonTotal = buildAdditionalLineItems(productCycle, services, 'USD')
    .reduce((sum, item) => sum + item.unitAmountCents, 0);

  return Number(productPrice || 0) + addonTotal / 100;
}

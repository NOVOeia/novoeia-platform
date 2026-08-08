export function normalizeProductInterval(interval) {
  return interval === 'year' ? 'year' : 'month';
}

export function serviceBillingInterval(billingType) {
  if (billingType === 'year') return 'year';
  if (billingType === 'month') return 'month';
  return 'one_time';
}

export function hasBillingIntervalMismatch(service, productInterval) {
  const serviceInterval = serviceBillingInterval(service.billingType);
  if (serviceInterval === 'one_time') return false;
  return serviceInterval !== normalizeProductInterval(productInterval);
}

export function buildCheckoutServiceLineItem(service, productInterval) {
  const price = Number(service.price || 0);
  const title = String(service.title || 'Servicio adicional');
  const billingType = service.billingType || 'one_time';
  const productCycle = normalizeProductInterval(productInterval);
  const serviceCycle = serviceBillingInterval(billingType);

  if (billingType === 'one_time' || serviceCycle === productCycle) {
    return {
      name: title,
      dueToday: price,
      billingType: billingType === 'one_time' ? 'one_time' : serviceCycle,
      bundled: false,
      summaryLabel: serviceBillingLabel(billingType),
    };
  }

  if (serviceCycle === 'month' && productCycle === 'year') {
    return {
      name: title,
      dueToday: price,
      billingType: 'month',
      bundled: true,
      summaryLabel: 'Suscripción mensual · 1er mes incluido hoy',
    };
  }

  if (serviceCycle === 'year' && productCycle === 'month') {
    const monthlyPortion = Math.round((price / 12) * 100) / 100;
    return {
      name: title,
      dueToday: monthlyPortion,
      billingType: 'year',
      bundled: true,
      summaryLabel: 'Suscripción anual · 1er mes incluido hoy',
    };
  }

  return {
    name: title,
    dueToday: price,
    billingType: 'one_time',
    bundled: false,
    summaryLabel: serviceBillingLabel(billingType),
  };
}

export function calculateCheckoutDueToday(product, services = []) {
  const productPrice = Number(product?.price || 0);
  const addonTotal = services.reduce(
    (sum, service) => sum + buildCheckoutServiceLineItem(service, product?.interval).dueToday,
    0,
  );
  const recurringAddonTotal = services.reduce((sum, service) => {
    const line = buildCheckoutServiceLineItem(service, product?.interval);
    if (line.billingType === 'month' || line.billingType === 'year') {
      return sum + Number(service.price || 0);
    }
    return sum;
  }, 0);

  const oneTimeTotal = services
    .filter(service => serviceBillingInterval(service.billingType) === 'one_time')
    .reduce((sum, service) => sum + Number(service.price || 0), 0);

  const deferredMonthlyAddons = services.filter(service => {
    const line = buildCheckoutServiceLineItem(service, product?.interval);
    return line.bundled && line.billingType === 'month';
  });

  return {
    dueToday: productPrice + addonTotal,
    subscriptionRecurringTotal: productPrice + recurringAddonTotal,
    oneTimeTotal,
    deferredMonthlyAddons,
    hasDeferredMonthlyAddons: deferredMonthlyAddons.length > 0,
  };
}

export function serviceBillingLabel(billingType) {
  if (billingType === 'month') return '/ mes';
  if (billingType === 'year') return '/ año';
  return ' · pago único';
}

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
      billingType: 'one_time',
      bundled: true,
      summaryLabel: 'pago único (1er mes)',
    };
  }

  if (serviceCycle === 'year' && productCycle === 'month') {
    const monthlyPortion = Math.round((price / 12) * 100) / 100;
    return {
      name: title,
      dueToday: monthlyPortion,
      billingType: 'one_time',
      bundled: true,
      summaryLabel: 'pago único (1er mes)',
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
  const recurringAddonTotal = services
    .filter(service => !buildCheckoutServiceLineItem(service, product?.interval).bundled
      && serviceBillingInterval(service.billingType) !== 'one_time')
    .reduce((sum, service) => sum + Number(service.price || 0), 0);

  return {
    dueToday: productPrice + addonTotal,
    subscriptionRecurringTotal: productPrice + recurringAddonTotal,
    oneTimeTotal: services
      .filter(service => buildCheckoutServiceLineItem(service, product?.interval).billingType === 'one_time'
        || buildCheckoutServiceLineItem(service, product?.interval).bundled)
      .reduce((sum, service) => sum + buildCheckoutServiceLineItem(service, product?.interval).dueToday, 0),
  };
}

export function serviceBillingLabel(billingType) {
  if (billingType === 'month') return '/ mes';
  if (billingType === 'year') return '/ año';
  return ' · pago único';
}

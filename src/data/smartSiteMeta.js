const demoMeta = {
  restaurant: {
    domain: "holycannoli.com",
    label: "Sitio web para restaurantes y food trucks",
    sub: "Men\xFA, pedidos, eventos y promociones"
  },
  clinic: {
    domain: "clinicavitalis.com",
    label: "Sitio web para cl\xEDnicas y consultorios",
    sub: "Servicios, citas y seguimiento de pacientes"
  },
  realestate: {
    domain: "meridianestates.com",
    label: "Sitio web para inmobiliarias y agentes",
    sub: "Propiedades, visitas y solicitudes"
  },
  advisory: {
    domain: "northbridge.co",
    label: "Sitio web para consultoras y servicios B2B",
    sub: "Servicios, casos y solicitudes de cotizaci\xF3n"
  },
  beauty: {
    domain: "studioluce.com",
    label: "Sitio web para salones y centros de est\xE9tica",
    sub: "Reservas, cat\xE1logo de servicios y promociones"
  },
  event: {
    domain: "latidoyhuella.com",
    label: "Sitio web para eventos y organizaciones",
    sub: "Inscripciones, agenda, aliados y pagos"
  },
  "home-service": {
    domain: "summitroofpaint.com",
    label: "Sitio web para roofing, pintura y servicios del hogar",
    sub: "Cotizaciones, zonas de servicio y portafolio"
  },
  retail: {
    domain: "forgenutrition.com",
    label: "Sitio web para tiendas de productos",
    sub: "Cat\xE1logo, promociones, pagos y contactos"
  }
};
function metaFor(id) {
  return demoMeta[id] || { domain: "tunegocio.com", label: "Sitio web profesional", sub: "Contenido administrable y contactos ordenados" };
}
export {
  demoMeta,
  metaFor
};

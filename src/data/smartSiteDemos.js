const img = {
  resto: "/685205bb-e35e-4598-b607-97c9f088fa04.jpg",
  restoDetail: "/8a97f653-1b27-44aa-82db-6f8429a01e38.jpg",
  clinic: "/f97ad662-e185-4ecd-a099-d4436dc6fcf8.jpg",
  clinicDetail: "/9e66c142-afee-4e45-93dc-56fe271f70ac.jpg",
  estate: "/9e9279a4-42bc-41bd-9a7b-67cd4c94503d.jpg",
  estateDetail: "/a2cdd0d5-321d-44f3-89fd-091656234f1d.jpg",
  advisory: "/ef6ef4cc-91cd-4c38-bd5a-bd0d78982510.jpg",
  beauty: "/f6bc1b4e-813b-4d30-9781-5dc79cf12079.jpg",
  event: "/6e3c0e8a-f094-451f-b111-913529e35c30.jpg",
  roof: "/fcb99b79-934f-40f0-85b6-a92e9630789b.jpg",
  roofDetail: "/9fcf7148-a8c6-40fc-ae37-959983cc9b60.jpg",
  retail: "/19188b93-590a-4afa-be32-3a00f285fe87.jpg",
  retailDetail: "/dd824220-9ee1-4977-a1b3-4af5d7791c01.jpg"
};
const smartSiteDemos = [
  {
    id: "restaurant",
    name: "Holy Cannoli",
    industry: "Restaurante / Food Truck",
    status: "CLIENTE REAL",
    accent: "#f0913f",
    accentSoft: "#3a2313",
    description: "Men\xFA vivo, eventos y pedidos, administrados sin depender de terceros.",
    signature: "Editorial c\xE1lido, tipograf\xEDa con car\xE1cter y foto protagonista.",
    image: img.resto,
    liveUrl: "https://project-holy-cannoli-food-truck-471.magicpatterns.app",
    theme: { bg: "#140d08", surface: "#1e1510", text: "#fdf6ee", muted: "#bda891", line: "rgba(255,236,214,.14)", accent: "#f0913f", accentText: "#1a1009", radius: "4px", font: "'Space Grotesk', serif", navStyle: "center" },
    management: ["Men\xFA y precios", "Promociones", "Eventos", "Pedidos"],
    metrics: [["38", "Pedidos hoy"], ["4.9", "Calificaci\xF3n"], ["2", "Eventos activos"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "COCINA ITALIANA DE BARRIO", title: "Cannoli reci\xE9n hechos, todos los d\xEDas.", text: "Un food truck con alma de pasteler\xEDa siciliana. Encu\xE9ntranos, reserva para tu evento o pide para llevar.", primary: "Ver el men\xFA", secondary: "D\xF3nde estamos", image: img.resto },
          { kind: "stats", items: [["12", "A\xF1os horneando"], ["4.9\u2605", "1.240 rese\xF1as"], ["3", "Ubicaciones semanales"]] }
        ]
      },
      {
        label: "Men\xFA",
        sections: [
          {
            kind: "list",
            title: "El men\xFA de esta semana",
            subtitle: "Cambia seg\xFAn lo que llega fresco cada martes.",
            items: [
              { name: "Cannoli cl\xE1sico", text: "Ricotta de oveja, pistacho de Bronte, naranja confitada.", meta: "$6", tag: "Favorito" },
              { name: "Cannoli de caf\xE9", text: "Crema de espresso, cacao amargo, avellana tostada.", meta: "$7" },
              { name: "Tabla para compartir", text: "Seis piezas surtidas + dos espressos dobles.", meta: "$28", tag: "Para dos" },
              { name: "Espresso de la casa", text: "Tueste medio, cuerpo intenso, notas de chocolate.", meta: "$4" }
            ]
          },
          { kind: "gallery", title: "Del horno a tu mano", subtitle: "", images: [img.restoDetail, img.resto, img.restoDetail] }
        ]
      },
      {
        label: "Eventos",
        sections: [
          {
            kind: "timeline",
            title: "D\xF3nde encontrarnos",
            subtitle: "Actualizamos la ruta cada semana desde el panel.",
            items: [
              { time: "JUE", name: "Mercado de Wynwood", text: "17:00 \u2013 23:00 \xB7 NW 2nd Ave" },
              { time: "VIE", name: "Food Truck Night", text: "18:00 \u2013 00:00 \xB7 Brickell Park" },
              { time: "S\xC1B", name: "Farmers Market", text: "09:00 \u2013 14:00 \xB7 Coconut Grove" }
            ]
          },
          { kind: "contact", title: "\xBFUn evento privado?", subtitle: "Catering para bodas, cumplea\xF1os y eventos corporativos.", details: [["M\xEDnimo", "50 piezas"], ["Aviso", "72 horas"], ["Zona", "Miami-Dade"]], cta: "Solicitar catering" }
        ]
      }
    ]
  },
  {
    id: "clinic",
    name: "Atria Wellness",
    industry: "Cl\xEDnica / Salud y bienestar",
    status: "DEMO INTERACTIVA",
    accent: "#3f9d84",
    accentSoft: "#eaf6f2",
    description: "Servicios, agenda y formularios cl\xEDnicos en una experiencia serena.",
    signature: "Luz, aire y ritmo pausado: confianza antes que venta.",
    image: img.clinic,
    theme: { bg: "#f7faf8", surface: "#ffffff", text: "#152b26", muted: "#5e7772", line: "rgba(21,43,38,.1)", accent: "#3f9d84", accentText: "#ffffff", radius: "18px", font: "'Space Grotesk', sans-serif", navStyle: "split" },
    management: ["Servicios", "Agenda", "Solicitudes", "Pacientes"],
    metrics: [["27", "Solicitudes"], ["12", "Citas hoy"], ["94%", "Respuesta a tiempo"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "MEDICINA INTEGRATIVA", title: "Cuidado que empieza escuchando.", text: "Un equipo que acompa\xF1a tu proceso completo: diagn\xF3stico, tratamiento y seguimiento real.", primary: "Agendar consulta", secondary: "Conocer servicios", image: img.clinic },
          { kind: "stats", items: [["8", "Especialidades"], ["15 min", "Respuesta promedio"], ["2.400", "Pacientes acompa\xF1ados"]] }
        ]
      },
      {
        label: "Servicios",
        sections: [
          {
            kind: "cards",
            title: "\xC1reas de atenci\xF3n",
            subtitle: "Cada servicio con su propio formulario y tiempos.",
            items: [
              { name: "Medicina funcional", text: "Evaluaci\xF3n integral con laboratorio y plan personalizado.", meta: "60 min", image: img.clinicDetail },
              { name: "Nutrici\xF3n cl\xEDnica", text: "Plan alimentario adaptado a tu condici\xF3n y objetivos.", meta: "45 min", image: img.clinic },
              { name: "Terapia f\xEDsica", text: "Recuperaci\xF3n guiada con seguimiento semanal.", meta: "50 min", image: img.clinicDetail }
            ]
          }
        ]
      },
      {
        label: "Agendar",
        sections: [
          { kind: "booking", title: "Reserva tu consulta", subtitle: "Elige horario y completa lo esencial. Confirmamos el mismo d\xEDa.", fields: ["Nombre completo", "Correo electr\xF3nico", "Motivo de consulta"], slots: ["Hoy 15:30", "Ma\xF1ana 09:00", "Ma\xF1ana 11:30", "Vie 16:00"], note: "Los datos cl\xEDnicos quedan registrados en el panel del equipo.", cta: "Confirmar solicitud" }
        ]
      }
    ]
  },
  {
    id: "real-estate",
    name: "Northline Properties",
    industry: "Bienes ra\xEDces",
    status: "DEMO INTERACTIVA",
    accent: "#c9a227",
    accentSoft: "#141a24",
    description: "Inventario, visitas y oportunidades con presentaci\xF3n de lujo.",
    signature: "Oscuro, sofisticado, con la propiedad como pieza central.",
    image: img.estate,
    theme: { bg: "#0d1119", surface: "#151b26", text: "#f3f6fb", muted: "#93a1b5", line: "rgba(255,255,255,.1)", accent: "#c9a227", accentText: "#14181f", radius: "2px", font: "'Space Grotesk', serif", navStyle: "wide" },
    management: ["Inventario", "Consultas", "Visitas", "Oportunidades"],
    metrics: [["18", "Consultas nuevas"], ["6", "Visitas agendadas"], ["12", "Propiedades activas"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "COLECCI\xD3N 2026", title: "Propiedades con contexto. Decisiones con claridad.", text: "Curamos residencias que valen la visita, con la informaci\xF3n que realmente necesitas antes de decidir.", primary: "Ver colecci\xF3n", secondary: "Agendar visita", image: img.estate },
          { kind: "stats", items: [["$4.2M", "Ticket promedio"], ["21", "D\xEDas en mercado"], ["96%", "Precio de lista"]] }
        ]
      },
      {
        label: "Propiedades",
        sections: [
          {
            kind: "cards",
            title: "Disponibles ahora",
            subtitle: "Actualizado desde el panel cada ma\xF1ana.",
            items: [
              { name: "Villa Marisol", text: "4 hab \xB7 5 ba\xF1os \xB7 480 m\xB2 \xB7 piscina infinita", meta: "$4.850.000", image: img.estate },
              { name: "Residencia Aurora", text: "3 hab \xB7 3 ba\xF1os \xB7 310 m\xB2 \xB7 vista al parque", meta: "$2.190.000", image: img.estateDetail },
              { name: "Penthouse Nine", text: "3 hab \xB7 4 ba\xF1os \xB7 400 m\xB2 \xB7 terraza privada", meta: "$6.400.000", image: img.estate }
            ]
          }
        ]
      },
      {
        label: "Visitas",
        sections: [
          { kind: "booking", title: "Agenda una visita privada", subtitle: "Un asesor confirma disponibilidad en menos de 2 horas.", fields: ["Nombre", "Tel\xE9fono de contacto", "Propiedad de inter\xE9s"], slots: ["S\xE1b 10:00", "S\xE1b 12:30", "Dom 11:00", "Lun 17:00"], note: "Cada solicitud entra al pipeline comercial con su origen y propiedad.", cta: "Reservar visita" }
        ]
      }
    ]
  },
  {
    id: "professional",
    name: "Westbridge Advisory",
    industry: "Servicios profesionales / B2B",
    status: "DEMO INTERACTIVA",
    accent: "#5b7cfa",
    accentSoft: "#eef1ff",
    description: "Soluciones, casos y evaluaciones cualificadas para equipos consultores.",
    signature: "Corporativo contempor\xE1neo, con datos y credibilidad al frente.",
    image: img.advisory,
    theme: { bg: "#0b1020", surface: "#141b31", text: "#eef2fb", muted: "#8e9cbd", line: "rgba(255,255,255,.09)", accent: "#5b7cfa", accentText: "#ffffff", radius: "12px", font: "'Space Grotesk', sans-serif", navStyle: "split" },
    management: ["Servicios", "Formularios", "Oportunidades", "Reportes"],
    metrics: [["14", "Evaluaciones"], ["8", "Oportunidades"], ["3", "Propuestas activas"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "ESTRATEGIA & OPERACIONES", title: "Claridad para decidir mejor.", text: "Acompa\xF1amos a equipos directivos a ordenar prioridades, procesos y crecimiento con evidencia.", primary: "Solicitar evaluaci\xF3n", secondary: "Ver enfoque", image: img.advisory },
          { kind: "stats", items: [["120+", "Proyectos"], ["18", "Industrias"], ["4.8", "NPS promedio"]] }
        ]
      },
      {
        label: "Soluciones",
        sections: [
          {
            kind: "cards",
            title: "C\xF3mo trabajamos",
            subtitle: "Alcances definidos, entregables claros.",
            items: [
              { name: "Diagn\xF3stico 360", text: "Cuatro semanas para mapear operaci\xF3n, datos y cuellos de botella.", meta: "4 semanas" },
              { name: "Redise\xF1o de procesos", text: "Implementaci\xF3n acompa\xF1ada con m\xE9tricas de adopci\xF3n.", meta: "8 semanas" },
              { name: "Acompa\xF1amiento continuo", text: "Comit\xE9 mensual, tablero y prioridades revisadas.", meta: "Mensual" }
            ]
          }
        ]
      },
      {
        label: "Casos",
        sections: [
          {
            kind: "list",
            title: "Resultados que podemos contar",
            subtitle: "Casos reales, cifras verificadas con el cliente.",
            items: [
              { name: "Retail regional", text: "Reducci\xF3n de 32% en tiempo de respuesta comercial.", meta: "2025", tag: "Operaciones" },
              { name: "Grupo cl\xEDnico", text: "Unificaci\xF3n de 5 sedes en un solo proceso de agenda.", meta: "2025", tag: "Salud" },
              { name: "Manufactura", text: "Pipeline ordenado y previsi\xF3n trimestral confiable.", meta: "2024", tag: "B2B" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "beauty",
    name: "Marea Studio",
    industry: "Belleza / Bienestar",
    status: "DEMO INTERACTIVA",
    accent: "#c96f86",
    accentSoft: "#fdf1f3",
    description: "Reservas, servicios y galer\xEDa con una est\xE9tica suave y cuidada.",
    signature: "C\xE1lido, femenino y t\xE1ctil; curvas suaves y mucho aire.",
    image: img.beauty,
    theme: { bg: "#fdf8f6", surface: "#ffffff", text: "#3a2229", muted: "#8a6b73", line: "rgba(58,34,41,.1)", accent: "#c96f86", accentText: "#ffffff", radius: "999px", font: "'Space Grotesk', sans-serif", navStyle: "center" },
    management: ["Servicios", "Agenda", "Promociones", "Clientes"],
    metrics: [["41", "Reservas"], ["8", "Clientes nuevos"], ["3", "Promos activas"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "STUDIO DE AUTOR", title: "Tu momento, bien cuidado.", text: "Un espacio peque\xF1o, con atenci\xF3n personalizada y resultados que se notan al salir.", primary: "Reservar ahora", secondary: "Ver servicios", image: img.beauty },
          { kind: "stats", items: [["6", "Especialistas"], ["30 min", "Consulta previa"], ["4.9\u2605", "480 rese\xF1as"]] }
        ]
      },
      {
        label: "Servicios",
        sections: [
          {
            kind: "list",
            title: "Carta de servicios",
            subtitle: "Precios visibles, sin sorpresas al final.",
            items: [
              { name: "Color personalizado", text: "Diagn\xF3stico, mezcla a medida y tratamiento sellador.", meta: "$180", tag: "3 h" },
              { name: "Corte y styling", text: "Asesor\xEDa de forma seg\xFAn rostro y textura.", meta: "$95", tag: "1 h" },
              { name: "Ritual de hidrataci\xF3n", text: "Tratamiento profundo con masaje capilar.", meta: "$70", tag: "45 min" }
            ]
          }
        ]
      },
      {
        label: "Reservar",
        sections: [
          { kind: "booking", title: "Elige tu horario", subtitle: "Confirmamos por WhatsApp en minutos.", fields: ["Nombre", "WhatsApp", "Servicio deseado"], slots: ["Hoy 16:00", "Ma\xF1ana 10:30", "Jue 14:00", "S\xE1b 09:30"], note: "Cada reserva queda registrada con historial de la clienta.", cta: "Reservar mi cita" },
          { kind: "gallery", title: "Trabajos recientes", subtitle: "", images: [img.beauty, img.beauty, img.beauty] }
        ]
      }
    ]
  },
  {
    id: "event",
    name: "Latido y Huella",
    industry: "Eventos / Organizaciones",
    status: "CLIENTE REAL",
    accent: "#ff5f8d",
    accentSoft: "#2a1220",
    description: "Inscripciones, agenda, aliados y flujos completos para participantes.",
    signature: "Vibrante y festivo, con energ\xEDa de comunidad.",
    image: img.event,
    liveUrl: "https://project-caring-mars-734.magicpatterns.app",
    theme: { bg: "#160b17", surface: "#231029", text: "#fff4f8", muted: "#c4a3b6", line: "rgba(255,255,255,.12)", accent: "#ff5f8d", accentText: "#1c0a14", radius: "22px", font: "'Space Grotesk', sans-serif", navStyle: "center" },
    management: ["Inscripciones", "Agenda", "Aliados", "Participantes"],
    metrics: [["284", "Inscritos"], ["16", "Aliados"], ["9", "Actividades"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "8 DE NOVIEMBRE \xB7 PARQUE CENTRAL", title: "Camina, corre y adopta. Todo en un mismo d\xEDa.", text: "Una jornada para celebrar el v\xEDnculo con nuestras mascotas y apoyar a los refugios de la ciudad.", primary: "Inscribirme", secondary: "Ver agenda", image: img.event },
          { kind: "stats", items: [["284", "Inscritos"], ["3K / 5K", "Rutas"], ["16", "Aliados"]] }
        ]
      },
      {
        label: "Actividades",
        sections: [
          {
            kind: "timeline",
            title: "Agenda del d\xEDa",
            subtitle: "Cada bloque con su cupo y punto de encuentro.",
            items: [
              { time: "07:00", name: "Entrega de kits", text: "Zona norte del parque \xB7 trae tu confirmaci\xF3n" },
              { time: "08:00", name: "Salida ruta 5K", text: "Con acompa\xF1amiento veterinario en ruta" },
              { time: "10:00", name: "Feria de adopci\xF3n", text: "12 refugios presentes \xB7 adopci\xF3n responsable" },
              { time: "12:00", name: "Premiaci\xF3n", text: "Reconocimientos y cierre musical" }
            ]
          }
        ]
      },
      {
        label: "Inscripci\xF3n",
        sections: [
          { kind: "booking", title: "Reserva tu cupo", subtitle: "Inscripci\xF3n en dos minutos, confirmaci\xF3n inmediata.", fields: ["Nombre del participante", "Correo", "Nombre de tu mascota"], slots: ["Ruta 3K", "Ruta 5K", "Solo feria", "Voluntariado"], note: "Cada inscripci\xF3n genera su registro, pago y confirmaci\xF3n.", cta: "Completar inscripci\xF3n" }
        ]
      }
    ]
  },
  {
    id: "home-service",
    name: "Summit Roof & Paint",
    industry: "Roofing / Pintura / Hogar",
    status: "DEMO INTERACTIVA",
    accent: "#ff7a29",
    accentSoft: "#1d1409",
    description: "Zonas de servicio, portafolio y cotizaciones listas para atender.",
    signature: "Robusto y directo, pensado para generar llamadas.",
    image: img.roof,
    theme: { bg: "#12100d", surface: "#1c1915", text: "#fbf7f2", muted: "#a9a096", line: "rgba(255,255,255,.11)", accent: "#ff7a29", accentText: "#180f06", radius: "6px", font: "'Space Grotesk', sans-serif", navStyle: "wide" },
    management: ["Zonas", "Proyectos", "Cotizaciones", "Seguimiento"],
    metrics: [["31", "Solicitudes"], ["12", "Visitas estimadas"], ["8", "Proyectos activos"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "LICENCIADOS Y ASEGURADOS", title: "Protegemos lo que m\xE1s importa.", text: "Techos y pintura exterior con garant\xEDa escrita, presupuesto claro y equipo propio.", primary: "Cotizaci\xF3n gratis", secondary: "Ver proyectos", image: img.roof },
          { kind: "stats", items: [["18", "A\xF1os de experiencia"], ["10", "A\xF1os de garant\xEDa"], ["24 h", "Respuesta"]] }
        ]
      },
      {
        label: "Servicios",
        sections: [
          {
            kind: "cards",
            title: "Lo que hacemos",
            subtitle: "Precios estimados seg\xFAn inspecci\xF3n.",
            items: [
              { name: "Reemplazo de techo", text: "Shingle arquitect\xF3nico, retiro e instalaci\xF3n completa.", meta: "Desde $9.800", image: img.roofDetail },
              { name: "Reparaci\xF3n de filtraciones", text: "Diagn\xF3stico, sellado y reporte fotogr\xE1fico.", meta: "Desde $650", image: img.roof },
              { name: "Pintura exterior", text: "Preparaci\xF3n, dos manos y sellado de detalles.", meta: "Desde $4.200", image: img.roofDetail }
            ]
          }
        ]
      },
      {
        label: "Cotizaci\xF3n",
        sections: [
          { kind: "booking", title: "Recibe tu estimado", subtitle: "Un inspector agenda visita en menos de 24 horas.", fields: ["Nombre", "Direcci\xF3n de la propiedad", "Tel\xE9fono"], slots: ["Techo", "Pintura", "Filtraci\xF3n", "No estoy seguro"], note: "Cada solicitud llega al panel con zona, tipo de trabajo y prioridad.", cta: "Solicitar estimado" }
        ]
      }
    ]
  },
  {
    id: "retail",
    name: "Forge Nutrition",
    industry: "Tienda de productos / Retail",
    status: "DEMO INTERACTIVA",
    accent: "#7bd67f",
    accentSoft: "#0f1a12",
    description: "Cat\xE1logo, promociones, pagos y recuperaci\xF3n de contactos.",
    signature: "Deportivo y en\xE9rgico, orientado a conversi\xF3n.",
    image: img.retail,
    theme: { bg: "#0b120d", surface: "#131d16", text: "#f1faf2", muted: "#93aa98", line: "rgba(255,255,255,.1)", accent: "#7bd67f", accentText: "#0c1a0f", radius: "10px", font: "'Space Grotesk', sans-serif", navStyle: "split" },
    management: ["Productos", "Promociones", "Pedidos", "Contactos"],
    metrics: [["46", "Pedidos"], ["18", "Productos"], ["27%", "Recurrencia"]],
    pages: [
      {
        label: "Inicio",
        sections: [
          { kind: "hero", eyebrow: "SUPLEMENTOS PROBADOS EN LABORATORIO", title: "Nutre tu siguiente nivel.", text: "F\xF3rmulas simples, sin rellenos y con certificado de an\xE1lisis en cada lote.", primary: "Comprar ahora", secondary: "Ver ofertas", image: img.retail },
          { kind: "stats", items: [["100%", "Lotes analizados"], ["48 h", "Env\xEDo nacional"], ["12K", "Clientes activos"]] }
        ]
      },
      {
        label: "Tienda",
        sections: [
          {
            kind: "cards",
            title: "M\xE1s vendidos",
            subtitle: "Inventario y precios sincronizados con el panel.",
            items: [
              { name: "Whey Isolate", text: "27 g de prote\xEDna \xB7 sin az\xFAcar a\xF1adida \xB7 2 sabores", meta: "$54.90", image: img.retailDetail },
              { name: "Creatina Micronizada", text: "Monohidrato puro \xB7 100 servicios", meta: "$29.90", image: img.retail },
              { name: "Multivitam\xEDnico Diario", text: "F\xF3rmula completa \xB7 60 c\xE1psulas", meta: "$24.90", image: img.retailDetail }
            ]
          }
        ]
      },
      {
        label: "Objetivos",
        sections: [
          {
            kind: "list",
            title: "Compra seg\xFAn tu meta",
            subtitle: "El cat\xE1logo se filtra por objetivo, no por categor\xEDa t\xE9cnica.",
            items: [
              { name: "Ganar masa muscular", text: "Prote\xEDna, creatina y carbohidrato de recuperaci\xF3n.", meta: "3 productos", tag: "Popular" },
              { name: "Mejorar energ\xEDa diaria", text: "Multivitam\xEDnico, magnesio y omega 3.", meta: "3 productos" },
              { name: "Recuperaci\xF3n y descanso", text: "Magnesio, col\xE1geno y apoyo articular.", meta: "2 productos" }
            ]
          }
        ]
      }
    ]
  }
];
export {
  smartSiteDemos
};

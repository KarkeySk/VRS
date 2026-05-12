export function normalizeVehicle(raw) {
  if (!raw) return null

  const addons = Array.isArray(raw.addons) ? raw.addons : []
  const capabilities = Array.isArray(raw.capabilities) ? raw.capabilities : []
  const technicalSpecs = Array.isArray(raw.technical_specs)
    ? raw.technical_specs
    : Array.isArray(raw.technicalSpecs)
      ? raw.technicalSpecs
      : []

  return {
    id: raw.id,
    name: raw.name || 'Unnamed Vehicle',
    subtitle: raw.subtitle || '',
    image: raw.image || '',
    engine: raw.engine || '-',
    torque: raw.torque || '-',
    drive: raw.drive || '-',
    capacity: raw.capacity || '-',
    price: Number(raw.price_per_day ?? raw.price ?? 0),
    rating: Number(raw.rating ?? 0),
    category: raw.category || 'All Terrain',
    type: raw.type || 'car',
    capabilities,
    technicalSpecs,
    altitude: raw.altitude || {},
    addons,
  }
}

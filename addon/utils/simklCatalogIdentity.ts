const INSTANCE_MARKER = '__instance_';

export function simklRouteId(id: string, instanceId?: string): string {
  return instanceId ? `${id}${INSTANCE_MARKER}${instanceId}` : id;
}

export function splitSimklRouteId(id: string): { providerId: string; instanceId?: string } {
  const markerIndex = id.lastIndexOf(INSTANCE_MARKER);
  if (markerIndex === -1) return { providerId: id };
  return { providerId: id.slice(0, markerIndex), instanceId: id.slice(markerIndex + INSTANCE_MARKER.length) };
}

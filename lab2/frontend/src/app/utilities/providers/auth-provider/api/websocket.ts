import { apiRoutes } from '@/app/routing';
import { BookCreature } from './types';

type WsOp = 'create' | 'update' | 'delete';
type AnyMsg = unknown;
type CitiesWsEnvelope = { city?: BookCreature; id?: number; op: WsOp };

export function normalizeWs(e: AnyMsg): { op: WsOp | null; bookCreature?: BookCreature; id?: number } {
  let m: unknown = e;
  if (typeof m === 'string') {
    try {
      m = JSON.parse(m);
    } catch {
      return { op: null };
    }
  }

  console.log(m);

  if (m?.data && !m.bookCreature) m = { ...m, ...m.data };
  if (m?.payload && !m.bookCreature) m = { ...m, ...m.payload };

  const rawOp = (m?.op ?? m?.type ?? '').toString().toLowerCase();
  const op: WsOp | null = rawOp === 'create' || rawOp === 'update' || rawOp === 'delete' ? rawOp : null;

  const city: BookCreature | undefined = m?.bookCreature;
  const id =
    m?.id != null
      ? Number(m.id)
      : city?.id != null
        ? Number(city.id)
        : undefined;

  return { op, bookCreature: city, id };
}

export const openCitiesSocket = (onMessage: (data: CitiesWsEnvelope) => void, url = apiRoutes.ws.base) => {
  let ws: WebSocket | null = null;
  let closed = false;
  let attempt = 0;

  const connect = () => {
    ws = new WebSocket(url);
    console.log('Connecting to WS', url);

    ws.onopen = () => {
      attempt = 0;
    };
    ws.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data) as CitiesWsEnvelope);
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };
    ws.onerror = () => {
      try {
        ws?.close();
      } catch {

      }
    };
    ws.onclose = () => {
      if (closed) return;
      const delay = Math.min(30000, 1000 * 2 ** attempt++);
      setTimeout(connect, delay);
    };
  };

  connect();
  return {
    close: () => {
      closed = true;
      try {
        ws?.close();
      } catch {

      }
    },
  };
};

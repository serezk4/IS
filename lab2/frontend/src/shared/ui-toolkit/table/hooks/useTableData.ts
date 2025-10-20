import { useState, useEffect, useRef, useCallback } from 'react';
import { BookCreature, getCities, openCitiesSocket, normalizeWs } from '@/app/utilities/providers/auth-provider/api-layer';
import { useTokenRotation } from '@/app/utilities/providers/auth-provider/useTokenRotation';
import { compareItems } from '../utils';

export function useTableData(
  pageIndex: number,
  size: number,
  sortField: string,
  sortOrder: 'asc' | 'desc',
  _prevTail: BookCreature | null,
  _nextHead: BookCreature | null
) {
  const [cities, setCities] = useState<BookCreature[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [prevTailState, setPrevTail] = useState<BookCreature | null>(null);
  const [nextHeadState, setNextHead] = useState<BookCreature | null>(null);

  const { accessToken } = useTokenRotation();
  const abortRef = useRef<AbortController | null>(null);

  const belongsByBoundaries = useCallback((item: BookCreature, prev: BookCreature | null, next: BookCreature | null) => {
    const gtPrev = prev ? compareItems(item, prev, sortField, sortOrder) > 0 : true;
    const ltNext = next ? compareItems(item, next, sortField, sortOrder) < 0 : true;
    return gtPrev && ltNext;
  }, [sortField, sortOrder]);

  const loadPage = useCallback((pageIdx: number, pageSize: number, sort: string) => {
    if (!accessToken) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    getCities(accessToken, pageIdx, pageSize, sort, { signal: ctrl.signal })
      .then(res => {
        if (!res || ctrl.signal.aborted) return;
        setCities(res.content ?? []);
        setTotalElements(res.totalElements ?? 0);
        setTotalPages(res.totalPages ?? 0);
        setPageIndex(res.page);
      })
      .catch(() => {

      });

    return () => ctrl.abort();
  }, [accessToken]);

  useEffect(() => {
    const sortParam = `${sortField},${sortOrder}`;
    loadPage(pageIndex, size, sortParam);
  }, [loadPage, pageIndex, size, sortField, sortOrder]);

  useEffect(() => {
    let aborted = false;
    const fetchBoundaries = async () => {
      if (pageIndex > 0) {
        const prev = await getCities(accessToken, pageIndex - 1, size, `${sortField},${sortOrder}`).catch(() => undefined);
        if (!aborted) setPrevTail(prev?.content?.length ? prev.content[prev.content.length - 1] : null);
      } else setPrevTail(null);

      if (totalPages && pageIndex < totalPages - 1) {
        const next = await getCities(accessToken, pageIndex + 1, size, `${sortField},${sortOrder}`).catch(() => undefined);
        if (!aborted) setNextHead(next?.content?.length ? next.content[0] : null);
      } else setNextHead(null);
    };

    if (cities.length) fetchBoundaries();
    return () => {
      aborted = true;
    };
  }, [accessToken, cities.length, pageIndex, size, sortField, sortOrder, totalPages]);

  useEffect(() => {
    const sub = openCitiesSocket((raw) => {
      const { op, bookCreature: incoming, id: msgId } = normalizeWs(raw);
      if (!op) return;

      setCities((prev) => {
        const current = prev ?? [];
        if (op === 'delete') {
          const delId = msgId ?? (incoming?.id != null ? Number(incoming.id) : undefined);
          if (delId == null) return current;
          const idx = current.findIndex(c => Number(c.id) === delId);
          if (idx === -1) return current;
          const nextArr = current.slice();
          nextArr.splice(idx, 1);
          setTotalElements(t => Math.max(0, t - 1));
          return nextArr;
        }

        if (!incoming || incoming.id == null) return current;
        const inId = Number(incoming.id);
        const idx = current.findIndex(c => Number(c.id) === inId);

        if (idx !== -1) {
          const nextArr = current.slice();
          nextArr[idx] = { ...current[idx], ...incoming };
          nextArr.sort((a, b) => compareItems(a, b, sortField, sortOrder));
          return nextArr;
        }

        if (!belongsByBoundaries(incoming, prevTailState, nextHeadState)) return current;
        const nextArr = current.concat(incoming).sort((a, b) => compareItems(a, b, sortField, sortOrder));
        if (nextArr.length > size) nextArr.pop();
        if (op === 'create') setTotalElements(t => t + 1);
        return nextArr;
      });
    });

    return () => sub.close();
  }, [prevTailState, nextHeadState, size, sortField, sortOrder, belongsByBoundaries]);

  return {
    cities,
    setCities,
    totalElements,
    setTotalElements,
    totalPages,
    setTotalPages,
    prevTail: prevTailState,
    nextHead: nextHeadState,
  };
}

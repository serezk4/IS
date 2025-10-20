import { useState, useEffect } from 'react';
import { SortOrder } from '../types';
import { ALL_TRUE } from '../constants';

export function useTableState(initialProps?: { fullWidth?: boolean; smartColumns?: boolean }) {
  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [pageIndex, setPageIndex] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState("1");

  const [smartColumnsState, setSmartColumnsState] = useState<boolean>(() => {
    if (initialProps?.smartColumns !== undefined) return initialProps.smartColumns;
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("smartColumns");
    return saved ? saved === "1" : true;
  });

  const [fullWidthState, setFullWidthState] = useState<boolean>(() => {
    if (initialProps?.fullWidth !== undefined) {
      console.log("Using initialProps fullWidth:", initialProps.fullWidth);
      return initialProps.fullWidth;
    }
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("tableFullWidth");
    const result = saved ? saved === "1" : false;
    console.log("Loading fullWidth from localStorage:", saved, "->", result);
    return result;
  });

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("tableVisibleColumns");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {

        }
      }
    }
    return ALL_TRUE;
  });

  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("tableColWidths");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {

        }
      }
    }
    return {};
  });

  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [hoverCardEnabled, setHoverCardEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("tableHoverCardEnabled");
      return saved ? saved === "1" : true;
    }
    return true;
  });

  useEffect(() => {
    if (initialProps?.smartColumns !== undefined) setSmartColumnsState(initialProps.smartColumns);
  }, [initialProps?.smartColumns]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("smartColumns", smartColumnsState ? "1" : "0");
    }
  }, [smartColumnsState]);

  useEffect(() => {
    if (initialProps?.fullWidth !== undefined) setFullWidthState(initialProps.fullWidth);
  }, [initialProps?.fullWidth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Saving fullWidth:", fullWidthState);
      window.localStorage.setItem("tableFullWidth", fullWidthState ? "1" : "0");
    }
  }, [fullWidthState]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tableVisibleColumns", JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tableColWidths", JSON.stringify(colWidths));
    }
  }, [colWidths]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tableHoverCardEnabled", hoverCardEnabled ? "1" : "0");
    }
  }, [hoverCardEnabled]);

  useEffect(() => {
    setPageInput(String((totalPages ? Math.min(pageIndex, totalPages - 1) : pageIndex) + 1));
  }, [pageIndex, totalPages]);

  return {
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    pageIndex,
    setPageIndex,
    size,
    setSize,
    totalElements,
    setTotalElements,
    totalPages,
    setTotalPages,
    pageInput,
    setPageInput,
    smartColumns: smartColumnsState,
    setSmartColumns: setSmartColumnsState,
    fullWidth: fullWidthState,
    setFullWidth: setFullWidthState,
    visibleColumns,
    setVisibleColumns,
    colWidths,
    setColWidths,
    hiddenIds,
    setHiddenIds,
    showHidden,
    setShowHidden,
    hoverCardEnabled,
    setHoverCardEnabled,
  };
}

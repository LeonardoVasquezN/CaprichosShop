"use client";
import { create } from "zustand";

export const useBusquedaStore = create((set) => ({
  textoBusqueda: "",
  setTextoBusqueda: (newValue) => set({ textoBusqueda: newValue }),

  textoBusquedaTemporal: "",
  setTextoBusquedaTemporal: (newValue) =>
    set({ textoBusquedaTemporal: newValue }),

  buscadorActivo: false,
  setBuscadorActivo: (value) =>
    set({ buscadorActivo: value }),

  busquedaActiva: false,
  setBusquedaActiva: (value) => 
    set({ busquedaActiva: value }),
}));
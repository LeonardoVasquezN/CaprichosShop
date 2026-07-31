"use client";

import { createContext, useState, useEffect, startTransition } from "react";
import API_URL from "../config";

export const ExistenciaContext = createContext();

export const ExistenciaProvider = ({ children }) => {
  const [existencias, setExistencias] = useState([]);

  const fetchExistencias = async () => {
    try {
      const res = await fetch(`/api/variantes`);
      const data = await res.json();

      startTransition(() => {
        setExistencias(data);
      });
    } catch (error) {
      console.error("Error al obtener existencias:", error);
    }
  };

  const actualizarExistencias = async () => {
    await fetchExistencias();
  };

  useEffect(() => {
    fetchExistencias();
  }, []);

  return (
    <ExistenciaContext.Provider
      value={{ existencias, setExistencias, actualizarExistencias }}
    >
      {children}
    </ExistenciaContext.Provider>
  );
};
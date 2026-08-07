import { Suspense } from "react";
import MantExistencia from "@/components/MantExistencia";

export default function Page({ params }) {
  const { id } = params;

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MantExistencia id={id} />
    </Suspense>
  );
}
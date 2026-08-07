import { Suspense } from "react";
import MantExistencia from "@/components/MantExistencia";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MantExistencia />
    </Suspense>
  );
}
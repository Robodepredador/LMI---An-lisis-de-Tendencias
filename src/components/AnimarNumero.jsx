import { useEffect, useRef, useState } from 'react';

/**
 * AnimarNumero: Interpolador numérico suave frame por frame mediante requestAnimationFrame.
 * Anima aumentos o reducciones en tiempo real con curva easeOutCubic.
 */
export default function AnimarNumero({ valor, duracion = 650, prefijo = '', sufijo = '', formatear }) {
  const [actual, setActual] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const inicio = prevRef.current;
    const destino = Number(valor) || 0;
    if (inicio === destino) {
      setActual(destino);
      return;
    }

    let animId;
    let startTimestamp = null;

    const paso = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progreso = Math.min((timestamp - startTimestamp) / duracion, 1);
      // Curva de aceleración natural easeOutCubic
      const factor = 1 - Math.pow(1 - progreso, 3);
      const intermedio = Math.round(inicio + (destino - inicio) * factor);
      setActual(intermedio);

      if (progreso < 1) {
        animId = requestAnimationFrame(paso);
      } else {
        prevRef.current = destino;
        setActual(destino);
      }
    };

    animId = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(animId);
  }, [valor, duracion]);

  const texto = formatear ? formatear(actual) : actual;
  return <>{prefijo}{texto}{sufijo}</>;
}

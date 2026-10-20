const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Oct 2026" en español e inglés, según la hora de Santiago de Chile.
export function mesYAnio(fecha) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', year: 'numeric', month: 'numeric' })
    .formatToParts(fecha);
  const mes = Number(partes.find(p => p.type === 'month').value) - 1;
  const anio = partes.find(p => p.type === 'year').value;
  return { es: `${MESES_ES[mes]} ${anio}`, en: `${MESES_EN[mes]} ${anio}` };
}

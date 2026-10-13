// Marca: un punto sólido dentro de un círculo, el gesto mínimo del blackwork.
export default function Marca({ size = 28 }) {
  return (
    <svg className="marca" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="7" fill="currentColor" />
      <circle cx="16" cy="16" r="2.2" className="marca__punto" />
    </svg>
  );
}

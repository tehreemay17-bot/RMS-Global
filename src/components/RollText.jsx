// Text that "rolls" up to an accent-coloured copy on hover (styles live in Nav.css: .roll).
export default function RollText({ children }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  )
}

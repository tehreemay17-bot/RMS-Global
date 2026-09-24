import { BRAND } from '../config'

// Uses /public/logo.png (white artwork on transparent, so it sits directly on the dark canvas).
export default function Logo({ showText = true }) {
  return (
    <span className="logo">
      <img className="logo-mark" src="/logo.png" alt="" width="44" height="42" />
      {showText && (
        <span className="logo-text">
          <span className="logo-name">{BRAND.name}</span>
          <span className="logo-tag">{BRAND.descriptor}</span>
        </span>
      )}
    </span>
  )
}

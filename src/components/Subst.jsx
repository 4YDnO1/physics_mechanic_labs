import { Tex } from './Tex.jsx'

export default function Subst({ items }) {
  return (
    <ol className="subst">
      {items.map((tex, i) => (
        <li key={i}>
          <Tex block>{tex}</Tex>
        </li>
      ))}
    </ol>
  )
}

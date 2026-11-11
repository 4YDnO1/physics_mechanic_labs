import { useMemo } from 'react'
import katex from 'katex'

export function Tex({ children, block = false }) {
  const html = useMemo(
    () =>
      katex.renderToString(String(children), {
        displayMode: block,
        throwOnError: false,
        strict: 'ignore',
        output: 'html',
      }),
    [children, block]
  )
  return block ? (
    <div className="eq-body" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className="tex-inline" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export function Eq({ n, children }) {
  return (
    <div className="eq">
      <Tex block>{children}</Tex>
      {n != null && <span className="eq-n">({n})</span>}
    </div>
  )
}

export function P({ children }) {
  return <p>{children}</p>
}

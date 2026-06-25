import type { Pick } from '../types'

const OPTIONS: Pick[] = ['V1', 'X', 'V2']

export function PickSelector({
  value,
  onChange,
  disabled,
}: {
  value?: Pick
  onChange: (p: Pick) => void
  disabled?: boolean
}) {
  return (
    <div className="picks">
      {OPTIONS.map((opt) => (
        <div
          key={opt}
          className={`pick${value === opt ? ' sel' : ''}${disabled ? ' locked' : ''}`}
          onClick={() => { if (!disabled) onChange(opt) }}
          role="button"
          aria-pressed={value === opt}
        >
          {opt}
        </div>
      ))}
    </div>
  )
}

// Versão só de leitura, com o resultado real marcado a verde/vermelho
export function PickReview({ value, result }: { value?: Pick; result: Pick | null }) {
  return (
    <div className="picks">
      {OPTIONS.map((opt) => {
        let cls = 'pick locked'
        const chosen = value === opt
        if (result && opt === result) cls += ' correct'
        if (chosen && result && opt !== result) cls = 'pick locked wrong'
        if (chosen && !result) cls = 'pick sel locked'
        return (
          <div key={opt} className={cls}>
            {opt}
            {chosen && <span style={{ fontSize: 16, marginLeft: 4, lineHeight: 1 }}>•</span>}
          </div>
        )
      })}
    </div>
  )
}

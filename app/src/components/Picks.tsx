import type { Pick } from '../types'

type Opt = { code: Pick; label: string }

function options(homeName: string, awayName: string): Opt[] {
  return [
    { code: 'V1', label: homeName },
    { code: 'X', label: 'Empate' },
    { code: 'V2', label: awayName },
  ]
}

export function PickSelector({
  homeName,
  awayName,
  value,
  onChange,
  disabled,
}: {
  homeName: string
  awayName: string
  value?: Pick
  onChange: (p: Pick) => void
  disabled?: boolean
}) {
  return (
    <div className="picks">
      {options(homeName, awayName).map((opt) => (
        <button
          key={opt.code}
          type="button"
          className={`pick${value === opt.code ? ' sel' : ''}${disabled ? ' locked' : ''}`}
          onClick={() => { if (!disabled) onChange(opt.code) }}
          aria-pressed={value === opt.code}
        >
          <span className="pick-team">{opt.label}</span>
          <span className="pick-code">{opt.code}</span>
        </button>
      ))}
    </div>
  )
}

// Versão só de leitura, com o resultado real marcado a verde/vermelho
export function PickReview({
  homeName,
  awayName,
  value,
  result,
}: {
  homeName: string
  awayName: string
  value?: Pick
  result: Pick | null
}) {
  return (
    <div className="picks">
      {options(homeName, awayName).map((opt) => {
        const chosen = value === opt.code
        let cls = 'pick locked'
        if (result && opt.code === result) cls += ' correct'
        if (chosen && result && opt.code !== result) cls = 'pick locked wrong'
        if (chosen && !result) cls = 'pick sel locked'
        return (
          <div key={opt.code} className={cls}>
            <span className="pick-team">{opt.label}</span>
            <span className="pick-code">
              {opt.code}{chosen && ' •'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

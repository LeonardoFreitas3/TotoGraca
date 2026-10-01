import { useState } from 'react'

const KEY = 'totograca-install-hint-seen'

function shouldShow() {
  try {
    if (localStorage.getItem(KEY)) return false
  } catch { /* sem storage: mostra na mesma */ }
  // já instalada (aberta a partir do ecrã principal) → não mostrar
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
  return !standalone
}

export function InstallHint() {
  const [open, setOpen] = useState(shouldShow)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const [tab, setTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android')

  if (!open) return null

  function close() {
    try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
    setOpen(false)
  }

  return (
    <div className="install-overlay" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <div className="install-sheet">
        <h2 id="install-title" style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Instala a TotoGraça</h2>
        <p className="muted" style={{ margin: '0 0 16px', fontSize: 14 }}>
          Fica no ecrã principal como uma app. Demora 10 segundos.
        </p>

        <div className="tabs">
          <button type="button" className={`tab${tab === 'ios' ? ' active' : ''}`} onClick={() => setTab('ios')}>iPhone</button>
          <button type="button" className={`tab${tab === 'android' ? ' active' : ''}`} onClick={() => setTab('android')}>Android</button>
        </div>

        {tab === 'ios' ? (
          <ol className="install-steps">
            <li>Abre este site no <strong>Safari</strong>.</li>
            <li>Toca no botão <strong>Partilhar</strong> <span className="material-symbols-outlined">ios_share</span> (em baixo).</li>
            <li>Escolhe <strong>"Adicionar ao ecrã principal"</strong>.</li>
            <li>Toca em <strong>Adicionar</strong>. Pronto!</li>
          </ol>
        ) : (
          <ol className="install-steps">
            <li>Abre este site no <strong>Chrome</strong>.</li>
            <li>Toca nos <strong>3 pontos</strong> <span className="material-symbols-outlined">more_vert</span> (em cima à direita).</li>
            <li>Escolhe <strong>"Instalar app"</strong> ou <strong>"Adicionar ao ecrã principal"</strong>.</li>
            <li>Confirma. Pronto!</li>
          </ol>
        )}

        <button className="btn" type="button" onClick={close} style={{ marginTop: 8 }}>Percebi</button>
      </div>
    </div>
  )
}

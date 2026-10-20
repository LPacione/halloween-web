'use client'

import { FormEvent, useEffect, useRef, useState, useCallback } from 'react'
import Particles, { ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'
import { ArrowDown, Check, ChevronRight, Clock3, Box, MapPin, Send, Calendar } from 'lucide-react'
import { eventConfig } from '@/src/config/event'

const particleOptions: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  particles: {
    number: { value: 45, density: { enable: true, width: 1100, height: 1100 } },
    color: { value: ['#e87932', '#c45a2a', '#8f4c42', '#581b25', '#d8c9bd'] },
    opacity: { value: { min: 0.06, max: 0.4 }, animation: { enable: true, speed: 0.25, sync: false, minimumValue: 0.02 } },
    size: { value: { min: 0.5, max: 3.5 } },
    move: { enable: true, direction: 'top', speed: { min: 0.08, max: 0.4 }, outModes: { default: 'out' }, drift: 0.8 },
    links: { enable: false },
  },
  interactivity: {
    events: { onHover: { enable: true, mode: 'repulse' }, onClick: { enable: true, mode: 'push' } },
    modes: { repulse: { distance: 120, duration: 0.8 }, push: { quantity: 3 } },
  },
  detectRetina: true,
  background: { color: 'transparent' },
}

function HauntedParticles() {
  return <ParticlesProvider init={async (engine) => { await loadSlim(engine) }}><Particles id="haunted-particles" className="haunted-particles" options={particleOptions} aria-hidden="true" /></ParticlesProvider>
}

function Countdown() {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(eventConfig.startDateTime).getTime() - Date.now()))
  useEffect(() => { const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(eventConfig.startDateTime).getTime() - Date.now())), 1000); return () => window.clearInterval(timer) }, [])
  if (!remaining) return <p className="countdown-ended">La mansión está abierta. La noche ha comenzado.</p>
  const parts = [Math.floor(remaining / 86400000), Math.floor((remaining / 3600000) % 24), Math.floor((remaining / 60000) % 60), Math.floor((remaining / 1000) % 60)]
  return (
    <div className="countdown" aria-label="Tiempo hasta la fiesta" role="timer">
      {parts.map((part, index) => (
        <span key={index} className="countdown-unit">
          <strong>{String(part).padStart(2, '0')}</strong>
          <small>{['días', 'horas', 'min', 'seg'][index]}</small>
          <span className="countdown-tick" aria-hidden="true" />
        </span>
      ))}
    </div>
  )
}

function RSVPForm() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'going' | 'not-going'>('going')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    if (name.length < 2) {
      setError('Déjanos tu nombre para saber quién viene.')
      return
    }
    setSending(true)
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          status,
          guests: Number(form.get('guests') ?? 1),
          comment: String(form.get('comment') ?? '').trim(),
        }),
      })
      if (!response.ok) throw new Error('request failed')
      setSent(true)
    } catch {
      setError('No pudimos guardar tu respuesta. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  if (sent) return <div className="success-box"><span className="success-icon"><Check /></span><p className="eyebrow">Mensaje recibido</p><h3>Tu respuesta ha sido registrada.</h3><p>Gracias por confirmar.</p><button className="text-button" onClick={() => setSent(false)}>Editar mi respuesta <ChevronRight /></button></div>
  return <form className="rsvp-form" onSubmit={submit}>
    <label>Nombre y apellido<input name="name" placeholder="Tu nombre" required /></label>
    <div className="form-row"><label>¿Vas a venir?<div className="choice-row"><button type="button" className={status === 'going' ? 'choice active' : 'choice'} onClick={() => setStatus('going')}>Voy a estar ahí</button><button type="button" className={status === 'not-going' ? 'choice active' : 'choice'} onClick={() => setStatus('not-going')}>No puedo ir</button></div></label><label>Invitados<select name="guests" defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option></select></label></div>
    <label>Nota para los anfitriones<textarea name="comment" placeholder="¿Hay algo que debamos saber?" rows={3} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={sending}>{sending ? 'Enviando...' : 'Enviar mi respuesta'} {!sending && <Send />}</button>
  </form>
}

function PinterestEmbed() { useEffect(() => { const script = document.createElement('script'); script.src = 'https://assets.pinterest.com/js/pinit.js'; script.async = true; document.body.appendChild(script); return () => script.remove() }, []); return <div className="pinterest-frame"><a data-pin-do="embedBoard" data-pin-board-width="400" data-pin-scale-height="240" data-pin-scale-width="80" href="https://www.pinterest.com/laurastoesse/disfraz-halloween/">Te dejo algunas ideas</a></div> }

function CalendarButton() {
  const createEvent = useCallback(() => {
    const start = new Date(eventConfig.startDateTime)
    const end = new Date(start.getTime() + 5 * 60 * 60 * 1000)
    const title = encodeURIComponent('La Mansión Encantada — Fiesta de Halloween')
    const details = encodeURIComponent('Una noche fuera de lo común en la vieja casa de Lauquen. Disfraz obligatorio.')
    const location = encodeURIComponent('Lauquen 326, Barrio Patagonia')
    const format = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${format(start)}/${format(end)}&details=${details}&location=${location}`
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.click()
  }, [])

  return <button className="calendar-button" onClick={createEvent} aria-label="Agregar al calendario"><Calendar /><span>Agregar al calendario</span></button>
}

function EntranceSequence({ onEnter, onStartAudio }: { onEnter: () => void; onStartAudio: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'reveal' | 'entered'>('idle')
  const [fogOpacity, setFogOpacity] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('reveal')
      setFogOpacity(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleEnter = () => {
    onStartAudio()
    setPhase('entered')
    setFogOpacity(0)
    setTimeout(onEnter, 900)
  }

  return (
    <div className={`entrance-sequence entrance-${phase}`} role="dialog" aria-modal="true" aria-label="Entrada a la mansión">
      <div className="entrance-backdrop" style={{ opacity: fogOpacity }} aria-hidden="true" />
      <div className="entrance-fog entrance-fog-one" aria-hidden="true" />
      <div className="entrance-fog entrance-fog-two" aria-hidden="true" />
      <div className="entrance-content">
        <p className="entrance-eyebrow">THE HAUNTED ESTATE</p>
        <h2 className="entrance-title candle-glow">Bienvenidos<br /><em>a</em><br />nuestro Halloween</h2>
        <p className="entrance-subtitle">En la casa nueva</p>
        <button className="entrance-button primary-button" onClick={handleEnter} disabled={phase !== 'reveal'}>
          Entrar bajo tu propio riesgo <ArrowDown />
        </button>
      </div>
    </div>
  )
}

export default function Page() {
  const [secret, setSecret] = useState(false)
  const [entered, setEntered] = useState(false)
  const [revealedSections, setRevealedSections] = useState<Set<number>>(new Set())
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioStarted = useRef(false)

  function startAmbient() {
    const element = audioRef.current
    if (!element || audioStarted.current) return
    audioStarted.current = true
    element.volume = 0
    element.play().then(() => {
      const begin = performance.now()
      const step = (now: number) => {
        const progress = Math.min(1, Math.max(0, (now - begin) / 1400))
        element.volume = Math.min(1, Math.max(0, 0.4 * progress))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }).catch(() => {
      audioStarted.current = false
      const retry = () => {
        window.removeEventListener('pointerdown', retry)
        window.removeEventListener('keydown', retry)
        startAmbient()
      }
      window.addEventListener('pointerdown', retry, { once: true })
      window.addEventListener('keydown', retry, { once: true })
    })
  }

  useEffect(() => {
    if (!entered) return
    const allIndexes = [0, 1, 2, 3, 4, 5, 6, 7]
    if (typeof IntersectionObserver === 'undefined') {
      setRevealedSections(new Set(allIndexes))
      return
    }
    setRevealedSections((prev) => new Set(prev).add(0))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number((entry.target as HTMLElement).dataset.sectionIndex)
          setRevealedSections((prev) => new Set(prev).add(index))
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' })
    sectionRefs.current.forEach((ref) => ref && observer.observe(ref))
    return () => observer.disconnect()
  }, [entered])

  useEffect(() => {
    if (!entered) return
    const element = backdropRef.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      const start = window.innerWidth <= 700 ? 22 : 24
      const position = start + (100 - start) * progress
      element.style.backgroundPosition = `center ${position.toFixed(2)}%`
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      element.style.backgroundPosition = ''
    }
  }, [entered])

  useEffect(() => {
    if (!secret) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSecret(false) }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [secret])

  const ambient = eventConfig.audioSrc ? <audio ref={audioRef} src={eventConfig.audioSrc} loop preload="none" /> : null

  if (!entered) {
    return (
      <>
        {ambient}
        <main className="estate-page">
        <EntranceSequence onEnter={() => setEntered(true)} onStartAudio={startAmbient} />
        <div className="cobweb cobweb-left" aria-hidden="true" />
        <div className="cobweb cobweb-right" aria-hidden="true" />
        <div className="fixed-backdrop" ref={backdropRef} style={{ backgroundImage: `url(${eventConfig.backgroundImage})` }} />
        <div className="backdrop-wash" />
        <div className="mist mist-one" />
        <div className="mist mist-two" />
        <div className="fog-bank fog-bank-one" aria-hidden="true" />
        <div className="fog-bank fog-bank-two" aria-hidden="true" />
        <div className="ember-field" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <span key={index} style={{ '--i': index } as React.CSSProperties} />)}</div>
        <HauntedParticles />
        <div className="vignette" aria-hidden="true" />
        <div className="screen-flicker" aria-hidden="true" />
        <div className="film-grain" aria-hidden="true" />
      </main>
      </>
    )
  }

  return (
    <>
      {ambient}
      <main className="estate-page">
      <div className="cobweb cobweb-left" aria-hidden="true" />
      <div className="cobweb cobweb-right" aria-hidden="true" />
      <div className="fixed-backdrop" ref={backdropRef} style={{ backgroundImage: `url(${eventConfig.backgroundImage})` }} />
      <div className="backdrop-wash" />
      <div className="mist mist-one" />
      <div className="mist mist-two" />
      <div className="fog-bank fog-bank-one" aria-hidden="true" />
      <div className="fog-bank fog-bank-two" aria-hidden="true" />
      <div className="fog-ground" aria-hidden="true" />
      <div className="ember-field" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <span key={index} style={{ '--i': index } as React.CSSProperties} />)}</div>
      <HauntedParticles />
      <div className="vignette" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />

<div className="secret-section">
  <div className="floating-chest-container">
    <button 
      className="chest-trigger" 
      onClick={() => setSecret(true)} 
      aria-haspopup="dialog" 
      aria-expanded={secret} 
      aria-label="Abrir cofre secreto" 
      title="Hay un secreto en este cofre"
    >
      <img src="/cofre-icon.png" alt="Icono de cofre" className="chest-icon" />
    </button>
  </div>

  {secret && (
    <div className="chest-overlay" role="dialog" aria-modal="true" aria-label="El cofre secreto" onClick={() => setSecret(false)}>
      <div className="chest-frame" onClick={(event) => event.stopPropagation()}>
        <button className="chest-close" onClick={() => setSecret(false)} aria-label="Cerrar el cofre" autoFocus>×</button>
        <img src="/images/cofre.jpeg" alt="El cofre secreto de la mansión" />
      </div>
    </div>
  )}
</div>

      <nav className="top-nav"><span className="monogram">HE</span><span>{eventConfig.eyebrow}</span><span className="nav-line" /></nav>

      <section className="hero" id="top" ref={(el) => { sectionRefs.current[0] = el }} data-section-index={0} data-revealed={revealedSections.has(0)}>
        <div className="hero-copy reveal">
          <p className="eyebrow">Una invitacion para cagarte del miedo</p>
          <h1 className="candle-glow">Bienvenidos<br /><em>a</em><br />nuestro Halloween</h1>
          <p className="hero-subtitle">En la casa nueva</p>
          <a className="primary-button" href="#invitation">Entra bajo tu propio riesgo <ArrowDown /></a>
        </div>
        <div className="hero-bottom reveal">
          <span>{eventConfig.dateLabel}</span>
          <span className="scroll-cue"><span />Desplázate para descender</span>
        </div>
      </section>

      <section className="story section" id="invitation" ref={(el) => { sectionRefs.current[1] = el }} data-section-index={1} data-revealed={revealedSections.has(1)}>
        <div className="section-number reveal">01 / La invitación</div>
        <div className="story-layout">
          <div className="reveal">
            <p className="eyebrow">Querido visitante</p>
            <h2 className="candle-glow">Algunas puertas están hechas para abrirse.</h2>
          </div>
          <div className="story-copy reveal">
            <p className="lead">{eventConfig.invitation}</p>
            <p>{eventConfig.invitationNote}</p>
          </div>
        </div>
      </section>

      <section className="details section" ref={(el) => { sectionRefs.current[2] = el }} data-section-index={2} data-revealed={revealedSections.has(2)}>
        <div className="section-number reveal">02 / Los detalles</div>
        <div className="details-grid">
          <div className="detail-card reveal"><Clock3 /><p className="eyebrow">Cuándo</p><h3 className="candle-glow">{eventConfig.dateLabel}</h3><p>{eventConfig.timeLabel}</p></div>
          <div className="detail-card reveal"><MapPin /><p className="eyebrow">Dónde</p><h3 className="candle-glow">{eventConfig.location}</h3><p>{eventConfig.address}</p>{eventConfig.mapsUrl && <a href={eventConfig.mapsUrl} target="_blank" rel="noopener">Abrir mapa <ChevronRight /></a>}</div>
        </div>
        <div className="countdown-wrapper reveal"><Countdown /><CalendarButton /></div>
      </section>

      <section className="practical section" ref={(el) => { sectionRefs.current[3] = el }} data-section-index={3} data-revealed={revealedSections.has(3)}>
        <div className="section-number reveal">03 / El pacto</div>
        <div className="practical-grid">
          <div className="reveal">
            <p className="eyebrow">Código de vestimenta</p>
            <h2 className="candle-glow">{eventConfig.dressCode}</h2>
            <h3 className="candle-glow"> Ya sabes como es Lauri, espera mucho de vos</h3>
          </div>
          <div className="reveal">
            <p className="eyebrow">Trae contigo</p>
            <ul>{eventConfig.bring.map(item => <li key={item}>{item}</li>)}</ul>
            <p className="provisional">{eventConfig.notes}</p>
          </div>
        </div>
      </section>

      <section className="inspiration section" ref={(el) => { sectionRefs.current[4] = el }} data-section-index={4} data-revealed={revealedSections.has(4)}>
        <div className="section-number reveal">04 / Un poco de inspiración</div>
        <div className="inspiration-layout">
          <div className="reveal">
            <p className="eyebrow">Para inspirar el estilo</p>
            <h2 className="candle-glow">Mantén el misterio.</h2>
          </div>
          <PinterestEmbed />
        </div>
      </section>

      <section className="rsvp section" id="rsvp" ref={(el) => { sectionRefs.current[5] = el }} data-section-index={5} data-revealed={revealedSections.has(5)}>
        <div className="section-number reveal">05 / Tu respuesta</div>
        <div className="rsvp-layout">
          <div className="reveal">
            <p className="eyebrow">El libro de invitados</p>
            <h2 className="candle-glow">¿Te sumas a nosotros después del anochecer?</h2>
            <p className="muted">Deja tu respuesta abajo. La mantendremos a salvo de miradas indiscretas.</p>
          </div>
          <RSVPForm />
        </div>
      </section>

      <footer className="closing section" ref={(el) => { sectionRefs.current[7] = el }} data-section-index={7} data-revealed={revealedSections.has(7)}>
        <div className="closing-content reveal">
          <p className="eyebrow">Hasta la hora de las brujas</p>
          <h2 className="candle-glow">Nos vemos<br /><em>adentro.</em></h2>
          <p className="footer-date">{eventConfig.dateLabel} · {eventConfig.timeLabel}</p>
          <div className="final-mist" aria-hidden="true" />
        </div>
      </footer>
      </main>
    </>
  )
}

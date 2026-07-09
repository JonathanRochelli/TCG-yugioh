interface Props {
  onEnter: () => void
}

/** Écran d'accueil « temple » : titre monumental, emblème, entrée dorée. */
export function Home({ onEnter }: Props) {
  return (
    <div className="home">
      <div className="home__frame">
        <div className="home__emblem">𓂀</div>
        <h1 className="home__title">Yu-Gi-Oh Boosters</h1>
        <div className="home__rule" />
        <p className="home__tagline">
          Ouvre les paquets scellés du temple.
          <br />
          Collectionne les reliques. Fais briller l'or.
        </p>
        <button className="home__enter" onClick={onEnter}>
          Entrer dans le temple
        </button>
        <div className="home__glyphs">☥ ✦ ☀ ✦ ☥</div>
      </div>
    </div>
  )
}

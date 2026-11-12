'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const DESKTOP_SRC = '/video/hero.mp4';
const MOBILE_SRC = '/video/hero-mobile.mp4';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    // `is-ready` drives the load sequence and is set whatever happens to the
    // video — a missing or blocked file must never leave the headline
    // invisible behind a transform.
    const raf = requestAnimationFrame(() => setReady(true));

    if (!video) return () => cancelAnimationFrame(raf);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => cancelAnimationFrame(raf);
    }

    // Browsers dropped media queries on <source>, so the choice is made here.
    video.src = window.matchMedia('(max-width: 720px)').matches ? MOBILE_SRC : DESKTOP_SRC;
    video.load();
    void video.play().catch(() => {
      /* autoplay refused — the poster stands in */
    });

    const onPlaying = () => setPlaying(true);
    video.addEventListener('playing', onPlaying);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <section className={`hero${ready ? ' is-ready' : ''}`} id="top">
      <div className="hero__media">
        <video
          ref={videoRef}
          className="hero__video"
          poster="/img/hero-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__inner">
        <p className="hero__eyebrow">
          <span>Design, growth and merchandise</span>
        </p>

        <h1 className="hero__title">
          <span className="line">
            <span>Growth partners for</span>
          </span>
          <span className="line">
            <span>ultra luxury brands</span>
          </span>
        </h1>

        {/* The studios double as the route to contact — one link, not three,
            so a screen reader is not read the same destination three times. */}
        <Link className="hero__places" href="/contact">
          <span>Delhi</span>
          <span>London</span>
          <span>Bangalore</span>
        </Link>

        <div className="hero__actions">
          {/* Was `#contact`, which is a dead anchor: the Contact section lives
              on /contact and is not rendered on the home page. */}
          <Link className="btn btn--ghost" href="/contact">
            Start a conversation
          </Link>
        </div>
      </div>

      <a className="hero__scroll" href="#manifesto" aria-label="Scroll to next section">
        <span className="hero__scroll-rule" aria-hidden="true" />
      </a>

      {playing && (
        <button className="hero__sound" onClick={toggle}>
          {paused ? 'Play background video' : 'Pause background video'}
        </button>
      )}
    </section>
  );
}

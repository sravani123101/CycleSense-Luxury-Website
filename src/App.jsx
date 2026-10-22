import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, CalendarDays, ChartNoAxesColumnIncreasing, Flower2, Heart, Menu, ShieldCheck, Smartphone, Sparkles, X } from "lucide-react";
import CycleTracker from "./CycleTracker";

gsap.registerPlugin(ScrollTrigger);

function FlowerScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.1, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffdce7, 1.6));
    const keyLight = new THREE.PointLight(0xffa8c0, 48, 30);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xffe6cf, 30, 25);
    rimLight.position.set(-4, 1, -2);
    scene.add(rimLight);

    const flower = new THREE.Group();
    scene.add(flower);

    // Build a stylized 3D flower from curved, tapered petal meshes.
    const petalGeometry = new THREE.SphereGeometry(1, 24, 18);
    const petalColors = [0xf2b7c7, 0xd9829e, 0xffdbe4, 0xe9a1b6, 0xf8c9d4];
    for (let ring = 0; ring < 2; ring++) {
      const count = ring === 0 ? 7 : 5;
      for (let i = 0; i < count; i++) {
        const material = new THREE.MeshPhysicalMaterial({
          color: petalColors[(i + ring * 2) % petalColors.length],
          roughness: 0.34,
          metalness: 0.04,
          clearcoat: 0.5,
          side: THREE.DoubleSide
        });
        const petal = new THREE.Mesh(petalGeometry, material);
        const angle = (i / count) * Math.PI * 2 + ring * 0.32;
        petal.position.set(Math.cos(angle) * (ring ? 0.82 : 0.48), ring ? 0.16 : 0, Math.sin(angle) * (ring ? 0.82 : 0.48));
        petal.scale.set(ring ? 0.48 : 0.58, ring ? 0.17 : 0.22, ring ? 1.05 : 0.82);
        petal.rotation.y = -angle;
        petal.rotation.z = ring ? -0.48 : -0.28;
        petal.rotation.x = Math.cos(angle) * 0.25;
        flower.add(petal);
      }
    }

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, 28, 24),
      new THREE.MeshPhysicalMaterial({ color: 0xb96b80, roughness: 0.5, metalness: 0.08 })
    );
    center.position.y = 0.1;
    flower.add(center);

    // Tiny glowing pollen points add a subtle premium detail.
    const pollenGeometry = new THREE.SphereGeometry(0.035, 8, 8);
    const pollenMaterial = new THREE.MeshBasicMaterial({ color: 0xffe0a8 });
    for (let i = 0; i < 20; i++) {
      const a = i * 2.399;
      const r = 0.12 + (i % 4) * 0.045;
      const dot = new THREE.Mesh(pollenGeometry, pollenMaterial);
      dot.position.set(Math.cos(a) * r, 0.12 + (i % 3) * 0.025, Math.sin(a) * r);
      flower.add(dot);
    }

    flower.rotation.x = -0.15;
    flower.rotation.z = 0.08;

    const stars = new THREE.Group();
    const starMat = new THREE.MeshBasicMaterial({ color: 0xf4b8c9, transparent: true, opacity: 0.65 });
    for (let i = 0; i < 32; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018 + Math.random() * 0.025, 8, 8), starMat);
      dot.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 2);
      stars.add(dot);
    }
    scene.add(stars);

    let frame;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      flower.rotation.y = Math.sin(t * 0.35) * 0.28;
      flower.rotation.x = -0.15 + Math.sin(t * 0.25) * 0.07;
      flower.position.y = Math.sin(t * 0.7) * 0.12;
      stars.rotation.z = t * 0.015;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", resize);

    // The 3D flower subtly turns and moves as this section scrolls.
    const scrollTween = gsap.to(flower.rotation, {
      y: Math.PI * 1.6,
      x: 0.35,
      ease: "none",
      scrollTrigger: {
        trigger: mount.closest(".flower-section"),
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      scrollTween.scrollTrigger?.kill();
      scrollTween.kill();
      renderer.dispose();
      petalGeometry.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="flower-canvas" ref={mountRef} aria-label="Animated three-dimensional pink flower" />;
}

const petals = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`,
  delay: `${(i % 8) * -1.7}s`,
  duration: `${12 + (i % 7) * 2}s`,
  size: `${8 + (i % 5) * 4}px`,
  drift: `${(i % 2 ? 1 : -1) * (20 + (i % 5) * 12)}px`,
}));

function PetalField() {
  return <div className="petal-field" aria-hidden="true">
    {petals.map((p, i) => <span key={i} className={`petal ${i % 4 === 0 ? "petal-white" : ""}`} style={{
      left: p.left, animationDelay: p.delay, animationDuration: p.duration,
      width: p.size, height: `calc(${p.size} * 1.65)`, "--drift": p.drift
    }} />)}
  </div>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-copy > *", { y: 28, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.2 });
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.fromTo(el, { y: 34, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 84%", toggleActions: "play none none reverse" }
        });
      });
      gsap.to(".hero-glow", { scale: 1.12, opacity: 0.7, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    return () => ctx.revert();
  }, []);

  const closeMenu = () => setMenuOpen(false);
  return (
    <main>
      <header className="nav">
        <a href="#home" className="brand" onClick={closeMenu}><span className="brand-mark"><Flower2 size={26} strokeWidth={1.2} /></span> CycleSense <i>AI</i></a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#story" onClick={closeMenu}>Our approach</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#cycle-tracker" onClick={closeMenu}>Cycle tracker</a>
          <a href="#care" onClick={closeMenu}>Your care</a>
        </nav>
        <a className="nav-cta" href="#download">Android app coming soon <ArrowRight size={15} /></a>
        <button className="menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="hero" id="home">
        <div className="hero-image" />
        <video className="hero-video" autoPlay muted loop playsInline aria-hidden="true">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-glow" />
        <PetalField />
        <div className="hero-copy">
          <p className="eyebrow"><span /> A MORE PERSONAL KIND OF WELLNESS</p>
          <p className="app-status"><Smartphone size={14} /> ANDROID APP IN DEVELOPMENT</p>
          <h1>Your cycle.<br /><em>Our care.</em></h1>
          <p className="hero-subtitle">Understand your body, one day at a time.</p>
          <p className="hero-description">A calmer, more thoughtful way to track your cycle, notice patterns, and make space for yourself.</p>
          <a className="button button-primary" href="#download">Meet the upcoming app <ArrowDown size={16} /></a>
        </div>
        <div className="hero-bottom"><span>TRACK WITH INTENTION</span><span className="scroll-line" /><span>01 / 04</span></div>
        <div className="hero-side-note">A LITTLE MORE IN TUNE WITH YOU</div>
      </section>

      <section className="intro section-pad" id="story">
        <div className="intro-text reveal">
          <p className="eyebrow">WELLNESS, WITH A HUMAN TOUCH</p>
          <h2>Because your body<br />deserves <em>understanding.</em></h2>
          <p className="body-copy">CycleSense AI brings your cycle notes, daily habits, and personal insights into one gentle space. No pressure to be perfect. Just a little more awareness, day by day.</p>
          <a className="text-link" href="#features">A closer look <ArrowRight size={16} /></a>
        </div>
        <div className="flower-stage">
          <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" />
          <FlowerScene />
          <div className="stage-caption"><span>01</span><span>A ritual of self-awareness</span></div>
        </div>
      </section>

      <CycleTracker />

      <section className="quote-band">
        <span className="quote-flower"><Flower2 size={30} strokeWidth={1} /></span>
        <p className="reveal">“Care begins when you<br /><em>listen to yourself.</em>”</p>
        <span className="quote-rule" />
        <small>YOUR BODY. YOUR RHYTHM. YOUR JOURNEY.</small>
      </section>

      <section className="features section-pad" id="features">
        <div className="section-heading reveal">
          <p className="eyebrow">THOUGHTFULLY DESIGNED FOR YOU</p>
          <h2>Small insights.<br /><em>A more informed you.</em></h2>
          <p className="body-copy">The everyday tools that help you connect the dots, without adding noise to your day.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card reveal">
            <span className="feature-icon"><CalendarDays size={23} strokeWidth={1.25} /></span>
            <span className="card-number">01 / TRACK</span>
            <h3>Your cycle, clearly</h3>
            <p>Planned tools to record period dates, symptoms, moods, and personal notes in one place.</p>
            <span className="card-line" />
          </article>
          <article className="feature-card reveal">
            <span className="feature-icon"><ChartNoAxesColumnIncreasing size={23} strokeWidth={1.25} /></span>
            <span className="card-number">02 / NOTICE</span>
            <h3>Patterns that matter</h3>
            <p>Explore cycle history and estimated phases with clear, thoughtful summaries.</p>
            <span className="card-line" />
          </article>
          <article className="feature-card reveal">
            <span className="feature-icon"><Sparkles size={23} strokeWidth={1.25} /></span>
            <span className="card-number">03 / PERSONALIZE</span>
            <h3>Insights, with care</h3>
            <p>Find space for daily habits, personal reflections, and gentle wellness prompts.</p>
            <span className="card-line" />
          </article>
          <article className="feature-card reveal">
            <span className="feature-icon"><ShieldCheck size={23} strokeWidth={1.25} /></span>
            <span className="card-number">04 / PROTECT</span>
            <h3>Your story is personal</h3>
            <p>Privacy is part of the plan, with clear settings and transparent information about data use.</p>
            <span className="card-line" />
          </article>
        </div>
      </section>

      <section className="care-section" id="care">
        <div className="care-image">
          <div className="phone-glow" />
          <div className="phone-mockup">
            <div className="phone-speaker" />
            <div className="phone-status"><span>9:41</span><span>●●● ▰</span></div>
            <div className="phone-brand"><Flower2 size={17} /> CycleSense</div>
            <div className="phone-greeting">A little check-in</div>
            <div className="phone-day">Day <strong>12</strong></div>
            <div className="phase-pill"><span /> Follicular phase</div>
            <div className="phone-flower"><Flower2 size={76} strokeWidth={0.7} /></div>
            <div className="phone-info"><span>✦</span><div><small>YOUR NEXT PERIOD</small><strong>Coming up in...</strong><b>14 days</b></div></div>
            <div className="phone-tabs"><span>⌂<small>Home</small></span><span>▥<small>Insights</small></span><span>♡<small>Journal</small></span><span>○<small>Profile</small></span></div>
          </div>
          <span className="care-image-caption">A MOMENT FOR YOU</span>
        </div>
        <div className="care-copy reveal">
          <p className="eyebrow">YOUR DAILY MOMENT OF CARE</p>
          <h2>Make room for<br /><em>feeling like you.</em></h2>
          <p className="body-copy">A cycle tracker should feel supportive, not overwhelming. Build a small daily ritual, record what matters to you, and revisit your own patterns when you’re ready.</p>
          <div className="care-points">
            <span><Heart size={16} /> Gentle daily check-ins</span>
            <span><Flower2 size={16} /> A space for your notes</span>
            <span><Sparkles size={16} /> Personal reflections</span>
          </div>
          <a className="button button-outline" href="#download">Explore the app vision <ArrowRight size={16} /></a>
          <p className="health-note">CycleSense AI is a wellness companion, not a medical diagnosis tool. Predictions are estimates and may not be exact.</p>
        </div>
      </section>

      <section className="download section-pad" id="download">
        <PetalField />
        <div className="download-inner reveal">
          <Flower2 className="download-flower" size={35} strokeWidth={1} />
          <p className="eyebrow">A NEW CHAPTER IS TAKING SHAPE</p>
          <h2>Your wellbeing.<br /><em>More in tune with you.</em></h2>
          <p className="body-copy">CycleSense AI for Android is in development. We’re shaping a thoughtful space for cycle tracking, daily reflections, and personal wellness insights.</p>
          <div className="launch-status"><span className="launch-status-dot" /> ANDROID APP · COMING SOON</div>
          <div className="launch-actions">
            <a className="button button-primary" href="#features">Explore planned features <ArrowRight size={16} /></a>
            <a className="launch-secondary" href="#cycle-tracker">Try the website tracker</a>
          </div>
          <p className="launch-note">This website is a preview of the idea. The Android app is not available to install yet, and no email registration is being collected.</p>
        </div>
      </section>

      <footer className="footer">
        <a href="#home" className="brand footer-brand"><span className="brand-mark"><Flower2 size={24} strokeWidth={1.2} /></span> CycleSense <i>AI</i></a>
        <p>Understand today. Thrive tomorrow.</p>
        <div className="footer-links"><a href="#home">Home</a><a href="#features">Features</a><a href="#care">Your care</a></div>
        <span className="footer-line" />
        <small>© {new Date().getFullYear()} CycleSense AI. Made with care.</small>
      </footer>
    </main>
  );
}

export default App;
import { BadgeCheck, IndianRupee, Wifi } from 'lucide-react';
import { useEffect, useRef } from 'react';
import styles from './AuthLayout.module.css';

const QR_CELLS = Array.from({ length: 49 }, (_, index) => {
  const row = Math.floor(index / 7);
  const col = index % 7;
  const finder = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
  return finder || (row * 3 + col * 5 + row * col) % 3 === 0;
});

/**
 * Decorative 3D stage built from CSS transforms. Pointer position is eased
 * into CSS variables on animation frames (no React re-renders). Static for
 * touch-only devices and when the user prefers reduced motion.
 */
export function AuthScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window.matchMedia !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    const tick = () => {
      x += (targetX - x) * 0.07;
      y += (targetY - y) * 0.07;
      element.style.setProperty('--px', x.toFixed(4));
      element.style.setProperty('--py', y.toFixed(4));
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={styles.scene} aria-hidden="true" data-testid="auth-scene">
      <div className={styles.glowA} />
      <div className={styles.glowB} />
      <div className={styles.stage}>
        <div className={`${styles.layer} ${styles.ring}`} />
        <div className={`${styles.layer} ${styles.card}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardBrand}>MiNi Pay</span>
            <Wifi size={18} className={styles.cardContactless} />
          </div>
          <span className={styles.chip} />
          <span className={styles.cardNumber}>•••• •••• •••• 2048</span>
          <div className={styles.cardBottom}>
            <span>Sandbox wallet</span>
            <span className={styles.cardTag}>DEMO</span>
          </div>
        </div>
        <div className={`${styles.layer} ${styles.qr}`}>
          {QR_CELLS.map((on, index) => (
            <span key={index} className={on ? styles.qrOn : undefined} />
          ))}
        </div>
        <div className={`${styles.layer} ${styles.coin}`}>
          <IndianRupee size={30} strokeWidth={2.6} />
        </div>
        <div className={`${styles.layer} ${styles.toast}`}>
          <BadgeCheck size={18} />
          <span>
            <strong>₹1,250.00</strong> sent to Ravi
          </span>
        </div>
      </div>
    </div>
  );
}

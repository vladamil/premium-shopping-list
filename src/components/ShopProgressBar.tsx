import type { ReactElement } from 'react';
import styles from './ShopProgressBar.module.css';

/** With more items than this, the dots wouldn't fit, so only the line is shown. */
const MAX_STOPS = 12;

type ShopProgressBarProps = {
  bought: number;
  total: number;
  /** true = drawn on the dark trip summary card. Optional (the ?): leave it out = false. */
  onDark?: boolean;
};

// Shopping progress: one dot (stop) per item, filled when bought, and an orange
// line showing how far along you are. Decoration only: the card says the same in text.
export function ShopProgressBar({
  bought,
  total,
  onDark = false,
}: ShopProgressBarProps) {
  const showStopDots = total <= MAX_STOPS;

  // How much of the line is orange, from 0 (none) to 1 (all of it).
  let filled = 0;
  if (!showStopDots) {
    // Plain progress bar: bought ÷ total.
    filled = bought / total;
  } else if (total > 1 && bought > 0) {
    // With dots, the line ends AT the last filled dot.
    // The first dot sits at the start (0), the last dot at the end (1).
    filled = (bought - 1) / (total - 1);
  }

  // Bought dots first, then the empty ones.
  const dots: ReactElement[] = [];
  if (showStopDots) {
    for (let index = 0; index < total; index++) {
      const isDone = index < bought;
      dots.push(
        <span key={index} className={isDone ? styles.dotDone : styles.dot} />,
      );
    }
  }

  return (
    // data-on-dark="true" / "false": the CSS uses it to pick the colours
    <span className={styles.progress} data-on-dark={onDark} aria-hidden="true">
      <span className={styles.track} />
      <span
        className={styles.fill}
        style={{ width: `calc((100% - 10px) * ${filled})` }}
      />
      {dots}
    </span>
  );
}

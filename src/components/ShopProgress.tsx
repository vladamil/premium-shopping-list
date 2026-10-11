import type { ReactElement } from 'react';
import styles from './ShopProgress.module.css';

/** With more items than this, the dots wouldn't fit, so only the line is shown. */
const MAX_STOPS = 12;

type ShopProgressProps = {
  bought: number;
  total: number;
};

// Shopping progress: one dot (stop) per item, filled when bought, and an orange
// line showing how far along you are. Decoration only: the card says the same in text.
export function ShopProgress({ bought, total }: ShopProgressProps) {
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
    <span className={styles.progress} aria-hidden="true">
      <span className={styles.track} />
      <span
        className={styles.fill}
        style={{ width: `calc((100% - 10px) * ${filled})` }}
      />
      {dots}
    </span>
  );
}

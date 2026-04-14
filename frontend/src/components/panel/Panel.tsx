import type { ReactNode } from 'react';
import styles from './Panel.module.css';

const PANEL_SHELL =
  'dashboard-section panel panel--stacked panel--fixedScrollLayout';

export type PanelProps = {
  title: string;
  /** Optional secondary label next to the title (e.g. commodity kind). */
  titleExtra?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Forwarded to the root `<section>` for accessibility. */
  ariaLabel?: string;
};

export function Panel({
  title,
  titleExtra,
  headerRight,
  children,
  className,
  ariaLabel,
}: PanelProps) {
  const rootClass = [PANEL_SHELL, className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label={ariaLabel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleRow}>
          <div className={styles.panelTitle}>{title}</div>
          {titleExtra ?? null}
        </div>
        <div className={styles.panelHeaderRight}>{headerRight ?? null}</div>
      </div>

      <div className={`panel-body ${styles.panelBody}`}>{children}</div>
    </section>
  );
}

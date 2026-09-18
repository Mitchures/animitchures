import { CSSProperties, PointerEvent, ReactNode, useCallback } from 'react';
import { Link } from 'react-router-dom';

import './FrostedTile.css';

import { TilePalette, TileTreatment } from 'helpers';
import { prefersReducedMotion } from 'components/useSettle';

export type { TileTreatment };

interface Props {
  treatment: TileTreatment;
  palette: TilePalette;
  label?: string;
  caption?: string;
  footer?: ReactNode;
  to?: string;
  className?: string;
  /**
   * `sm` scales every disc diameter down with it. Without that the discs —
   * sized for a 168px tile — flood a shorter one and it reads as a flat
   * gradient card rather than colour behind glass.
   */
  size?: 'md' | 'sm';
  /** Merged after the palette variables — the entrance stagger index. */
  style?: CSSProperties;
  /**
   * Drawn behind the content and above the colour layer — the ripple on the
   * "coming later" lead card. Kept as its own slot because the rule that puts
   * children in the flow is more specific than any class the caller could add,
   * so a decoration passed as a child cannot stay absolutely positioned.
   */
  decoration?: ReactNode;
  /** The number slot — a DotNumber. */
  children?: ReactNode;
  /**
   * Pointer and focus notifications, for a caller that needs to know the tile
   * is being looked at — `TileDeck` pauses its rotation on both.
   *
   * Pass-throughs rather than a spread of every DOM prop: the tile already owns
   * `onPointerMove` and `onPointerLeave` for the colour layer's drift, and a
   * blind spread would let a caller replace those by accident.
   */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * The reference's gradient widget: cool-grey glass with circular colour discs
 * blurred behind it and grain on top. Three treatments — band (caps in the top
 * corners over a deep floor), blob (an arc offset to the right), core (a hot
 * centre). The discs are positioned and sized in CSS; the palette arrives as
 * custom properties. Interior: label top, number + caption centred, footer on
 * the bottom edge. The colour layer follows the pointer a few pixels.
 */
function FrostedTile({
  treatment,
  palette,
  label,
  caption,
  footer,
  to,
  className = '',
  size = 'md',
  style: extraStyle,
  decoration,
  children,
  onPointerEnter,
  onPointerLeave: notifyLeave,
  onFocus,
  onBlur,
}: Props) {
  const style = {
    '--cap': palette.cap,
    '--body': palette.body,
    '--accent': palette.accent,
    ...extraStyle,
  } as CSSProperties;

  const follow = useCallback((event: PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;
    const el = event.currentTarget;
    const box = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`);
  }, []);
  const reset = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      event.currentTarget.style.setProperty('--mx', '50%');
      event.currentTarget.style.setProperty('--my', '50%');
      notifyLeave?.();
    },
    [notifyLeave],
  );

  const inner = (
    <>
      <span className="frostedTile__fx" aria-hidden="true">
        <i className="frostedTile__disc" />
        <i className="frostedTile__disc" />
        <i className="frostedTile__disc" />
        <i className="frostedTile__disc" />
      </span>
      {decoration && (
        <span className="frostedTile__deco" aria-hidden="true">
          {decoration}
        </span>
      )}
      {label && <div className="frostedTile__label">{label}</div>}
      <div className="frostedTile__number">{children}</div>
      {caption && <div className="frostedTile__caption">{caption}</div>}
      {footer && <div className="frostedTile__footer">{footer}</div>}
    </>
  );
  const cls = `frostedTile frostedTile--${treatment}${
    size === 'sm' ? ' frostedTile--sm' : ''
  } ${className}`.trim();
  const handlers = {
    onPointerMove: follow,
    onPointerLeave: reset,
    onPointerEnter,
    onFocus,
    onBlur,
  };

  if (to) {
    return (
      <Link to={to} className={cls} style={style} {...handlers}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls} style={style} {...handlers}>
      {inner}
    </div>
  );
}

export default FrostedTile;

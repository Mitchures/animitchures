import './PosterArt.css';

interface Props {
  src?: string | null;
  /** The title's own `coverImage.color`. Seeds the orb behind the art. */
  color?: string | null;
  alt?: string;
  className?: string;
}

/**
 * A poster over a soft blurred orb of its own cover colour.
 *
 * The treatment the reference gives its supplement bottles, where the product
 * sits on a glow of its own colour rather than on a coloured card. It costs one
 * element, and it is the fourth thing the app derives from that single colour
 * field — alongside the frosted tiles, the week-strip dots and the genre tiles.
 */
function PosterArt({ src, color, alt = '', className = '' }: Props) {
  return (
    <span className={`posterArt ${className}`.trim()}>
      {color && (
        <span className="posterArt__orb" style={{ background: color }} aria-hidden="true" />
      )}
      <img src={src ?? undefined} alt={alt} />
    </span>
  );
}

export default PosterArt;

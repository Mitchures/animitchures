import { Link } from 'react-router-dom';

import './CastChip.css';

interface Props {
  image?: string | null;
  name: string;
  /** The role — "Main", "Director". */
  meta?: string | null;
  /** The voice actor's portrait, tucked into the corner of the character's. */
  insetImage?: string | null;
  insetName?: string | null;
  /** Where the primary face leads. Without it the chip stays inert. */
  to?: string;
  /** Where the inset portrait leads — the actor, on a character credit. */
  insetTo?: string;
}

/**
 * One cast or crew credit.
 *
 * Replaces a mirrored row that put the character and the voice actor at equal
 * size facing each other, with nothing to say which was which — that symmetry
 * was the clutter. Here the character's portrait is primary and the actor's
 * overlaps its corner, which is how a credit actually pairs them.
 *
 * The two faces lead to two different pages, so they are two separate links
 * rather than one wrapping the whole chip — nesting the actor's link inside a
 * chip-wide one is invalid, and it would also make the actor unreachable.
 *
 * Shared by Characters and Staff: the two render the identical chip, and two
 * copies of it would drift.
 */
function CastChip({ image, name, meta, insetImage, insetName, to, insetTo }: Props) {
  const face = <img className="castChip__face" src={image ?? ''} alt={name} loading="lazy" />;
  const inset = insetImage ? (
    <img
      className="castChip__inset"
      src={insetImage}
      alt={insetName ?? ''}
      title={insetName ?? undefined}
      loading="lazy"
    />
  ) : null;

  return (
    <div className={`castChip${to ? ' castChip--link' : ''}`}>
      <div className="castChip__faces">
        {face}
        {inset &&
          (insetTo ? (
            <Link className="castChip__insetLink" to={insetTo} title={insetName ?? undefined}>
              {inset}
            </Link>
          ) : (
            inset
          ))}
      </div>
      <div className="castChip__body">
        <h5>
          {to ? (
            // Stretched link: the anchor is on the name for screen readers and
            // the status bar, but a pseudo-element covers the whole chip so the
            // card is the click target. Nesting the actor's link inside a
            // chip-wide anchor would be invalid HTML; this keeps them siblings.
            <Link className="castChip__link" to={to}>
              {name}
            </Link>
          ) : (
            name
          )}
        </h5>
        {meta && <p>{meta}</p>}
        {/* The actor's full name, not a surname — the chip has room for it. */}
        {insetName &&
          (insetTo ? (
            <Link className="castChip__insetName" to={insetTo}>
              {insetName}
            </Link>
          ) : (
            <span className="castChip__insetName">{insetName}</span>
          ))}
      </div>
    </div>
  );
}

export default CastChip;

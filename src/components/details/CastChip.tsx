import './CastChip.css';

interface Props {
  image?: string | null;
  name: string;
  /** The role — "Main", "Director". */
  meta?: string | null;
  /** The voice actor's portrait, tucked into the corner of the character's. */
  insetImage?: string | null;
  insetName?: string | null;
}

/**
 * One cast or crew credit.
 *
 * Replaces a mirrored row that put the character and the voice actor at equal
 * size facing each other, with nothing to say which was which — that symmetry
 * was the clutter. Here the character's portrait is primary and the actor's
 * overlaps its corner, which is how a credit actually pairs them.
 *
 * Shared by Characters and Staff: the two render the identical chip, and two
 * copies of it would drift.
 */
function CastChip({ image, name, meta, insetImage, insetName }: Props) {
  return (
    <div className="castChip">
      <div className="castChip__faces">
        <img className="castChip__face" src={image ?? ''} alt={name} loading="lazy" />
        {insetImage && (
          <img
            className="castChip__inset"
            src={insetImage}
            alt={insetName ?? ''}
            title={insetName ?? undefined}
            loading="lazy"
          />
        )}
      </div>
      <div className="castChip__body">
        <h5>{name}</h5>
        {meta && <p>{meta}</p>}
        {/* The actor's full name, not a surname — the chip has room for it. */}
        {insetName && <span className="castChip__insetName">{insetName}</span>}
      </div>
    </div>
  );
}

export default CastChip;

import './Skeleton.css';

interface Props {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

/** A shimmering placeholder block. Sized by the caller to match real content. */
function Skeleton({ width = '100%', height = '1rem', radius = '8px', className = '' }: Props) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;

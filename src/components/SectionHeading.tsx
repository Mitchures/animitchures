import './SectionHeading.css';

/**
 * The heading above a Discover section.
 *
 * Shared because there are six sections now and each had its own copy of the
 * same two rules — the horizontal padding has to match the content beneath it,
 * and one drifting is invisible until you notice a heading sitting a few pixels
 * off from every other.
 */
function SectionHeading({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="sectionHeading">
      <h3>{title}</h3>
      {detail && <p>{detail}</p>}
    </div>
  );
}

export default SectionHeading;

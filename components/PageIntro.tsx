/**
 * The opening band on every page that is not the home page. Keeps the
 * nav-height offset and the rhythm into the first section in one place
 * instead of in six.
 */
export default function PageIntro({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pintro">
      <div className="wrap pintro__grid">
        <h1 className="pintro__title">{title}</h1>
        {lede && <p className="pintro__lede">{lede}</p>}
        {children}
      </div>
    </header>
  );
}

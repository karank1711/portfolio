export function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-page px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-24 py-20 md:py-28 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

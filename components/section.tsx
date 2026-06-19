interface Props {
  children: React.ReactNode;
}

const Section = ({ children }: Props) => (
  <section className="mt-2">{children}</section>
);

export default Section;

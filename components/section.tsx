import { cn } from "@/utils/cn";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Section = ({ children, className }: Props) => (
  <section className={cn("mt-2", className)}>{children}</section>
);

export default Section;

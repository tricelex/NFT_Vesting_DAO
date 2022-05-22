type Props = {
  children: React.ReactNode;
};

export default function Prose({ children }: Props) {
  return <div className="max-w-prose mx-auto px-4">{children}</div>;
}

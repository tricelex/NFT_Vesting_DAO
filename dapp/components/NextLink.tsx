import Link from "next/link";

type Props = {
  href: string;
  className?: string;
  "aria-label"?: string;
  onClick?: () => void;
  children?: React.ReactNode;
};

export default function NextLink({ href, children, ...rest }: Props) {
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
}

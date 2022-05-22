import Footer from "./Footer";
import Header from "./Header";
import Meta from "./Meta";

type Props = {
  children: React.ReactNode;
  pageTitle?: string;
};

export default function Layout({ children, pageTitle }: Props) {
  return (
    <>
      <Meta pageTitle={pageTitle} />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

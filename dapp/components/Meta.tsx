import Head from "next/head";
import { useRouter } from "next/router";

import projectConfig from "../config/projectConfig";

type Props = {
  pageTitle?: string;
};

const meta = {
  description: `${projectConfig.nftName} is a VestingNFT DAO`,
  ogImagePath: "/assets/card-image.png",
};

export default function Meta({ pageTitle }: Props) {
  const router = useRouter();
  const ogUrl = projectConfig.siteUrl + router.asPath;
  const ogType = router.pathname === "/" ? "website" : "article";
  const ogTitle = pageTitle
    ? pageTitle
    : "An NFT Vesting DApp";
  const ogImage = projectConfig.siteUrl + meta.ogImagePath;

  return (
    <Head>
      <title>{`${pageTitle} | ${projectConfig.nftName}`}</title>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color="#5bbad5"
      />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <meta name="msapplication-TileColor" content="#ffc40d" />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <meta name="description" content={meta.description} key="description" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={projectConfig.nftName} />
      <meta property="og:title" content={ogTitle} />
      <meta
        property="og:description"
        content={meta.description}
        key="ogDescription"
      />
      <meta property="og:image" content={ogImage} key="ogImage" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={projectConfig.twitterUsername} />
    </Head>
  );
}

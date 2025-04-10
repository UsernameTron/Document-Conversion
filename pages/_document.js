import { Html, Head, Main, NextScript } from 'next/document';

export default function MyDocument() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Document Conversion Application for various file formats" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="icon" href="/favicon.ico" />
        {/* Add structured schema data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Document Conversion & Use-Case Selector',
              description: 'A user-friendly application that allows users to select a use case, choose a target format, upload a document, and receive a converted result.',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
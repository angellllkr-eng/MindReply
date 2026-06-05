"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const googleAdsConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
const googleAdsCheckoutConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const solutionLandingPaths = new Set([
  "/solutions/psychologists",
  "/solutions/legal-counsel",
  "/solutions/executives",
  "/solutions/financial-advisors",
]);

export default function MarketingPixels() {
  const pathname = usePathname();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "mindreply_page_view",
      page_path: window.location.pathname,
      page_location: window.location.href,
    });

    if (googleAdsId && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: window.location.pathname,
        page_location: window.location.href,
      });
    }

    if (metaPixelId && window.fbq) {
      window.fbq("track", "PageView");
    }

    if (solutionLandingPaths.has(window.location.pathname)) {
      const audience = window.location.pathname.split("/").pop() || "unknown";
      window.dataLayer.push({
        event: "solution_landing_conversion_intent",
        audience,
        page_path: window.location.pathname,
      });

      if (googleAdsId && googleAdsConversionLabel && window.gtag) {
        window.gtag("event", "conversion", {
          send_to: `${googleAdsId}/${googleAdsConversionLabel}`,
          audience,
          page_path: window.location.pathname,
        });
      }

      if (metaPixelId && window.fbq) {
        window.fbq("track", "ViewContent", {
          content_name: `MindReply ${audience} solution`,
          content_category: "solution_landing",
        });
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      window.dataLayer.push({
        event: "membership_checkout_success",
        membership_tier: params.get("tier") || "unknown",
      });

      if (googleAdsId && googleAdsCheckoutConversionLabel && window.gtag) {
        window.gtag("event", "conversion", {
          send_to: `${googleAdsId}/${googleAdsCheckoutConversionLabel}`,
          membership_tier: params.get("tier") || "unknown",
        });
      }

      if (metaPixelId && window.fbq) {
        window.fbq("track", "Subscribe", {
          content_name: "MindReply Membership",
          content_category: params.get("tier") || "membership",
        });
      }
    }
  }, [pathname]);

  return (
    <>
      {gtmId && (
        <>
          <Script id="mindreply-gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}

      {googleAdsId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} strategy="afterInteractive" />
          <Script id="mindreply-google-ads" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${googleAdsId}',{send_page_view:false});`}
          </Script>
        </>
      )}

      {metaPixelId && (
        <Script id="mindreply-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');`}
        </Script>
      )}
    </>
  );
}

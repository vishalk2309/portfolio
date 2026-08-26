import { useEffect } from "react";

export default function AdSense({ slot, format = "auto", responsive = true }) {
  useEffect(() => {
    try {
      if (window.adsbygoogle && window.adsbygoogle.length > 0) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.log("AdSense error:", err);
    }
  }, [slot]);

  return (
    <div className="my-8 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1860643725172516"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}

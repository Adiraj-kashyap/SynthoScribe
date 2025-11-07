import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot?: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  adSlot = process.env.REACT_APP_ADSENSE_AD_SLOT || '',
  adFormat = 'auto',
  fullWidthResponsive = true
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only load AdSense script once
    if (scriptLoaded.current || !adSlot) return;

    // Check if script already exists
    if (document.querySelector('script[src*="adsbygoogle"]')) {
      scriptLoaded.current = true;
      return;
    }

    // Load AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + (process.env.REACT_APP_ADSENSE_CLIENT_ID || '');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      scriptLoaded.current = true;
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [adSlot]);

  useEffect(() => {
    // Initialize ad when component mounts and script is loaded
    if (adRef.current && scriptLoaded.current && adSlot) {
      try {
        // @ts-ignore - adsbygoogle is loaded dynamically
        ((window.adsbygoogle = window.adsbygoogle || [])).push({});
      } catch (err) {
        console.error('Error initializing AdSense:', err);
      }
    }
  }, [adSlot]);

  // If no ad slot is configured, show placeholder
  if (!adSlot) {
    return (
      <div className="flex items-center justify-center h-24 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-md border-2 border-dashed border-gray-400 dark:border-gray-500">
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">
          Advertisement Placeholder
          <br />
          <span className="text-xs">Configure REACT_APP_ADSENSE_AD_SLOT and REACT_APP_ADSENSE_CLIENT_ID to enable AdSense</span>
        </p>
      </div>
    );
  }

  return (
    <div ref={adRef} className="adsense-container">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.REACT_APP_ADSENSE_CLIENT_ID || ''}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdBanner;

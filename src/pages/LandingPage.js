import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import WelcomePopup from '../components/WelcomePopup';
import './LandingPage.css'; // Assuming you have a CSS file for styling


const LandingPage = () => {
  const typeformRef = useRef(null);
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const handleContactClick = () => {
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.classList.add('show');
      }
    }, 0); // Delay modal opening until after click event fully finishes
  };
  

  const closeModal = () => {
    console.log("Closing modal...");
    if (modalRef.current) {
      modalRef.current.classList.remove('show'); // Remove the 'show' class to hide the modal
    }
  };

  const tryDemo = () => {
    const width = 375;
    const height = 812;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      `${window.location.origin}/restaurant/1?table=1A`,
      'DingDemo',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
  };

  useEffect(() => {
    // Sticky header logic
    const handleScroll = () => {
      const header = document.querySelector('.sticky-header');
      const heroSection = document.querySelector('.hero');

      if (!header || !heroSection) return;

      const scrollPosition = window.scrollY;
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

      if (scrollPosition > heroBottom - 100) {
        header.classList.add('visible');
      } else {
        header.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Typeform embed logic
    if (window.tf && typeformRef.current) {
      window.tf.createWidget('01JRNCY2W3BS2Z5V45GEXPZQBB', {
        container: typeformRef.current,
        inlineOnMobile: true,
        hideHeaders: true,
        hideFooter: true,
      });
    }

    // Close modal when clicking outside
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        event.target === modalRef.current // only if clicking directly on the background
      ) {
        closeModal();
      }
    };
    
    window.addEventListener('click', handleClickOutside);

    // Ensure video autoplay
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      <Helmet>
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K6BB86NN');` }} />
        <script>
          {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6384441,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </script>
        <meta charSet="UTF-8" />
        <title>DING! - Smart QR Code Ordering System for Restaurants | Digital Menu Solution</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Transform your restaurant with DING's QR code ordering system. Seamless POS integration, contactless ordering, and smart digital menus for enhanced customer experience. Try our restaurant technology solution today!"
        />
        <meta
          name="keywords"
          content="QR code ordering system, restaurant QR code menu, digital menu for restaurants, restaurant POS integration, contactless ordering, smart restaurant ordering system"
        />
        <meta property="og:title" content="DING! - Smart QR Code Ordering System for Restaurants" />
        <meta
          property="og:description"
          content="Transform your restaurant with DING's QR code ordering system. Seamless POS integration, contactless ordering, and digital menus."
        />
        <meta property="og:image" content="assets/dingwhiteTransaparent.png" />
        <meta property="og:url" content="https://myding.in" />
        <link rel="canonical" href="https://myding.in" />
        <link
          href="https://fonts.googleapis.com/css2?family=BioRhyme+Expanded:wght@200;300;400;700;800&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
        />
        <link rel="stylesheet" href="styles.css"></link>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "DING QR Ordering System",
              "applicationCategory": "Restaurant Technology",
              "operatingSystem": "Web-based",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "6 months free trial"
              },
              "description": "Smart QR code ordering system for restaurants with POS integration and digital menu management"
            }
          `}
        </script>
      </Helmet>
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-K6BB86NN"
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <div className="ding-website">
        <button className="contact-button" onClick={handleContactClick}>Contact Us</button>
        <button className="sticky-demo-button" onClick={tryDemo}>Try Demo</button>

        <header className="sticky-header">
          <div className="header-spacer"></div>
          <img
            src="assets/dingwhiteTransaparent.png"
            alt="DING! QR Code Restaurant Ordering System Logo"
            className="sticky-logo"
          />
          <div className="header-spacer"></div>
        </header>

        <div className="main-content">
          <section id="home" className="hero">
            <div className="video-overlay"></div>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="hero-background"
              poster="assets/ding.jpg"
              defaultMuted
              preload="auto"
            >
              <source src="assets/videos/bg.mp4" type="video/mp4" />
            </video>
            <img
              src="assets/dingwhiteTransaparent.png"
              alt="DING! Smart Restaurant Ordering Solution"
              className="hero-logo"
            />
            <div className="hero-content">
              <h1 style={{ fontSize: '2.5rem' }}>&quot;Tap. Order. DING!&quot;</h1>
              <p className="hero-subtitle">Every plate is a chance to create a story they'll share.</p>
              <button onClick={tryDemo}>Try Demo</button>
            </div>
          </section>

          <section id="how-it-works">
            <h2 className="highlight">How It Works</h2>
            <div className="steps">
              <div className="card">
                <img src="assets/qrc.gif" alt="Scan QR Code" className="step-icon" />
                <div className="step-text">1. Scan</div>
              </div>
              <div className="card">
                <img src="assets/food.gif" alt="Place Order" className="step-icon" />
                <div className="step-text">2. Order</div>
              </div>
              <div className="card">
                <img
                  src="https://img.icons8.com/ios-filled/50/tableware.png"
                  alt="Enjoy Food"
                  className="step-icon"
                />
                <div className="step-text">3. Eat</div>
              </div>
              <div className="card">
                <img src="assets/cash.gif" alt="Make Payment" className="step-icon" />
                <div className="step-text">4. Pay</div>
              </div>
            </div>
          </section>

          <section id="features" className="highlight">
            <h2>🔥 Not Your Average QR Menu 🔥</h2>
            <p><strong>Menus are old news.</strong> This is a meal-time experience.</p>

            <div className="feature-cards">
              <div className="feature-card">
                <h3>🍽️ What's Unique</h3>
                <ul>
                  <li>Smart pairings with cart items</li>
                  <li>Bestsellers and Specials first</li>
                  <li>Curated Meal combos</li>
                  <li>Live ETA after orders</li>
                  <li>Engaging trivia while they wait</li>
                </ul>
              </div>

              <div className="feature-card">
                <h3>📲 Why Guests Will Love It:</h3>
                <ul>
                  <li>No app download</li>
                  <li>Super fast and smooth ordering</li>
                  <li>Zero wait-time, zero friction</li>
                  <li>Find favs fast</li>
                  <li>Always in the loop, never bored</li>
                </ul>
              </div>

              <div className="feature-card">
                <h3>👩‍🍳 Why You'll Love It:</h3>
                <ul>
                  <li>Fewer order errors</li>
                  <li>More upsells, less hassle</li>
                  <li>Delight guests without effort</li>
                  <li>Works with your current setup</li>
                  <li>Syncs smooth with your POS</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="partners" className="partners">
            <h2>Our POS Partners</h2>
            <p>We integrate smoothly with leading systems</p>
            <div className="partner-logos">
              <div className="partner">
                <img src="/assets/partners/int2.webp" alt="Petpooja logo" />
              </div>
              <div className="partner">
                <img src="/assets/partners/int1.webp" alt="Restroworks logo" />
              </div>
              <div className="partner">
                <img src="/assets/partners/int5.webp" alt="LucidPOS logo" />
              </div>
              <div className="partner loading-partner">
                <div className="loading-text">Loading more soon...</div>
              </div>
            </div>
          </section>

          <section id="demo" className="highlight">
            <h2 className="highlight">Experience It</h2>
            <p>Scan this to see it in action</p>
            <div className="demo-container">
              <img className="qr-demo" src="/assets/qr.png" alt="Demo QR Code" />
              <div className="demo-steps">
                <span>1. Point your camera at the QR code</span>
                <span>2. Tap the link that appears</span>
                <span>3. Browse, order, and enjoy!</span>
              </div>
            </div>
          </section>

          <section id="pricing" className="highlight">
            <h2>Pricing</h2>
            <p><strong>🚨 Beta Alert!</strong> We're giving you <em>six months</em> FREE — but not for long!</p>
            
            <div className="pricing-cards">
              <div className="pricing-card">
                <div className="pricing-icon">🆓</div>
                <div className="pricing-text">Free for the first 6 months (Hurry, clock's ticking!)</div>
              </div>
              <div className="pricing-card">
                <div className="pricing-icon">🚀</div>
                <div className="pricing-text">Full access to all features</div>
              </div>
              <div className="pricing-card">
                <div className="pricing-icon">🤝</div>
                <div className="pricing-text">Priority support & onboarding</div>
              </div>
            </div>

            <p style={{ marginTop: '2rem' }}>No hidden fees. Just awesome value. Grab it while it's hot!</p>
            <button className="claim-button" onClick={handleContactClick}>Claim Your Spot</button>
          </section>
        </div>

        <section id="contact" className="cta">
          <h2>Smart Tables. Happy Diners.</h2>
          <div className="btns">
            <button onClick={tryDemo}>Get a Demo</button>
            <button onClick={handleContactClick}>Contact Us</button>
          </div>
          <div className="social-links">
            <a
              href="https://www.linkedin.com/company/dingqr/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/dingqr"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/dingqr_hq"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/dingqr_hq/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
          <div className="footer-content">
            <p>© 2025 DING! - Smart Restaurant QR Code Ordering System</p>
            <div className="footer-links">
              <span className="footer-made-in">Made with ❤️ in Hyderabad, India 🇮🇳</span>
              <span className="separator">|</span>
              <Link to="/terms">Terms & Conditions</Link>
              <span className="separator">|</span>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </section>

        <div id="typeform-modal" className="modal" ref={modalRef}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <iframe
              src="https://form.typeform.com/to/yFoXa5UU"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Typeform"
            ></iframe>
          </div>
        </div>

        <script src="script.js"></script>
      </div>
    </>
  );
};

export default LandingPage;
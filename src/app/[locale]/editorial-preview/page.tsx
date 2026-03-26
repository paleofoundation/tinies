"use client";
import { useState } from "react";

const PROVIDERS = [
  { name: "Nikos Stavrou", rating: "5.0 · 1 review", location: "Larnaca", image: "https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/provider/provider-nikos-demetriou.jpg" },
  { name: "Andreas Christou", rating: "5.0 · 1 review", location: "Limassol", image: "https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/provider/provider-andreas-christou.jpg" },
  { name: "Sofia Andreou", rating: "5.0 · 1 review", location: "Limassol", image: "https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/provider/provider-sofia-andreou.jpg" },
  { name: "Yiannis Konstantinou", rating: "4.8 · 0 reviews", location: "Nicosia", image: "https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/provider/provider-yiannis-konstantinou.jpg" },
];

const ADOPTABLES = [
  { name: "Ziggy", meta: "Domestic Shorthair · Cat · 1 year", body: "Pure energy. Ziggy plays with everything and brings a slightly chaotic, deeply lovable kind of joy.", image: "https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/profile_ziggy.jpg" },
  { name: "Toshiba", meta: "Domestic Shorthair · Cat · 4 years", body: "Independent, dignified, and fully committed to sunbathing with judgmental excellence.", image: "https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/adoption/adoption-toshiba-1.jpg" },
  { name: "Splotch", meta: "Domestic Shorthair · Cat · 3 years", body: "Quiet and sweet. Splotch is a lap-claimer with a soft purr and a very gentle presence.", image: "https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/adoption/adoption-splotch-1.jpg" },
  { name: "Chili Pepper", meta: "Domestic Shorthair · Cat · 1 year", body: "Playful, energetic, and impossible to ignore. A true show pony with a dramatic sense of timing.", image: "https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/adoption/adoption-ziggy-1.jpg" },
];

const TESTIMONIALS = [
  { quote: "Sofia is a total pro. She did a meet-and-greet first and put us at ease. Our cats had a calm week while we were away.", meta: "Christina · Sofia Andreou", date: "22 Mar 2026" },
  { quote: "Very reliable and kind. Flexible with timing when our flight was delayed. Thank you.", meta: "Christina · Maria Georgiou", date: "18 Mar 2026" },
  { quote: "Nikos took our dog on amazing beach walks. You can tell he really cares. Highly recommend for active dogs.", meta: "Christina · Nikos Stavrou", date: "18 Mar 2026" },
  { quote: "Elena was great with our cat. She followed all our instructions and left the flat spotless. Our cat was relaxed when we got home.", meta: "Christina · Elena Papadopoulou", date: "18 Mar 2026" },
];

const FAQS = [
  { q: "How much does it cost?", a: "Providers set their own rates. Tinies adds a 12% service fee, and 90% of that fee goes directly to animal rescue." },
  { q: "Is my pet safe?", a: "Every provider is identity-verified and reviewed by real pet owners. Every booking is backed by the Tinies Guarantee up to EUR 2,000 for veterinary costs." },
  { q: "How does international adoption work?", a: "Tinies coordinates vet preparation, EU pet passport, transport, and customs documentation in one clear process." },
  { q: "Where does the money go?", a: "Ninety percent of commission goes directly to rescue animal care including food, vet bills, and shelter support." },
];

const SEEN_ON = ["Today", "Forbes", "Fast Company", "Salon", "TechCrunch"];

const STATS = [
  ["6", "bookings completed"],
  ["4", "five-star reviews"],
  ["0", "animals adopted"],
  ["EUR 0.00", "donated to rescue"],
];

const HOW_IT_WORKS = [
  ["01", "Find your perfect match", "Browse verified providers near you."],
  ["02", "Book with confidence", "Secure payment, free cancellation, and the Tinies Guarantee."],
  ["03", "Every booking helps", "Ninety percent of commission supports rescue animals."],
];

const WHY_DIFFERENT = [
  ["90% to rescue", "Ninety percent of every commission feeds, shelters, and provides vet care for rescue animals."],
  ["Real verification", "Every provider is identity-verified. Every rescue organization is registered. Every euro is tracked."],
  ["Tinies Guarantee", "Up to EUR 2,000 vet coverage, with refund protection for no-shows and booking failures."],
];

/* ── tiny SVG icons ── */
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:20,height:20}}>
    <path d="M7 9v8"/><path d="M11 17v-4.2a2.8 2.8 0 0 1 5.6 0V17"/>
    <path d="M7 7.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:20,height:20}}>
    <path d="M14 8h2.5V4.8c-.44-.06-1.4-.18-2.54-.18-2.52 0-4.25 1.54-4.25 4.38V11H7v3.6h2.7V20h3.3v-5.4h2.64L16.1 11H13V9.38c0-1.04.28-1.76 1-1.76Z"/>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:20,height:20}}>
    <path d="M5 5l14 14"/><path d="M19 5 5 19"/>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:20,height:20}}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const SOCIALS = [
  { name: "LinkedIn", icon: <LinkedInIcon /> },
  { name: "Facebook", icon: <FacebookIcon /> },
  { name: "X", icon: <XIcon /> },
  { name: "Instagram", icon: <InstagramIcon /> },
];

/* ── CSS tokens ── */
const T = {
  primary: "#0A8080",
  secondary: "#F45D48",
  bg: "#FFFFFF",
  text: "#1C1C1C",
  textSec: "rgba(28,28,28,0.7)",
  textMuted: "rgba(28,28,28,0.5)",
  border: "rgba(10,128,128,0.15)",
  primary50: "#F1F9F9",
  primary100: "#DFF6F6",
  shadowSm: "0 2px 8px rgba(10,128,128,0.06)",
  shadowMd: "0 4px 16px rgba(10,128,128,0.08)",
  shadowLg: "0 8px 32px rgba(10,128,128,0.1)",
};

const display = {
  fontFamily: "'Poppins', sans-serif",
  textTransform: "uppercase",
  letterSpacing: "-0.04em",
  lineHeight: 0.94,
  fontWeight: 900,
};

const eyebrow = {
  fontFamily: "'Poppins', sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 800,
  fontSize: "0.75rem",
};

const container = { maxWidth: 1280, marginInline: "auto", paddingInline: 24 };
const sectionPad = { paddingBlock: "clamp(4rem, 8vw, 8rem)" };

/* ── page ── */
export default function TiniesEditorialTheme() {
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      {/* google fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        img { display: block; max-width: 100%; }
        a { color: inherit; text-decoration: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp .6s ease both; }
        .fade-up-d1 { animation-delay:.08s }
        .fade-up-d2 { animation-delay:.16s }
        .fade-up-d3 { animation-delay:.24s }
        .fade-up-d4 { animation-delay:.32s }
        .hover-lift { transition: transform .22s ease, box-shadow .22s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: ${T.shadowMd}; }
        .paper-grid {
          background-image:
            linear-gradient(to right, rgba(10,128,128,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10,128,128,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .soft-noise {
          background-image: radial-gradient(rgba(10,128,128,0.05) 0.6px, transparent 0.6px);
          background-size: 14px 14px;
        }
        @media (min-width: 768px) {
          .md-grid-2 { grid-template-columns: repeat(2, 1fr); }
          .md-grid-3 { grid-template-columns: repeat(3, 1fr); }
          .md-grid-4 { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .lg-split-hero { grid-template-columns: 1.08fr 0.92fr; }
          .lg-split { grid-template-columns: 0.92fr 1.08fr; }
          .lg-split-r { grid-template-columns: 0.95fr 1.05fr; }
          .lg-split-giving { grid-template-columns: 1.05fr 0.95fr; }
          .lg-split-why { grid-template-columns: 0.88fr 1.12fr; }
          .lg-split-test { grid-template-columns: 0.9fr 1.1fr; }
          .lg-split-faq { grid-template-columns: 0.86fr 1.14fr; }
          .lg-split-press { grid-template-columns: 0.34fr 1fr; }
          .lg-grid-5 { grid-template-columns: repeat(5, 1fr); }
          .lg-container { padding-inline: 40px; }
        }
        @media (min-width: 1280px) {
          .xl-grid-4 { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        borderBottom: `1px solid ${T.border}`,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBlock: 16 }}>
          <div style={{ ...eyebrow, fontSize: "0.875rem", color: T.primary }}>Tinies</div>
          <nav style={{ display: "flex", gap: 24, fontSize: "0.875rem", fontWeight: 500, color: T.textSec }} className="hide-mobile">
            {["Find Care", "Providers", "Adopt", "Giving", "FAQ"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,"")}`} style={{ transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = T.text}
                onMouseLeave={e => e.currentTarget.style.color = T.textSec}>{l}</a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{
              border: `1px solid ${T.border}`, borderRadius: 999, padding: "8px 16px",
              fontSize: "0.875rem", fontWeight: 600, background: "white", color: T.text, cursor: "pointer"
            }} className="hide-mobile">Sign in</button>
            <button style={{
              border: "none", borderRadius: 999, padding: "8px 16px",
              fontSize: "0.875rem", fontWeight: 600, background: T.secondary, color: "white",
              cursor: "pointer", boxShadow: T.shadowSm, transition: "transform .2s"
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>Sign up</button>
          </div>
        </div>
        <style>{`@media (max-width: 767px) { .hide-mobile { display: none !important; } }`}</style>
      </header>

      <main>
        {/* ═══ HERO ═══ */}
        <section className="paper-grid" style={{ overflow: "hidden" }}>
          <div style={{ ...container, position: "relative", paddingTop: 40, paddingBottom: 96 }}>
            {/* floating accents */}
            <div style={{ position:"absolute",left:"7%",top:64,width:64,height:64,borderRadius:28,border:`1px solid ${T.border}`,background:T.primary50,pointerEvents:"none" }}/>
            <div style={{ position:"absolute",right:"9%",top:96,width:96,height:36,borderRadius:999,background:"rgba(244,93,72,0.12)",pointerEvents:"none" }}/>

            <p style={{ textAlign:"center", fontSize:"0.875rem", color:T.textSec, marginBottom:24 }} className="fade-up">Tinies is in beta. Help us improve.</p>

            <div style={{ display:"grid", gap:40, alignItems:"end" }} className="lg-split-hero">
              <div style={{ position:"relative", zIndex:10 }} className="fade-up fade-up-d1">
                <div style={{ ...eyebrow, color:T.primary, marginBottom:16 }}>Trusted pet care and rescue adoption in Cyprus</div>
                <h1 style={{
                  ...display, fontSize:"clamp(3rem, 9vw, 6.1rem)", color:T.text, maxWidth:720
                }}>
                  no matter<br/>
                  <span style={{ color:T.primary }}>the size.</span>
                </h1>
                <p style={{ marginTop:24, maxWidth:560, fontSize:"clamp(1rem, 2.5vw, 1.25rem)", lineHeight:1.7, color:T.textSec }}>
                  Book a walk. Help a tiny. Tinies connects pet owners with trusted care while directing 90% of commission to rescue animals across Cyprus.
                </p>
                <div style={{ marginTop:32, display:"flex", flexWrap:"wrap", gap:16 }}>
                  <button style={{ border:"none",borderRadius:999,padding:"12px 24px",fontSize:"0.875rem",fontWeight:600,background:T.secondary,color:"white",cursor:"pointer",boxShadow:T.shadowMd,transition:"transform .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>Find care</button>
                  <button style={{ border:`1px solid ${T.primary}`,borderRadius:999,padding:"12px 24px",fontSize:"0.875rem",fontWeight:600,background:"white",color:T.primary,cursor:"pointer",transition:"background .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=T.primary50}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>Meet &amp; greet</button>
                </div>
                <div style={{ marginTop:40, display:"flex", flexWrap:"wrap", gap:"16px 32px", borderTop:`1px solid ${T.border}`, paddingTop:24, fontSize:"0.875rem", fontWeight:500, color:T.textSec }}>
                  <span>92+ verified providers</span>
                  <span>90% to animal rescue</span>
                  <span>EUR 2,000 guarantee</span>
                </div>
              </div>

              <div style={{ position:"relative", zIndex:10, height:"clamp(340px, 50vw, 620px)" }} className="fade-up fade-up-d2">
                <div style={{
                  position:"absolute", right:0, top:0, width:"86%", height:"76%",
                  borderRadius:28, overflow:"hidden", background:T.primary100, boxShadow:T.shadowLg
                }}>
                  <img src="https://raw.githubusercontent.com/paleofoundation/Cats/main/assets/hero_cats_v2.jpg"
                    alt="Rescue cats at sanctuary" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                </div>
                <div style={{
                  position:"absolute", bottom:32, left:0, maxWidth:340,
                  borderRadius:24, border:`1px solid ${T.border}`, background:"white", padding:24, boxShadow:T.shadowLg
                }}>
                  <div style={{ ...display, fontSize:"clamp(1.5rem, 3vw, 1.875rem)", lineHeight:1, color:T.primary }}>every booking helps</div>
                  <div style={{ marginTop:12, height:6, width:112, background:T.secondary, borderRadius:3 }}/>
                  <p style={{ marginTop:16, fontSize:"0.875rem", lineHeight:1.8, color:T.textSec }}>
                    Right now: food, litter, and vet care for more than 100 cats at Patch of Heaven.
                  </p>
                  <button style={{
                    marginTop:20, border:`1px solid ${T.secondary}`, borderRadius:999,
                    padding:"8px 16px", fontSize:"0.75rem", fontWeight:700,
                    textTransform:"uppercase", letterSpacing:"0.08em", color:T.secondary,
                    background:"white", cursor:"pointer"
                  }}>Learn more</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ STATS BAND ═══ */}
        <section style={{ background:T.primary, color:"white" }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ display:"grid", gap:24 }} className="md-grid-4">
              {STATS.map(([val,label]) => (
                <div key={label} style={{ borderTop:"1px solid rgba(255,255,255,0.2)", paddingTop:20 }}>
                  <div style={{ ...display, fontSize:"clamp(2rem, 5vw, 3rem)" }}>{val}</div>
                  <div style={{ marginTop:8, fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,0.72)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="findcare" style={{ background:"white" }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ display:"grid", gap:48, alignItems:"center" }} className="lg-split">
              <div>
                <div style={{ ...eyebrow, color:T.primary }}>How it works</div>
                <h2 style={{ ...display, marginTop:16, fontSize:"clamp(2rem, 6vw, 3.75rem)" }}>
                  book trusted pet care<br/>
                  <span style={{ color:T.secondary }}>in three simple steps</span>
                </h2>
              </div>
              <div style={{ display:"grid", gap:16 }} className="md-grid-3">
                {HOW_IT_WORKS.map(([num,title,body]) => (
                  <div key={num} className="hover-lift" style={{ borderRadius:22, border:`1px solid ${T.border}`, background:"white", padding:24, boxShadow:T.shadowSm }}>
                    <div style={{ ...display, fontSize:"1.875rem", lineHeight:1, color:T.primary }}>{num}</div>
                    <div style={{ marginTop:12, fontSize:"1.125rem", fontWeight:700 }}>{title}</div>
                    <p style={{ marginTop:12, fontSize:"0.875rem", lineHeight:1.8, color:T.textSec }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROVIDERS ═══ */}
        <section id="providers" className="soft-noise" style={{ background:T.primary50 }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ display:"grid", gap:48, alignItems:"end" }} className="lg-split-r">
              <div>
                <div style={{ ...eyebrow, color:T.secondary }}>Verified providers</div>
                <h2 style={{ ...display, marginTop:16, fontSize:"clamp(2rem, 6vw, 3.75rem)" }}>
                  trusted by pet owners<br/>
                  <span style={{ color:T.primary }}>across Cyprus</span>
                </h2>
                <p style={{ marginTop:20, maxWidth:480, fontSize:"1rem", lineHeight:1.8, color:T.textSec }}>
                  Verified carers with real reviews. A cleaner, more editorial, more credible marketplace structure.
                </p>
              </div>
              <div style={{ display:"grid", gap:20 }} className="md-grid-2">
                {PROVIDERS.map((p,i) => (
                  <div key={p.name} className={`hover-lift fade-up fade-up-d${i+1}`} style={{ overflow:"hidden", border:`1px solid ${T.border}`, background:"white", boxShadow:T.shadowSm }}>
                    <div style={{ height:224, overflow:"hidden" }}>
                      <img src={p.image} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s" }}
                        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
                    </div>
                    <div style={{ padding:20 }}>
                      <div style={{ ...display, fontSize:"1.375rem", lineHeight:1.05, color:T.primary }}>{p.name}</div>
                      <div style={{ marginTop:8, fontSize:"0.875rem", fontWeight:500, color:T.textSec }}>{p.rating}</div>
                      <div style={{ marginTop:4, fontSize:"0.875rem", color:T.textMuted }}>{p.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ADOPTABLES ═══ */}
        <section id="adopt" style={{ background:"white" }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ ...eyebrow, color:T.primary }}>Tinies looking for homes</div>
            <h2 style={{ ...display, marginTop:16, fontSize:"clamp(2rem, 6vw, 3.75rem)" }}>
              adopt a rescue animal<br/>
              <span style={{ color:T.secondary }}>and give them a forever home</span>
            </h2>
            <div style={{ marginTop:48, display:"grid", gap:20 }} className="md-grid-2 xl-grid-4">
              {ADOPTABLES.map((a,i) => (
                <div key={a.name} className={`hover-lift fade-up fade-up-d${i+1}`} style={{ overflow:"hidden", border:`1px solid ${T.border}`, background:"white", boxShadow:T.shadowSm }}>
                  <div style={{ height:256, overflow:"hidden" }}>
                    <img src={a.image} alt={a.name} style={{ width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s" }}
                      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
                  </div>
                  <div style={{ padding:20 }}>
                    <div style={{ ...display, fontSize:"1.375rem", lineHeight:1.05 }}>{a.name}</div>
                    <div style={{ marginTop:8, fontSize:"0.875rem", fontWeight:500, color:T.primary }}>{a.meta}</div>
                    <p style={{ marginTop:12, fontSize:"0.875rem", lineHeight:1.8, color:T.textSec }}>{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY DIFFERENT ═══ */}
        <section style={{ background:T.primary, color:"white" }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ display:"grid", gap:56 }} className="lg-split-why">
              <div>
                <div style={{ ...eyebrow, color:"rgba(255,255,255,0.75)" }}>Why Tinies is different</div>
                <h2 style={{ ...display, marginTop:12, fontSize:"clamp(2rem, 6vw, 3.75rem)", maxWidth:480 }}>
                  a rescue operation<br/>
                  <span style={{ color:"rgba(255,255,255,0.8)" }}>running a marketplace</span>
                </h2>
              </div>
              <div style={{ display:"grid", gap:16 }} className="md-grid-3">
                {WHY_DIFFERENT.map(([title,body]) => (
                  <div key={title} style={{
                    borderRadius:24, background:"rgba(255,255,255,0.08)", padding:24,
                    border:"1px solid rgba(255,255,255,0.15)", backdropFilter:"blur(4px)"
                  }}>
                    <div style={{ ...display, fontSize:"1.375rem", lineHeight:1.05 }}>{title}</div>
                    <p style={{ marginTop:16, fontSize:"0.875rem", lineHeight:1.8, color:"rgba(255,255,255,0.78)" }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ GIVING / SANCTUARY ═══ */}
        <section id="giving" style={{ background:"white" }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ display:"grid", gap:48, alignItems:"center" }} className="lg-split-giving">
              {/* image composition */}
              <div style={{ position:"relative", height:"clamp(320px, 40vw, 520px)" }}>
                <div style={{ position:"absolute",right:32,top:0,width:"74%",height:"88%",background:"rgba(244,93,72,0.12)" }}/>
                <div style={{ position:"absolute",bottom:0,right:0,width:"80%",height:"84%",borderRadius:24,overflow:"hidden",boxShadow:T.shadowLg }}>
                  <img src="https://nwjuktwclfdkfxrjhwhq.supabase.co/storage/v1/object/public/site-images/page/page-homepage-sanctuary.jpg"
                    alt="Cat at sanctuary" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                </div>
                <div style={{
                  position:"absolute",left:0,bottom:48,maxWidth:340,borderRadius:24,
                  border:`1px solid ${T.border}`,background:"white",padding:24,boxShadow:T.shadowLg
                }}>
                  <div style={{ ...display, fontSize:"clamp(1.5rem, 3vw, 1.875rem)", lineHeight:1, color:T.primary }}>this is where it started</div>
                  <div style={{ marginTop:12, height:6, width:96, background:T.secondary, borderRadius:3 }}/>
                  <p style={{ marginTop:16, fontSize:"0.875rem", lineHeight:1.8, color:T.textSec }}>
                    Ninety-two cats. One sanctuary. Every booking helps keep that story moving in the right direction.
                  </p>
                </div>
              </div>

              <div>
                <div style={{ ...eyebrow, color:T.primary }}>Giving</div>
                <h2 style={{ ...display, marginTop:16, fontSize:"clamp(2rem, 6vw, 3.75rem)" }}>
                  join tinies guardians<br/>
                  <span style={{ color:T.secondary }}>supporting rescue animals every month</span>
                </h2>
                <p style={{ marginTop:20, maxWidth:480, fontSize:"1rem", lineHeight:1.8, color:T.textSec }}>
                  Starting from EUR 3 per month, with 100% going to the sanctuary you choose.
                </p>
                <div style={{ marginTop:32, display:"flex", flexWrap:"wrap", gap:16 }}>
                  <button style={{ border:"none",borderRadius:999,padding:"12px 24px",fontSize:"0.875rem",fontWeight:600,background:T.secondary,color:"white",cursor:"pointer",boxShadow:T.shadowMd }}>Become a Guardian</button>
                  <button style={{ border:`1px solid ${T.primary}`,borderRadius:999,padding:"12px 24px",fontSize:"0.875rem",fontWeight:600,background:"white",color:T.primary,cursor:"pointer" }}>Support the sanctuary</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section style={{ background:T.secondary, color:"white" }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ display:"grid", gap:48 }} className="lg-split-test">
              <div>
                <div style={{ ...eyebrow, color:"rgba(255,255,255,0.75)" }}>What pet owners are saying</div>
                <h2 style={{ ...display, marginTop:16, fontSize:"clamp(2rem, 6vw, 3.75rem)" }}>people love tinies</h2>
              </div>
              <div style={{ display:"grid", gap:16 }} className="md-grid-2">
                {TESTIMONIALS.map((t,i) => (
                  <div key={i} style={{
                    border:"1px solid rgba(255,255,255,0.18)", background:"rgba(255,255,255,0.08)",
                    padding:24, backdropFilter:"blur(4px)"
                  }}>
                    <p style={{ fontSize:"0.875rem", lineHeight:1.8, color:"rgba(255,255,255,0.92)" }}>"{t.quote}"</p>
                    <div style={{ marginTop:20, fontSize:"0.75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"rgba(255,255,255,0.72)" }}>{t.meta}</div>
                    <div style={{ marginTop:4, fontSize:"0.75rem", color:"rgba(255,255,255,0.58)" }}>{t.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SEEN ON ═══ */}
        <section style={{ borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, background:"rgba(241,249,249,0.6)" }}>
          <div style={{ ...container, paddingBlock:"clamp(2.5rem, 4vw, 3rem)" }}>
            <div style={{ display:"grid", gap:24, alignItems:"center" }} className="lg-split-press">
              <div>
                <div style={{ ...eyebrow, color:T.primary }}>Seen on</div>
                <p style={{ marginTop:8, fontSize:"0.875rem", lineHeight:1.8, color:T.textSec }}>
                  Press credibility, awards, and coverage as Tinies grows.
                </p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:12 }}>
                {SEEN_ON.map(name => (
                  <div key={name} style={{
                    display:"flex", alignItems:"center", justifyContent:"center", minHeight:72,
                    borderRadius:18, border:`1px solid ${T.border}`, background:"white", padding:"16px 12px"
                  }}>
                    <span style={{ ...display, fontSize:"clamp(1rem, 2vw, 1.25rem)", letterSpacing:"-0.03em", color:T.text }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" style={{ background:"white" }}>
          <div style={{ ...container, ...sectionPad }}>
            <div style={{ display:"grid", gap:48 }} className="lg-split-faq">
              <div>
                <div style={{ ...eyebrow, color:T.primary }}>Common questions</div>
                <h2 style={{ ...display, marginTop:16, fontSize:"clamp(2rem, 6vw, 3.75rem)" }}>
                  the practical details<br/>
                  <span style={{ color:T.secondary }}>still need to feel elegant</span>
                </h2>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {FAQS.map((f,i) => (
                  <div key={i}
                    style={{
                      borderRadius:22, border:`1px solid ${T.border}`, background:"white",
                      padding:24, boxShadow:T.shadowSm, cursor:"pointer", transition:"box-shadow .2s"
                    }}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = T.shadowMd}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = T.shadowSm}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:"1.125rem", fontWeight:700 }}>{f.q}</div>
                      <span style={{
                        fontSize:"1.5rem", color:T.primary, transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                        transition:"transform .2s", flexShrink:0, marginLeft:16
                      }}>+</span>
                    </div>
                    {openFaq === i && (
                      <p style={{ marginTop:12, fontSize:"0.875rem", lineHeight:1.8, color:T.textSec }}>{f.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop:`1px solid ${T.border}`, background:"white" }}>
        <div style={{ ...container, paddingBlock:40 }}>
          <div style={{ display:"grid", gap:32, gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))" }}>
            <div>
              <div style={{ ...eyebrow, color:T.primary }}>Tinies</div>
              <p style={{ marginTop:12, maxWidth:280, fontSize:"0.875rem", lineHeight:1.8, color:T.textSec }}>
                Book a walk. Help a tiny. Trusted pet care and rescue adoption in Cyprus.
              </p>
              <div style={{ marginTop:20, display:"flex", gap:12 }}>
                {SOCIALS.map(s => (
                  <a key={s.name} href="#" aria-label={s.name} style={{
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    width:44, height:44, borderRadius:"50%",
                    border:`1px solid ${T.border}`, color:T.primary,
                    transition:"all .2s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.background = T.primary50; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}
                  >{s.icon}</a>
                ))}
              </div>
            </div>
            {[
              { title:"For Pet Owners", links:["Find Care","How It Works","Adopt","Tinies Who Made It"] },
              { title:"For Providers", links:["Become a Provider","How It Works"] },
              { title:"For Rescues", links:["List Your Animals","For Rescues","Our rescue partners"] },
              { title:"Company", links:["About","Blog","FAQ","Contact","Terms","Privacy"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize:"0.875rem", fontWeight:700 }}>{col.title}</div>
                <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontSize:"0.875rem", color:T.textSec, transition:"color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = T.text}
                      onMouseLeave={e => e.currentTarget.style.color = T.textSec}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:40, paddingTop:24, borderTop:`1px solid ${T.border}`, fontSize:"0.75rem", color:T.textMuted, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <span>&copy; 2026 Tinies. All rights reserved.</span>
            <span>Designed with care in Cyprus.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

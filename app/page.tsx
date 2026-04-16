'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-img">
            <img src="https://www.aeon-academy.com/_next/image?url=%2Fuploads%2Flogo.jpeg&w=96&q=75" alt="AEON" />
          </div>
          <span className="nav-logo-name">AEON.Academy</span>
        </div>
        <div className="nav-links">
          <button className="nav-a">Features</button>
          <button className="nav-a">About</button>
          <button className="nav-a">Testimonials</button>
          <Link href="/library" className="nav-a">Library</Link>
          <Link href="/teacher" className="nav-a">Teachers</Link>
        </div>
        <div className="nav-right">
          <Link href="/donate" className="nav-plain">Donate</Link>
          <Link href="/login" className="nav-plain">Login</Link>
          <Link href="/signup" className="nav-btn">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-l">
          <div className="hero-l-inner">
            <h1 className="hero-h1">AEON, Revolutionizing Education Accessibility and Efficiency, Together.</h1>
            <p className="hero-p">We connect passionate students with expert teachers through simple booking of one on one seamless authentic connection.</p>
            <div className="hero-btns">
              <Link href="/login" className="btn-sff">Start for Free</Link>
              <Link href="/library" className="btn-er">Explore Resources</Link>
            </div>
          </div>
        </div>
        <div className="hero-r">
          <img src="https://www.aeon-academy.com/_next/image?url=%2Fuploads%2FHero.JPG&w=1080&q=75" alt="AEON Academy" />
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat"><div className="stat-n">50K+</div><div className="stat-l">Active Users</div></div>
        <div className="stat"><div className="stat-n">200+</div><div className="stat-l">Verified Professionals</div></div>
        <div className="stat"><div className="stat-n">98%</div><div className="stat-l">Satisfaction Rate</div></div>
      </div>

      {/* TEACHER BAND */}
      <section className="teacher-band">
        <div>
          <div className="tb-eyebrow">For Teachers</div>
          <h2 className="tb-h2">Start Your Teaching Journey</h2>
          <p className="tb-p">Watch this quick tutorial to learn how to sign up, create your profile, and begin teaching on AEON Academy.</p>
          <div className="tb-yt">Having trouble? <a href="https://www.youtube.com/watch?v=g658Rygj9MU" target="_blank">Watch on YouTube</a></div>
        </div>
        <div className="vid-box">
          <iframe src="https://www.youtube.com/embed/g658Rygj9MU?rel=0&modestbranding=1" title="Teacher Sign Up Tutorial" allowFullScreen></iframe>
        </div>
      </section>

      {/* WHY AEON */}
      <section>
        <div className="why-wrap">
          <div className="sec-eyebrow">Why AEON?</div>
          <h2 className="sec-h2">Breaking down barriers to quality education through personalized, boundary-free learning.</h2>
          <div className="why-grid">
            <div>
              <div className="why-num">1</div>
              <div className="why-title">Personalized Learning Paths</div>
              <div className="why-body">Education tailored to your unique goals, learning style, and pace. No more one-size-fits-all approaches that leave students behind.</div>
            </div>
            <div>
              <div className="why-num">2</div>
              <div className="why-title">Direct Expert Connection</div>
              <div className="why-body">Learn one-on-one from verified experts. Get mentorship, guidance, and real-world insights from professionals passionate about teaching.</div>
            </div>
            <div>
              <div className="why-num">3</div>
              <div className="why-title">Boundless Education</div>
              <div className="why-body">Access quality learning regardless of location, socioeconomic status, or background. Break free from barriers that limit educational opportunities.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="feat-head">
          <div className="sec-eyebrow" style={{textAlign:'center'}}>Our Core Features</div>
          <h2 className="sec-h2" style={{textAlign:'center',margin:'0 auto'}}>Learn from Experts, Access Resources Anywhere</h2>
        </div>
        <div className="feat-row">
          <div className="feat-img">
            <img src="https://www.aeon-academy.com/_next/image?url=%2Fuploads%2Ffeatures_image_1.jpeg&w=3840&q=75" alt="Book sessions" />
          </div>
          <div className="feat-cnt">
            <h3 className="feat-h3">Book live Sessions with experts</h3>
            <p className="feat-p">Find and schedule one-on-one video sessions with verified experts in your field. Browse professionals, view their specialties and availability, and book personalized mentoring sessions.</p>
            <Link href="/login" className="feat-link">Find &amp; Book Experts →</Link>
          </div>
        </div>
        <div className="feat-row rev">
          <div className="feat-img">
            <img src="https://www.aeon-academy.com/_next/image?url=%2Fuploads%2Ffeatures_image_2.jpeg&w=3840&q=75" alt="Library" />
          </div>
          <div className="feat-cnt">
            <h3 className="feat-h3">Digital Learning Library</h3>
            <p className="feat-p">Access our comprehensive digital library with curated educational videos, articles, and interactive resources. Learn at your own pace with expert-created content.</p>
            <Link href="/library" className="feat-link">Explore Library →</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="test-wrap">
        <div style={{textAlign:'center'}}>
          <div className="sec-eyebrow" style={{display:'inline-block'}}>What Our Community Says</div>
          <h2 className="sec-h2" style={{textAlign:'center',margin:'.6rem auto 0',maxWidth:'520px'}}>Stories from students who leveled up their fluency through AEON.</h2>
        </div>
        <div className="test-grid">
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <div className="test-q">"AEON completely changed how I approach learning English. My teacher is incredibly patient and the sessions are so practical. I went from struggling to holding full business conversations in just 3 months."</div>
            <div className="test-auth"><div className="test-av">AM</div><div><div className="test-name">Amira Mansouri</div><div className="test-role">English Student · Algeria</div></div></div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <div className="test-q">"The booking system is simple and the teachers are genuinely verified professionals. I booked my first session in minutes and haven't looked back."</div>
            <div className="test-auth"><div className="test-av">KT</div><div><div className="test-name">Kwame Tetteh</div><div className="test-role">Spanish Student · Ghana</div></div></div>
          </div>
          <div className="test-card">
            <div className="test-stars">★★★★★</div>
            <div className="test-q">"As a refugee, access to quality education felt impossible. AEON gave me a certified teacher, flexible hours, and most importantly — hope. I'm now pursuing my degree in Germany."</div>
            <div className="test-auth"><div className="test-av">LH</div><div><div className="test-name">Layla Hassan</div><div className="test-role">German Student · Afghanistan</div></div></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <div className="footer-brand-img"><img src="https://www.aeon-academy.com/_next/image?url=%2Fuploads%2Flogo.jpeg&w=96&q=75" alt="AEON" /></div>
              <span className="footer-brand-name">AEON.Academy</span>
            </div>
            <div className="footer-desc">Revolutionizing education accessibility for learners worldwide. Connecting students with expert teachers through seamless, boundary-free learning.</div>
          </div>
          <div>
            <div className="f-col-title">Platform</div>
            <ul className="f-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">Success Stories</a></li>
              <li><Link href="/library">Education Hub</Link></li>
            </ul>
          </div>
          <div>
            <div className="f-col-title">Get Started</div>
            <ul className="f-links">
              <li><Link href="/login">Sign In</Link></li>
              <li><Link href="/signup">Sign Up</Link></li>
              <li><Link href="/teacher">Teachers</Link></li>
              <li><Link href="/donate">Donate</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <div className="footer-copy">© 2024 AEON.Academy. All rights reserved.</div>
          <div className="footer-copy">Revolutionizing education, one connection at a time.</div>
        </div>
      </footer>
    </>
  );
}
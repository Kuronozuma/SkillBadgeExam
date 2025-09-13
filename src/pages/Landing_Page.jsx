import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/pages/landing page.css';


export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <header className="header">
        <nav>
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <h2>Stock Smarter. Sell Faster. Vape Better.</h2>
        <p>
          Monitor top-selling juices, manage stock effortlessly, and connect better
          with customers & distributors — everything you need in one place.
        </p>
        <div>
          <button className="btn btn-primary">Get Started</button>
          <button className="btn btn-outline">Learn More</button>
        </div>
      </section>

      <footer className="footer">
        © 2025 Inventory App. All rights reserved.
      </footer>
    </div>
  );
}

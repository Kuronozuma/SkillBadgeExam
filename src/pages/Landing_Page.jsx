import React from "react";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <header className="header">
        <h1>Inventory App</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="dashboard.html" className="btn btn-primary">Login</a>
        </nav>
      </header>

      <section className="hero">
        <h2>Manage Your Inventory with Ease</h2>
        <p>
          Track your products, monitor top performing items, and manage
          customers & distributors seamlessly — all in one powerful dashboard.
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

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Simple page components
const Home = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#3B82F6', marginBottom: '20px' }}>Web Scraper Dashboard</h1>
    <p>Welcome to the Web Scraper as a Service application.</p>
    <div style={{ marginTop: '20px' }}>
      <Link to="/scrapers" style={{ 
        backgroundColor: '#3B82F6', 
        color: 'white', 
        padding: '10px 15px',
        borderRadius: '5px',
        textDecoration: 'none',
        marginRight: '10px'
      }}>
        View Scrapers
      </Link>
      <Link to="/about" style={{ 
        backgroundColor: '#10B981', 
        color: 'white', 
        padding: '10px 15px',
        borderRadius: '5px',
        textDecoration: 'none'
      }}>
        About
      </Link>
    </div>
  </div>
);

const ScrapersList = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#3B82F6', marginBottom: '20px' }}>Scrapers List</h1>
    <p>This page would normally display your scrapers.</p>
    <Link to="/" style={{ 
      display: 'inline-block',
      marginTop: '20px',
      color: '#3B82F6',
      textDecoration: 'none'
    }}>
      Back to Home
    </Link>
  </div>
);

const About = () => (
  <div style={{ padding: '20px' }}>
    <h1 style={{ color: '#3B82F6', marginBottom: '20px' }}>About</h1>
    <p>Web Scraper as a Service is a platform that allows you to create and manage web scrapers.</p>
    <Link to="/" style={{ 
      display: 'inline-block',
      marginTop: '20px',
      color: '#3B82F6',
      textDecoration: 'none'
    }}>
      Back to Home
    </Link>
  </div>
);

function SimpleApp() {
  return (
    <Router>
      <div style={{ 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scrapers" element={<ScrapersList />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default SimpleApp;

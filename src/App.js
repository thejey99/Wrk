import React, { useState } from 'react';
import './App.css';

// You can define your components here or import them
const ProgramCard = () => (
  <div className="program-card">
    <h2>GZCLP</h2>
    <p className="author">by Cody LeFever</p>
    <p className="description">
      GZCLP is a highly effective and popular linear progression program for beginners.
    </p>
    <button className="action-button">Start Program</button>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('My Programs');
  const navItems = ['Discover', 'My Programs', 'Workout', 'Create', 'Settings'];
  const mainNavItems = ['Programs', 'Workout', 'Create', 'Settings'];


  return (
    <div className="app-container">
      <header className="header">
        <h1>{activeTab}</h1>
        {activeTab === 'My Programs' && (
           <div className="tabs">
            <button className="tab active">Active</button>
            <button className="tab">Completed</button>
          </div>
        )}
      </header>

      <main className="main-content">
        {activeTab === 'My Programs' && <ProgramCard />}
        {activeTab === 'Workout' && (
          <div>
            <h2>Workout</h2>
            <p>No active program selected.</p>
            <p>Go to "Programs" to select one.</p>
          </div>
        )}
        {/* Add content for other tabs here */}
      </main>

      <nav className="nav-bar">
        {mainNavItems.map((item) => (
          <button key={item} className="nav-item" onClick={() => setActiveTab(item)}>
            {/* You would typically use icons here */}
            <span>{item}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;

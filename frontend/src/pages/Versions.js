import React from 'react';
import useLocalStorage from 'use-local-storage';
import '../style/Versions.css';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { versionUpdates } from '../data/versionData';

const Versions = () => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  return (
    <div className='versions-page' data-theme={isDark ? "dark" : "light"}>
      <Logo 
        isChecked={isDark}
        handleChange={() => setIsDark(!isDark)}
        noNav={true}
      />
      <div className='versions-body'>
        <h1>גירסאות:</h1>
        {versionUpdates.map(({ version, date, updates }) => (
          <div key={version} className='version-entry'>
            <h2>{`גירסה ${version}`}</h2>
            <p>{date}</p>
            <ul>
              {updates.map((update, index) => (
                <li key={index}>{update}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Versions;

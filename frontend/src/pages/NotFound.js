import React from 'react';
import '../App.css';
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';

const NotFound = () => {

  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
  return (
      <div className='notfound' data-theme={isDark ? "dark" : "light"}>
        <Logo 
          isChecked={isDark}
          handleChange={() => setIsDark(!isDark)}
          noNav={true}
        />
        <h1>דף לא קיים!</h1>
      </div>
  );
}

export default NotFound;
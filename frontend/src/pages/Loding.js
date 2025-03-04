import React from 'react';
import '../style/Loding.css';
import useLocalStorage from 'use-local-storage';

const Loding = () => {

  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark] = useLocalStorage("darkMode", preference);

  return (
      <div className='content-seketon' data-theme={isDark ? "dark" : "light"}>
        <div className='skeleton-loader-title'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader-title'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader-title'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader-title'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader-title'></div>
        <div className='skeleton-loader'></div>
        <div className='skeleton-loader'></div>
      </div>
  );
}

export default Loding;
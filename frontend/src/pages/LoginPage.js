import React from 'react';
import useLocalStorage from 'use-local-storage';
import '../style/LoginPage.css';
import { Login } from '../components/Login';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {

  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  const {auth} = useAuth();

  return (
      <div className='LoginPage' data-theme={isDark ? "dark" : "light"}>
        <Logo 
            isChecked={isDark}
            handleChange={() => setIsDark(!isDark)}   
            auth={auth}
        />
        <div className='login-body'>
            <Login />
        </div>
        <Footer />
      </div>
  );
}

export default LoginPage;
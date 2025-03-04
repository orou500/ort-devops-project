import React, { useEffect, useState } from 'react';
import '../style/LeaguesPage.css';
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';
import { PulseLoader } from 'react-spinners';
import axios from '../api/axios';
import { Footer } from '../components/Footer';
import { LeagueCard } from '../components/LeagueCard';

const LeaguesPage = () => {

  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);


  const { auth } = useAuth();
  const [leagues, setLeagues] = useState()
  const [leaguesLength, setLeaguesLength] = useState(0)
  const [isLoding, setIsLoding] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(3);


  useEffect( () => {
    const controller = new AbortController();
    setIsLoding(true)
    const token = localStorage.getItem('token');

    const getUsers = async () => {
        try {
            await axios.get('/leagues', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `${token}`,
                  },
                signal: controller.signal,
            }).then((res) => {
              setPostsPerPage(3)
              setIsLoding(false)
              setLeagues(res.data)
            })
        } catch (err) {
            if(err.response){
              setIsLoding(false)
              setErrMsg('אין ליגות!')
            }
        }
      }

      if(token) {
        getUsers();
      } else {
        setIsLoding(false)
        setErrMsg('משתמש לא תקין!')
      }
    return () => {
        controller.abort()
    }
},[])

  useEffect(() => {
    if(leagues){
      setLeaguesLength(leagues.length)
      setErrMsg('אין ליגות!')
    }
  }, [leagues])
  
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  var currentLeagues = [];
  if(leagues){
    currentLeagues = leagues.slice(firstPostIndex, lastPostIndex);
  }

  return (
      <div className='leagues-page' data-theme={isDark ? "dark" : "light"}>
        <Logo 
        isChecked={isDark}
        handleChange={() => setIsDark(!isDark)}
        auth={auth}
        />
        <div className='leagues-page-body'>
          <h1>כל הליגות:</h1>
          <div className='leagues-continer'>
            {undefined !== leagues && leagues.length && !isLoding? (
              currentLeagues.map((league, i) => {
                      return (
                        <LeagueCard league={league} key={i} currentLeagues={currentLeagues}  leagues={leagues} setLeagues={setLeagues}/>
                      )
              })
              ) : errMsg ? (
              <p>{errMsg}</p>
              ) : (
                  <PulseLoader color="var(--foreground-color)"/>
              )
            }
            {
              leaguesLength > postsPerPage ? 
              <Pagination
                totalPosts={leaguesLength}
                postsPerPage={postsPerPage}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
              />
              :
              <></>
            }      
          </div>
        </div>
        <Footer />
      </div>
  );
}

export default LeaguesPage;
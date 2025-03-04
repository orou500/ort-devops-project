import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import './index.css';
import reportWebVitals from './reportWebVitals';
import collection from 'easter-egg-collection'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthProvider';
import RequireAuth from './components/RequireAuth';
import Loding from './pages/Loding';
import { ToastProvider } from './context/ToastContext';
const NotFound = lazy(() => import('./pages/NotFound'));
const App = lazy(() => import('./App'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CreateLeague = lazy(() => import('./pages/CreateLeague'));
const Leagues = lazy(() => import('./pages/LeaguesPage'));
const LeagueDetailsPage = lazy(() => import('./pages/LeagueDetailsPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const EditLeague = lazy(() => import('./pages/EditLeague'));
const CreateTournament = lazy(() => import('./pages/CreateTournament'));
const TournamentDetailsPage = lazy(() => import('./pages/TournamentDetailsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Verify = lazy(() => import('./pages/Verify'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CreateTournamentV2 = lazy(() => import('./pages/CreateTournamentV2'));
const CreateFakeUserPage = lazy(() => import('./pages/CreateFakeUserPage'));
const Versions = lazy(() => import('./pages/Versions'));

disableReactDevTools();
var newcollection = collection;
newcollection === collection ? newcollection = collection : newcollection = collection;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
        <ToastProvider>
            <AuthProvider>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route element={<RequireAuth />}>
                  {/* V Protected Routs V */}
                  <Route path='/createleague' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <CreateLeague />
                          </Suspense>
                        } 
                      />
                  <Route path='/:LeaguesSlug/createtournament' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <CreateTournament />
                          </Suspense>
                        } 
                      />
                  <Route path='/:LeaguesSlug/createfakeuser' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <CreateFakeUserPage />
                          </Suspense>
                        } 
                      />
                  <Route path='/:LeaguesSlug/createknockoutbracket' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <CreateTournamentV2 />
                          </Suspense>
                        } 
                      />
                  <Route path='/leagues' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <Leagues />
                          </Suspense>
                        } 
                      />
                  <Route path='/leagues/:slug' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <LeagueDetailsPage />
                          </Suspense>
                        } 
                      />
                  <Route path='/users/:userId' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <UserProfilePage />
                          </Suspense>
                        } 
                      />
                  <Route path='/profile' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <ProfilePage />
                          </Suspense>
                        } 
                      />
                  <Route path='/profile/edit' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <EditProfilePage />
                          </Suspense>
                        } 
                      />
                  <Route path='edit/leagues/:slug' 
                    element={
                          <Suspense fallback={<Loding />}>
                            <EditLeague />
                          </Suspense>
                        } 
                      />
                  <Route path="/leagues/:leagueSlug/tournaments/:tournamentSlug"
                    element={
                          <Suspense fallback={<Loding />}>
                            <TournamentDetailsPage />
                          </Suspense>
                        } 
                      />
                  {/*  ^Protected Routs^ */}
                  </Route>
                  <Route path='/' 
                    element={
                      <Suspense fallback={<Loding />}>
                        <App />
                      </Suspense>
                    } 
                  />
                  <Route path='/login' 
                    element={
                      <Suspense fallback={<Loding />}>
                        <LoginPage />
                      </Suspense>
                    } 
                  />
                  <Route path='/user/verify/:id' 
                    element={
                      <Suspense fallback={<Loding />}>
                        <Verify />
                      </Suspense>
                    } 
                  />
                  <Route path='/reset-password/:token' 
                    element={
                      <Suspense fallback={<Loding />}>
                        <ResetPassword />
                      </Suspense>
                    } 
                  />
                  <Route path='/terms-of-service' 
                    element={
                      <Suspense fallback={<Loding />}>
                        <TermsOfService />
                      </Suspense>
                    } 
                  />
                  <Route path='/versions' 
                    element={
                      <Suspense fallback={<Loding />}>
                        <Versions />
                      </Suspense>
                    } 
                  />
                  <Route path="*"
                    element={
                      <Suspense fallback={<Loding />}>
                        <NotFound />
                      </Suspense>
                    } 
                  />
                </Routes>
              </AnimatePresence>
            </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

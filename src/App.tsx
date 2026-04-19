import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initStore, isOnboarded } from './data/store';
import { LangProvider } from './i18n/useT';

import { SplashPage }       from './pages/SplashPage';
import { LoginPage }        from './pages/LoginPage';
import { SignupPage }       from './pages/SignupPage';
import { HomePage }         from './pages/HomePage';
import { JobsPage }         from './pages/JobsPage';
import { JobDetailPage }    from './pages/JobDetailPage';
import { ApplyPage }        from './pages/ApplyPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { CommunityPage }    from './pages/CommunityPage';
import { MembersPage }      from './pages/MembersPage';
import { PostDetailPage }   from './pages/PostDetailPage';
import { ComposePage }      from './pages/ComposePage';
import { ProfilePage }      from './pages/ProfilePage';
import { ProfileEditPage }  from './pages/ProfileEditPage';
import { CommunityJoinPage } from './pages/CommunityJoinPage';

function RequireOnboard({ children }: { children: React.ReactNode }) {
  return isOnboarded() ? <>{children}</> : <Navigate to="/login" replace />;
}

export function App() {
  useEffect(() => { initStore(); }, []);

  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          {/* Splash */}
          <Route path="/"       element={<SplashPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboard" element={<Navigate to="/login" replace />} />

          <Route path="/home"         element={<RequireOnboard><HomePage /></RequireOnboard>} />
          <Route path="/jobs"         element={<RequireOnboard><JobsPage /></RequireOnboard>} />
          <Route path="/jobs/:id"     element={<RequireOnboard><JobDetailPage /></RequireOnboard>} />
          <Route path="/apply/:id"    element={<RequireOnboard><ApplyPage /></RequireOnboard>} />
          <Route path="/applications" element={<RequireOnboard><ApplicationsPage /></RequireOnboard>} />

          <Route path="/community"            element={<RequireOnboard><CommunityPage /></RequireOnboard>} />
          <Route path="/community/members"    element={<RequireOnboard><MembersPage /></RequireOnboard>} />
          <Route path="/community/post/:id"   element={<RequireOnboard><PostDetailPage /></RequireOnboard>} />
          <Route path="/community/compose"    element={<RequireOnboard><ComposePage /></RequireOnboard>} />
          <Route path="/community/join/:id"   element={<RequireOnboard><CommunityJoinPage /></RequireOnboard>} />

          <Route path="/profile"          element={<RequireOnboard><ProfilePage /></RequireOnboard>} />
          <Route path="/profile/:memberId" element={<RequireOnboard><ProfilePage /></RequireOnboard>} />
          <Route path="/profile/edit"     element={<RequireOnboard><ProfileEditPage /></RequireOnboard>} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}

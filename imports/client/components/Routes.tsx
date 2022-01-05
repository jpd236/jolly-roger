import React, { Suspense } from 'react';
import { Route, Switch } from 'react-router';
import { BreadcrumbsProvider } from '../hooks/breadcrumb';
import useDocumentTitle from '../hooks/use-document-title';
import AllProfileListPage from './AllProfileListPage';
import AuthenticatedRoute from './AuthenticatedRoute';
import EnrollForm from './EnrollForm';
import FirstUserForm from './FirstUserForm';
import HuntApp from './HuntApp';
import HuntListPage from './HuntListPage';
import Loading from './Loading';
import LoginForm from './LoginForm';
import PasswordResetForm from './PasswordResetForm';
import ProfilePage from './ProfilePage';
import RootRedirector from './RootRedirector';
import UnauthenticatedRoute from './UnauthenticatedRoute';

const SetupPage = React.lazy(() => import('./SetupPage'));
const RTCDebugPage = React.lazy(() => import('./RTCDebugPage'));

const Routes = React.memo(() => {
  useDocumentTitle('Jolly Roger');

  return (
    <BreadcrumbsProvider>
      <Suspense fallback={<Loading />}>
        <Switch>
          {/* Index redirect */}
          <Route exact path="/" render={() => <RootRedirector />} />

          {/* Authenticated routes - if user not logged in, get redirected to /login */}
          <AuthenticatedRoute path="/hunts/:huntId" render={() => <HuntApp />} />
          <AuthenticatedRoute path="/hunts" render={() => <HuntListPage />} />
          <AuthenticatedRoute path="/users/:userId" render={() => <ProfilePage />} />
          <AuthenticatedRoute path="/users" render={() => <AllProfileListPage />} />
          <AuthenticatedRoute path="/setup" render={() => <SetupPage />} />
          <AuthenticatedRoute path="/rtcdebug" render={() => <RTCDebugPage />} />

          {/* Unauthenticated routes - if user already logged in, get redirected to /hunts */}
          <UnauthenticatedRoute path="/login" render={() => <LoginForm />} />
          <UnauthenticatedRoute path="/reset-password/:token" render={() => <PasswordResetForm />} />
          <UnauthenticatedRoute path="/enroll/:token" render={() => <EnrollForm />} />
          <UnauthenticatedRoute path="/create-first-user" render={() => <FirstUserForm />} />
        </Switch>
      </Suspense>
    </BreadcrumbsProvider>
  );
});

export default Routes;

import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { apiService } from './services/api.service';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreateBusiness from './pages/CreateBusiness';
import BusinessDetails from './pages/BusinessDetails';
import BusinessOwnerDashboard from './pages/BusinessOwnerDashboard';
import GenerateCodes from './pages/GenerateCodes';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    // Set up logout callback for API service
    apiService.setLogoutCallback(() => {
      logout();
      // The redirect will happen automatically via the route guards
    });
  }, [logout]);

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'business_owner') return '/business-owner/dashboard';
    return '/login';
  };

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/landing">
            <Landing />
          </Route>
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to={getDefaultRoute()} /> : <Login />}
          </Route>
          <Route exact path="/admin/dashboard">
            {!isAuthenticated || user?.role !== 'admin' ? (
              <Redirect to="/login" />
            ) : (
              <AdminDashboard />
            )}
          </Route>
          <Route exact path="/admin/create-business">
            {!isAuthenticated || user?.role !== 'admin' ? (
              <Redirect to="/login" />
            ) : (
              <CreateBusiness />
            )}
          </Route>
          <Route exact path="/admin/businesses/:id">
            {!isAuthenticated || user?.role !== 'admin' ? (
              <Redirect to="/login" />
            ) : (
              <BusinessDetails />
            )}
          </Route>
          <Route exact path="/business-owner/dashboard">
            {!isAuthenticated || user?.role !== 'business_owner' ? (
              <Redirect to="/login" />
            ) : (
              <BusinessOwnerDashboard />
            )}
          </Route>
          <Route exact path="/business-owner/generate-codes">
            {!isAuthenticated || user?.role !== 'business_owner' ? (
              <Redirect to="/login" />
            ) : (
              <GenerateCodes />
            )}
          </Route>
          <Route exact path="/">
            <Redirect to="/landing" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;


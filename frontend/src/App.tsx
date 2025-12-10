import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { apiService } from './services/api.service';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Tabs from './pages/Tabs';
import CardDetail from './pages/CardDetail';
import BusinessDetail from './pages/BusinessDetail';
import ValidateCode from './pages/ValidateCode';
import RedeemCode from './pages/RedeemCode';
import TarjetasDisponibles from './pages/TarjetasDisponibles';
import MisTarjetas from './pages/MisTarjetas';

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
  const { isAuthenticated, hasCompletedOnboarding, logout } = useAuthStore();

  useEffect(() => {
    // Set up logout callback for API service
    apiService.setLogoutCallback(() => {
      logout();
      // The redirect will happen automatically via the route guards
    });
  }, [logout]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/onboarding">
            {hasCompletedOnboarding ? <Redirect to="/tabs/home" /> : <Onboarding />}
          </Route>
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/tabs/home" /> : <Login />}
          </Route>
          <Route exact path="/register">
            {isAuthenticated ? <Redirect to="/tabs/home" /> : <Register />}
          </Route>
          <Route path="/tabs">
            {!isAuthenticated ? <Redirect to="/login" /> : <Tabs />}
          </Route>
          <Route exact path="/card/:cardId">
            {!isAuthenticated ? <Redirect to="/login" /> : <CardDetail />}
          </Route>
          <Route exact path="/business/:businessId">
            {!isAuthenticated ? <Redirect to="/login" /> : <BusinessDetail />}
          </Route>
          <Route exact path="/validate-code">
            {!isAuthenticated ? <Redirect to="/login" /> : <ValidateCode />}
          </Route>
          <Route exact path="/redeem-code">
            {!isAuthenticated ? <Redirect to="/login" /> : <RedeemCode />}
          </Route>
          <Route exact path="/tarjetas-disponibles">
            {!isAuthenticated ? <Redirect to="/login" /> : <TarjetasDisponibles />}
          </Route>
          <Route exact path="/mis-tarjetas">
            {!isAuthenticated ? <Redirect to="/login" /> : <MisTarjetas />}
          </Route>
          <Route exact path="/">
            <Redirect to={hasCompletedOnboarding ? '/tabs/home' : '/onboarding'} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;


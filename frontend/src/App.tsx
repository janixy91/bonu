import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
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
import TapConfirm from './pages/TapConfirm';
import CheckIn from './pages/CheckIn';
import Points from './pages/Points';
import Rewards from './pages/Rewards';

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
  const { isAuthenticated, hasCompletedOnboarding, logout, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Set up auth store reference for API service to read tokens directly
    // Pass the store getState function so API can read current state synchronously
    const getStateFn = () => {
      const state = useAuthStore.getState();
      console.log('[App] getState called, returning:', {
        isAuthenticated: state.isAuthenticated,
        hasAccessToken: !!state.accessToken,
        hasUser: !!state.user
      });
      return state;
    };
    apiService.setAuthStore(getStateFn);
    console.log('[App] Auth store configured for API service');
    
    // Set up logout callback for API service
    apiService.setLogoutCallback(() => {
      logout();
      // The redirect will happen automatically via the route guards
    });

    // Handle deep links (bonu://tap?tapIntentId=XXX)
    if (Capacitor.isNativePlatform()) {
      // Listen for app URL open events (when app is opened via deep link)
      CapacitorApp.addListener('appUrlOpen', (data: { url: string }) => {
        try {
          const url = new URL(data.url);
          if (url.protocol === 'bonu:' && url.hostname === 'tap') {
            const tapIntentId = url.searchParams.get('tapIntentId');
            if (tapIntentId) {
              // Navigate to tap confirmation page within the app
              window.location.href = `/tap?tapIntentId=${tapIntentId}`;
            }
          }
        } catch (e) {
          console.error('Error parsing deep link URL:', e);
        }
      });

      // Also check if app was opened with a deep link (when app is already running)
      CapacitorApp.getLaunchUrl().then((ret) => {
        if (ret?.url) {
          try {
            const url = new URL(ret.url);
            if (url.protocol === 'bonu:' && url.hostname === 'tap') {
              const tapIntentId = url.searchParams.get('tapIntentId');
              if (tapIntentId) {
                window.location.href = `/tap?tapIntentId=${tapIntentId}`;
              }
            }
          } catch (e) {
            console.error('Error parsing launch URL:', e);
          }
        }
      });

      // Handle app state changes (when app comes to foreground)
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // Check if there's a pending deep link when app becomes active
          App.getLaunchUrl().then((ret) => {
            if (ret?.url) {
              try {
                const url = new URL(ret.url);
                if (url.protocol === 'bonu:' && url.hostname === 'tap') {
                  const tapIntentId = url.searchParams.get('tapIntentId');
                  if (tapIntentId) {
                    window.location.href = `/tap?tapIntentId=${tapIntentId}`;
                  }
                }
              } catch (e) {
                console.error('Error parsing launch URL on app state change:', e);
              }
            }
          });
        }
      });
    }
  }, [logout]);

  // Don't render routes until state has been hydrated from localStorage
  if (!_hasHydrated) {
    return <IonApp><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div></IonApp>;
  }

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
            {!isAuthenticated ? <Redirect to="/login" /> : <Tabs key={useAuthStore.getState().user?.id || 'no-user'} />}
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
          <Route exact path="/tap">
            <TapConfirm />
          </Route>
          <Route exact path="/checkin">
            {!isAuthenticated ? <Redirect to="/login" /> : <CheckIn />}
          </Route>
          <Route exact path="/points">
            {!isAuthenticated ? <Redirect to="/login" /> : <Points />}
          </Route>
          <Route exact path="/business/:businessId/rewards">
            {!isAuthenticated ? <Redirect to="/login" /> : <Rewards />}
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


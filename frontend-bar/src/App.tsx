import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { apiService } from './services/api.service';
import Login from './pages/Login';
import ValidateCode from './pages/ValidateCode';
import TarjetasList from './pages/TarjetasList';
import CreateEditTarjeta from './pages/CreateEditTarjeta';

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
  const { isAuthenticated, logout } = useAuthStore();

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
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/validate" /> : <Login />}
          </Route>
          <Route exact path="/validate">
            {!isAuthenticated ? <Redirect to="/login" /> : <ValidateCode />}
          </Route>
          <Route exact path="/tarjetas">
            {!isAuthenticated ? <Redirect to="/login" /> : <TarjetasList />}
          </Route>
          <Route exact path="/tarjetas/nueva">
            {!isAuthenticated ? <Redirect to="/login" /> : <CreateEditTarjeta />}
          </Route>
          <Route exact path="/tarjetas/:id/editar">
            {!isAuthenticated ? <Redirect to="/login" /> : <CreateEditTarjeta />}
          </Route>
          <Route exact path="/">
            <Redirect to={isAuthenticated ? '/tarjetas' : '/login'} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;


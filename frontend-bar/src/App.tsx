import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import ValidateCode from './pages/ValidateCode';
import PromoCardsList from './pages/PromoCardsList';
import CreatePromoCard from './pages/CreatePromoCard';
import PromoCardDetail from './pages/PromoCardDetail';

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
  const { isAuthenticated } = useAuthStore();

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
          <Route exact path="/promo-cards">
            {!isAuthenticated ? <Redirect to="/login" /> : <PromoCardsList />}
          </Route>
          <Route exact path="/promo-cards/new">
            {!isAuthenticated ? <Redirect to="/login" /> : <CreatePromoCard />}
          </Route>
          <Route exact path="/promo-cards/:id">
            {!isAuthenticated ? <Redirect to="/login" /> : <PromoCardDetail />}
          </Route>
          <Route exact path="/">
            <Redirect to={isAuthenticated ? '/promo-cards' : '/login'} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;


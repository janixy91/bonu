import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { wallet, search, ticketOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import Home from './Home';
import Explore from './Explore';
import RedeemCode from './RedeemCode';
import Profile from './Profile';
import Menu from '../components/Menu';
import './Tabs.css';

const Tabs: React.FC = () => {
  return (
    <>
      <Menu />
      <IonTabs className="custom-tabs">
        <IonRouterOutlet id="main-content">
          <Route exact path="/tabs/home">
            <Home />
          </Route>
          <Route exact path="/tabs/explore">
            <Explore />
          </Route>
          <Route exact path="/tabs/redeem">
            <RedeemCode />
          </Route>
          <Route exact path="/tabs/profile">
            <Profile />
          </Route>
          <Route exact path="/tabs">
            <Redirect to="/tabs/home" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom" className="custom-tab-bar">
          <IonTabButton tab="home" href="/tabs/home" className="tab-button-side">
            <IonIcon icon={wallet} />
            <IonLabel>Colección</IonLabel>
          </IonTabButton>

          <IonTabButton tab="redeem" href="/tabs/redeem" className="tab-button-center">
            <div className="center-button-wrapper">
              <IonIcon icon={ticketOutline} />
              <IonLabel>Canjear Sellos</IonLabel>
            </div>
          </IonTabButton>

          <IonTabButton tab="explore" href="/tabs/explore" className="tab-button-side">
            <IonIcon icon={search} />
            <IonLabel>Explorar</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default Tabs;


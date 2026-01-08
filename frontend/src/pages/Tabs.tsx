import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { star, locationOutline, giftOutline, personOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Home from './Home';
import Points from './Points';
import CheckIn from './CheckIn';
import Profile from './Profile';
import Menu from '../components/Menu';
import './Tabs.css';

const Tabs: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  // Use user ID as key to force remount when user changes (important after logout/login)
  const userKey = user?.id || 'no-user';
  
  return (
    <>
      <Menu />
      <IonTabs className="custom-tabs">
        <IonRouterOutlet id="main-content">
          <Route exact path="/tabs/home" key={`home-${userKey}`}>
            <Home />
          </Route>
          <Route exact path="/tabs/points">
            <Points />
          </Route>
          <Route exact path="/tabs/checkin">
            <CheckIn />
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
            <IonIcon icon={giftOutline} />
            <IonLabel>Inicio</IonLabel>
          </IonTabButton>

          <IonTabButton tab="points" href="/tabs/points" className="tab-button-side">
            <IonIcon icon={star} />
            <IonLabel>Puntos</IonLabel>
          </IonTabButton>

          <IonTabButton tab="checkin" href="/tabs/checkin" className="tab-button-center">
            <div className="center-button-wrapper">
              <IonIcon icon={locationOutline} />
              <IonLabel>Check-in</IonLabel>
            </div>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default Tabs;


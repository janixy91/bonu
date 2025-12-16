import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
} from '@ionic/react';
import { person, logOut } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Menu.css';

const Menu: React.FC = () => {
  const history = useHistory();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleProfile = () => {
    history.push('/tabs/profile');
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <IonMenu side="start" menuId="main-menu" contentId="main-content">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Menú</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="menu-header">
          <IonAvatar className="menu-avatar">
            <div className="avatar-placeholder">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          </IonAvatar>
          <h3>{user?.name || 'Usuario'}</h3>
          <p>{user?.email || ''}</p>
        </div>
        <IonList>
          <IonItem button onClick={handleProfile}>
            <IonIcon icon={person} slot="start" />
            <IonLabel>Perfil</IonLabel>
          </IonItem>
          <IonItem button onClick={handleLogout} className="logout-item">
            <IonIcon icon={logOut} slot="start" />
            <IonLabel>Cerrar Sesión</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;


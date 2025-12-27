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
  IonButtons,
  IonButton,
} from '@ionic/react';
import { person, close } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import './Menu.css';

const Menu: React.FC = () => {
  const history = useHistory();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const menuRef = useRef<HTMLIonMenuElement>(null);

  const handleProfile = () => {
    menuRef.current?.close();
    history.push('/tabs/profile');
  };


  const handleClose = () => {
    menuRef.current?.close();
  };

  return (
    <IonMenu ref={menuRef} side="start" menuId="main-menu" contentId="main-content">
      <IonHeader>
        <IonToolbar style={{ '--background': 'rgba(26, 32, 44, 0.98)' }}>
          <IonButtons slot="start">
            <IonButton onClick={handleClose} className="menu-close-button">
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ textAlign: 'center' }}>Menú</IonTitle>
          <IonButtons slot="end">
            <IonButton className="menu-close-button" style={{ opacity: 0, pointerEvents: 'none' }}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
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
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;


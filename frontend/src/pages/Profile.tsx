import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonAvatar,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
} from '@ionic/react';
import { logOut, person } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'rgba(26, 32, 44, 0.98)' }}>
          <IonButtons slot="start">
            <IonMenuButton color="light" />
          </IonButtons>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="profile-container">
          <IonCard>
            <IonCardContent>
              <div className="profile-header">
                <IonAvatar className="profile-avatar">
                  <div className="avatar-placeholder">{user?.name.charAt(0).toUpperCase()}</div>
                </IonAvatar>
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardContent>
              <IonItem>
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h3>Mi Información</h3>
                  <p>Ver y editar tu perfil</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          <IonButton
            expand="block"
            color="danger"
            onClick={handleLogout}
            className="logout-button"
          >
            <IonIcon icon={logOut} slot="start" />
            Cerrar Sesión
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;


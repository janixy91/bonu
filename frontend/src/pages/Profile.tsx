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
} from '@ionic/react';
import { logOut, person, ticketOutline } from 'ionicons/icons';
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
        <IonToolbar color="primary">
          <IonTitle style={{ paddingLeft: '0.75rem', textAlign: 'left' }}>Perfil</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              onClick={() => history.push('/redeem-code')} 
              fill="outline"
              color="light"
              style={{ 
                marginRight: '0.5rem',
                '--border-radius': '8px',
                '--border-width': '2px',
                '--border-style': 'solid',
                '--border-color': 'rgba(255, 255, 255, 0.5)',
                fontWeight: '500'
              }}
            >
              <IonIcon icon={ticketOutline} slot="start" style={{ marginRight: '0.5rem' }} />
              Obtener sello
            </IonButton>
          </IonButtons>
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


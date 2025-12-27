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
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonModal,
  IonButton,
  IonInput,
  IonAlert,
} from '@ionic/react';
import { person, logOut, close } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const handleEditClick = () => {
    setName(user?.name || '');
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage('El nombre no puede estar vacío');
      setShowErrorAlert(true);
      return;
    }

    try {
      setSaving(true);
      await updateProfile(name.trim());
      setShowEditModal(false);
      setShowSuccessAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al actualizar el perfil');
      setShowErrorAlert(true);
    } finally {
      setSaving(false);
    }
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
              <IonItem button onClick={handleEditClick}>
                <IonIcon icon={person} slot="start" />
                <IonLabel>
                  <h3>Mi Información</h3>
                  <p>Ver y editar tu perfil</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          <div className="logout-button-container">
            <button 
              onClick={handleLogout} 
              className="logout-text"
              type="button"
            >
              <IonIcon icon={logOut} className="logout-icon" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </IonContent>

      {/* Edit Profile Modal */}
      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
        <IonHeader>
          <IonToolbar style={{ '--background': 'rgba(26, 32, 44, 0.98)' }}>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowEditModal(false)} className="header-button">
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
            <IonTitle style={{ textAlign: 'center' }}>Editar Perfil</IonTitle>
            <IonButtons slot="start">
              <IonButton className="header-button" style={{ opacity: 0, pointerEvents: 'none' }}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="edit-profile-container">
            <IonCard>
              <IonCardContent>
                <div className="edit-profile-form">
                  <IonItem className="custom-input-item">
                    <IonLabel position="stacked" className="input-label">
                      Nombre
                    </IonLabel>
                    <IonInput
                      type="text"
                      value={name}
                      onIonInput={(e) => setName(e.detail.value!)}
                      placeholder="Tu nombre"
                      maxlength={50}
                    />
                  </IonItem>

                  <IonButton
                    expand="block"
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    className="save-profile-button"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonModal>

      {/* Success Alert */}
      <IonAlert
        isOpen={showSuccessAlert}
        onDidDismiss={() => setShowSuccessAlert(false)}
        header="¡Perfil actualizado!"
        message="Tu nombre se ha actualizado exitosamente"
        buttons={['OK']}
        cssClass="success-alert"
      />

      {/* Error Alert */}
      <IonAlert
        isOpen={showErrorAlert}
        onDidDismiss={() => setShowErrorAlert(false)}
        header="Error"
        message={errorMessage}
        buttons={['OK']}
        cssClass="error-alert"
      />
    </IonPage>
  );
};

export default Profile;


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
  IonInput,
  IonTextarea,
  IonButton,
  IonText,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { logOut, checkmarkCircle, ticketOutline } from 'ionicons/icons';
import { useAuthStore } from '../store/authStore';
import { businessOwnerService } from '../services/api.service';
import './BusinessOwnerDashboard.css';

const BusinessOwnerDashboard: React.FC = () => {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    totalStamps: '',
    rewardText: '',
  });
  const history = useHistory();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const response = await businessOwnerService.getMyBusiness();
      setBusiness(response.business);
      setFormData({
        name: response.business.name || '',
        description: response.business.description || '',
        logoUrl: response.business.logoUrl || '',
        totalStamps: response.business.totalStamps?.toString() || '10',
        rewardText: response.business.rewardText || '',
      });
    } catch (error) {
      console.error('Error loading business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await businessOwnerService.updateMyBusiness({
        name: formData.name,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
        totalStamps: parseInt(formData.totalStamps) || undefined,
        rewardText: formData.rewardText,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadBusiness();
    } catch (error: any) {
      alert(error.message || 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Mi Negocio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!business) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Mi Negocio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardContent>
              <p>No se encontró un negocio asociado a tu cuenta.</p>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mi Negocio</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} className="logout-button">
              <IonIcon icon={logOut} slot="start" />
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="dashboard-container">
          <IonCard>
            <IonCardContent>
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => history.push('/business-owner/generate-codes')}
                className="generate-codes-button"
              >
                <IonIcon icon={ticketOutline} slot="start" />
                Generar Códigos de Canje
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardContent>
              <h2 className="form-title">Configuración del Negocio</h2>

              {success && (
                <div className="success-message">
                  <IonIcon icon={checkmarkCircle} />
                  <IonText color="success">Cambios guardados correctamente</IonText>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonLabel position="stacked">Nombre del Negocio *</IonLabel>
                  <IonInput
                    value={formData.name}
                    onIonInput={(e) => setFormData({ ...formData, name: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Descripción</IonLabel>
                  <IonTextarea
                    value={formData.description}
                    onIonInput={(e) => setFormData({ ...formData, description: e.detail.value! })}
                    rows={3}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">URL del Logo</IonLabel>
                  <IonInput
                    type="url"
                    value={formData.logoUrl}
                    onIonInput={(e) => setFormData({ ...formData, logoUrl: e.detail.value! })}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Número de Sellos *</IonLabel>
                  <IonInput
                    type="number"
                    value={formData.totalStamps}
                    onIonInput={(e) => setFormData({ ...formData, totalStamps: e.detail.value! })}
                    min="1"
                    required
                  />
                  <IonText slot="helper" color="medium">
                    Número de sellos necesarios para canjear la recompensa
                  </IonText>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Texto de Recompensa *</IonLabel>
                  <IonTextarea
                    value={formData.rewardText}
                    onIonInput={(e) => setFormData({ ...formData, rewardText: e.detail.value! })}
                    rows={2}
                    required
                    placeholder="Ej: Desayuno gratis"
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={saving}
                  className="submit-button"
                >
                  {saving ? (
                    <>
                      <IonSpinner name="crescent" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BusinessOwnerDashboard;


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
  IonButtons,
  IonIcon,
  IonSpinner,
  IonBackButton,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { logOut, checkmarkCircle, createOutline, closeOutline, settingsOutline } from 'ionicons/icons';
import { useAuthStore } from '../store/authStore';
import { businessOwnerService } from '../services/api.service';
import './BusinessInfo.css';
import './BusinessDetails.css';

const BusinessInfo: React.FC = () => {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
  });
  const history = useHistory();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      setError('');
      const businessResponse = await businessOwnerService.getMyBusiness();
      const businessData = businessResponse.business;
      setBusiness(businessData);
      setFormData({
        name: businessData.name || '',
        description: businessData.description || '',
        logoUrl: businessData.logoUrl || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar el negocio');
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: business.name || '',
      description: business.description || '',
      logoUrl: business.logoUrl || '',
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      await businessOwnerService.updateMyBusiness({
        name: formData.name,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
      });
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => {
        setSuccess(false);
        loadBusiness();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el negocio');
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
            <IonButtons slot="start">
              <IonBackButton defaultHref="/business-owner/dashboard" />
            </IonButtons>
            <IonTitle className="business-title">Información del Negocio</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout} className="logout-button">
                <IonIcon icon={logOut} slot="start" />
                Salir
              </IonButton>
            </IonButtons>
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
            <IonButtons slot="start">
              <IonBackButton defaultHref="/business-owner/dashboard" />
            </IonButtons>
            <IonTitle className="business-title">Información del Negocio</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout} className="logout-button">
                <IonIcon icon={logOut} slot="start" />
                Salir
              </IonButton>
            </IonButtons>
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/business-owner/dashboard" />
          </IonButtons>
          <IonTitle className="business-title">Información del Negocio</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} className="logout-button">
              <IonIcon icon={logOut} slot="start" />
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="details-container">
          {/* Business Info Card */}
          <IonCard className="business-info-card">
            <IonCardContent>
              {error && (
                <div className="error-message">
                  <IonIcon icon={closeOutline} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="success-message">
                  <IonIcon icon={checkmarkCircle} />
                  <span>Negocio actualizado correctamente</span>
                </div>
              )}

              {!isEditing ? (
                <div className="business-info-view">
                  <div className="business-info-header">
                    <h2 className="section-title">
                      <IonIcon icon={settingsOutline} />
                      Información del Negocio
                    </h2>
                    <IonButton
                      fill="outline"
                      size="small"
                      onClick={handleEdit}
                      className="edit-button"
                    >
                      <IonIcon icon={createOutline} slot="start" />
                      Editar
                    </IonButton>
                  </div>
                  {business?.logoUrl && (
                    <div className="info-row logo-row">
                      <img 
                        src={business.logoUrl} 
                        alt={`Logo de ${business?.name || 'negocio'}`}
                        className="business-logo"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{business?.name || 'N/A'}</span>
                  </div>
                  {business?.description && (
                    <div className="info-row">
                      <span className="info-label">Descripción:</span>
                      <span className="info-value">{business.description}</span>
                    </div>
                  )}
                  {business?.logoUrl && (
                    <div className="info-row">
                      <span className="info-label">URL del Logo:</span>
                      <span className="info-value">
                        <a href={business.logoUrl} target="_blank" rel="noopener noreferrer">
                          {business.logoUrl}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
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

                  <div className="form-actions">
                    <IonButton
                      fill="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <IonIcon icon={closeOutline} slot="start" />
                      Cancelar
                    </IonButton>
                    <IonButton
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
                        <>
                          <IonIcon icon={checkmarkCircle} slot="start" />
                          Guardar
                        </>
                      )}
                    </IonButton>
                  </div>
                </form>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BusinessInfo;


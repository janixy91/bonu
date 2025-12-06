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
  IonBackButton,
  IonSpinner,
  IonModal,
  IonIcon,
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { checkmarkCircle, copyOutline, closeOutline } from 'ionicons/icons';
import { adminService } from '../services/api.service';
import './CreateBusiness.css';

const CreateBusiness: React.FC = () => {
  const [formData, setFormData] = useState({
    // Business info
    name: '',
    description: '',
    logoUrl: '',
    ownerEmail: '',
    // First card (stamp card)
    cardTitle: 'Tarjeta de Sellos',
    cardDescription: '',
    totalStamps: '10',
    rewardText: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    ownerEmail: string;
    temporaryPassword?: string;
  } | null>(null);
  const history = useHistory();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    history.push('/admin/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminService.createBusiness({
        name: formData.name,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
        ownerEmail: formData.ownerEmail,
        firstCard: {
          title: formData.cardTitle,
          description: formData.cardDescription || undefined,
          totalStamps: parseInt(formData.totalStamps) || 10,
          rewardText: formData.rewardText,
        },
      });

      // Always show success modal
      console.log('Response from createBusiness:', response); // Debug
      setSuccessData({
        ownerEmail: response.ownerEmail || formData.ownerEmail,
        temporaryPassword: response.temporaryPassword,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || 'Error al crear negocio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" />
          </IonButtons>
          <IonTitle>Nuevo Negocio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="form-container">
          <IonCard>
            <IonCardContent>
              <h2 className="form-title">Registrar Nuevo Negocio</h2>

              {error && (
                <IonText color="danger" className="error-message">
                  {error}
                </IonText>
              )}

              <form onSubmit={handleSubmit}>
                {/* Business Info Section */}
                <h3 className="section-subtitle">Información del Negocio</h3>
                
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
                  <IonLabel position="stacked">Email del Propietario *</IonLabel>
                  <IonInput
                    type="email"
                    value={formData.ownerEmail}
                    onIonInput={(e) => setFormData({ ...formData, ownerEmail: e.detail.value! })}
                    required
                    placeholder="email@ejemplo.com"
                  />
                </IonItem>

                {/* First Card Section */}
                <h3 className="section-subtitle">Primera Tarjeta de Sellos</h3>
                <p className="section-description">
                  Crea la tarjeta de sellos inicial para este negocio. Los clientes acumularán sellos en esta tarjeta.
                </p>

                <IonItem>
                  <IonLabel position="stacked">Título de la Tarjeta *</IonLabel>
                  <IonInput
                    value={formData.cardTitle}
                    onIonInput={(e) => setFormData({ ...formData, cardTitle: e.detail.value! })}
                    required
                    placeholder="Ej: Tarjeta de Sellos"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Descripción de la Tarjeta</IonLabel>
                  <IonTextarea
                    value={formData.cardDescription}
                    onIonInput={(e) => setFormData({ ...formData, cardDescription: e.detail.value! })}
                    rows={2}
                    placeholder="Descripción opcional de la tarjeta"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Número de Sellos Requeridos *</IonLabel>
                  <IonInput
                    type="number"
                    value={formData.totalStamps}
                    onIonInput={(e) => setFormData({ ...formData, totalStamps: e.detail.value! })}
                    min="1"
                    required
                    placeholder="Ej: 10"
                  />
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
                  disabled={loading || !formData.name || !formData.ownerEmail || !formData.totalStamps || !formData.rewardText}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <IonSpinner name="crescent" />
                      Creando...
                    </>
                  ) : (
                    'Crear Negocio y Tarjeta'
                  )}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Success Modal */}
          <IonModal isOpen={showSuccessModal} onDidDismiss={handleCloseModal}>
            <IonHeader>
              <IonToolbar color="success">
                <IonTitle>Negocio Creado Exitosamente</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={handleCloseModal}>
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="modal-content">
              <div className="success-modal-container">
                <IonCard>
                  <IonCardContent>
                    <div className="success-icon">
                      <IonIcon icon={checkmarkCircle} size="large" color="success" />
                    </div>
                    <h2 className="success-title">¡Negocio creado!</h2>
                    <p className="success-message">
                      Se ha creado una cuenta para el propietario del negocio.
                    </p>

                    <div className="credentials-box">
                      <h3>Credenciales de acceso:</h3>
                      <div className="credential-item">
                        <label>Email:</label>
                        <div className="credential-value">
                          <code>{successData?.ownerEmail}</code>
                          <IonButton
                            fill="clear"
                            size="small"
                            onClick={() => copyToClipboard(successData?.ownerEmail || '')}
                          >
                            <IonIcon icon={copyOutline} />
                          </IonButton>
                        </div>
                      </div>
                      {successData?.temporaryPassword && (
                        <div className="credential-item">
                          <label>Contraseña temporal:</label>
                          <div className="credential-value">
                            <code className="password-code">{successData.temporaryPassword}</code>
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => copyToClipboard(successData.temporaryPassword || '')}
                            >
                              <IonIcon icon={copyOutline} />
                            </IonButton>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="info-box">
                      {successData?.temporaryPassword ? (
                        <p>
                          <strong>Importante:</strong> La contraseña temporal también se ha enviado por email al propietario.
                          El propietario puede acceder al panel usando estas credenciales.
                        </p>
                      ) : (
                        <p>
                          <strong>Nota:</strong> Este usuario ya existía en el sistema. Se ha actualizado su rol a "business_owner".
                          El propietario puede acceder al panel con su contraseña actual.
                        </p>
                      )}
                    </div>

                    <IonButton expand="block" onClick={handleCloseModal} className="close-button">
                      Entendido
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </div>
            </IonContent>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CreateBusiness;


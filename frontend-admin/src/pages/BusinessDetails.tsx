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
  IonBadge,
  IonIcon,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { checkmarkCircle, createOutline, closeOutline } from 'ionicons/icons';
import { adminService } from '../services/api.service';
import './BusinessDetails.css';

const BusinessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<any>(null);
  const [promoCards, setPromoCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [togglingCard, setTogglingCard] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadBusiness();
    }
  }, [id]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getBusiness(id!);
      setBusiness(response.business);
      setPromoCards(response.promoCards || []);
      setFormData({
        name: response.business.name || '',
        description: response.business.description || '',
        logoUrl: response.business.logoUrl || '',
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
    setError('');
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess(false);
    // Reset form data to original business data
    if (business) {
      setFormData({
        name: business.name || '',
        description: business.description || '',
        logoUrl: business.logoUrl || '',
      });
    }
  };

  const handleToggleCardActive = async (cardId: string, currentActive: boolean) => {
    try {
      setTogglingCard(cardId);
      setError('');
      const newActive = !currentActive;
      await adminService.togglePromoCardActive(cardId, newActive);
      
      // Update local state
      setPromoCards(promoCards.map(card => 
        (card._id === cardId || card.id === cardId) 
          ? { ...card, active: newActive }
          : card
      ));
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado de la tarjeta');
    } finally {
      setTogglingCard(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      await adminService.updateBusiness(id!, {
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

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/dashboard" />
            </IonButtons>
            <IonTitle>Detalles del Negocio</IonTitle>
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

  if (error && !business) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/dashboard" />
            </IonButtons>
            <IonTitle>Detalles del Negocio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="error-container">
            <IonText color="danger">{error}</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" />
          </IonButtons>
          <IonTitle>Detalles del Negocio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="details-container">
          {/* Business Info Card */}
          <IonCard className="business-info-card">
            <IonCardContent>
              <div className="business-info-header">
                <h2 className="section-title">Información del Negocio</h2>
                {!isEditing && (
                  <IonButton
                    size="small"
                    fill="outline"
                    onClick={handleEdit}
                    className="edit-button"
                  >
                    <IonIcon icon={createOutline} slot="start" />
                    Editar
                  </IonButton>
                )}
              </div>

              {error && (
                <IonText color="danger" className="error-message">
                  {error}
                </IonText>
              )}

              {success && (
                <IonText color="success" className="success-message">
                  <IonIcon icon={checkmarkCircle} /> Negocio actualizado correctamente
                </IonText>
              )}

              {!isEditing ? (
                <div className="business-info-view">
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
                      <span className="info-label">Logo:</span>
                      <span className="info-value">
                        <a href={business.logoUrl} target="_blank" rel="noopener noreferrer">
                          {business.logoUrl}
                        </a>
                      </span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Propietario:</span>
                    <span className="info-value">{business?.ownerId?.email || 'N/A'}</span>
                  </div>
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

          {/* Promo Cards Section */}
          <IonCard>
            <IonCardContent>
              <h2 className="section-title">Tarjetas de Promoción</h2>

              {promoCards.length === 0 ? (
                <p className="empty-message">No hay tarjetas creadas aún</p>
              ) : (
                <div className="cards-list">
                  {promoCards.map((card) => (
                    <IonCard key={card._id || card.id} className="promo-card-item">
                      <IonCardContent>
                        <div className="card-header">
                          <div className="card-info">
                            <h3>{card.title}</h3>
                            {card.description && (
                              <p className="card-description">{card.description}</p>
                            )}
                          </div>
                          <IonBadge 
                            color={card.active ? 'success' : 'danger'} 
                            className={`${card.active ? 'active-badge' : 'inactive-badge'} clickable-badge`}
                            onClick={() => handleToggleCardActive(card._id || card.id, card.active)}
                          >
                            {togglingCard === (card._id || card.id) ? (
                              <>
                                <IonSpinner name="crescent" />
                                {card.active ? 'Desactivando...' : 'Activando...'}
                              </>
                            ) : (
                              card.active ? 'Activa' : 'Inactiva'
                            )}
                          </IonBadge>
                        </div>

                        {card.type === 'stamp' && (
                          <div className="card-details">
                            <IonItem>
                              <IonLabel>
                                <h4>Sellos Requeridos</h4>
                                <p>{card.totalStamps}</p>
                              </IonLabel>
                            </IonItem>
                            <IonItem>
                              <IonLabel>
                                <h4>Recompensa</h4>
                                <p>{card.rewardText}</p>
                              </IonLabel>
                            </IonItem>
                          </div>
                        )}
                      </IonCardContent>
                    </IonCard>
                  ))}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BusinessDetails;


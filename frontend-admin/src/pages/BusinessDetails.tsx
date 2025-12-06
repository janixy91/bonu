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
  IonIcon,
  IonBadge,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonDatetimeButton,
  IonDatetime,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { checkmarkCircle, add, ticketOutline } from 'ionicons/icons';
import { adminService } from '../services/api.service';
import './BusinessDetails.css';

const BusinessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [promoCards, setPromoCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [cardFormData, setCardFormData] = useState({
    title: '',
    description: '',
    type: 'unlimited' as 'unlimited' | 'limited',
    limit: '',
    benefitType: '',
    expiresAt: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    ownerEmail: '',
  });

  useEffect(() => {
    // Don't try to load if id is 'new' - this route shouldn't be reached
    if (id && id !== 'new') {
      loadBusiness();
      loadPromoCards();
    }
  }, [id]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBusiness(id!);
      const businessData = response.business;
      setBusiness(businessData);
      setFormData({
        name: businessData.name || '',
        description: businessData.description || '',
        logoUrl: businessData.logoUrl || '',
        ownerEmail: businessData.ownerId?.email || '',
      });
    } catch (error: any) {
      console.error('Error loading business:', error);
      setError(error.message || 'Error al cargar el negocio');
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCards = async () => {
    try {
      setLoadingCards(true);
      const response = await adminService.getPromoCards(id!);
      setPromoCards(response.cards || []);
    } catch (error: any) {
      console.error('Error loading promo cards:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCreateCard = async () => {
    if (!business?._id) {
      setError('No se encontró el negocio');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data: any = {
        businessId: business._id,
        title: cardFormData.title,
        description: cardFormData.description,
        type: cardFormData.type,
        benefitType: cardFormData.benefitType,
      };

      if (cardFormData.type === 'limited') {
        const limit = parseInt(cardFormData.limit);
        if (!limit || limit <= 0) {
          setError('El límite debe ser un número positivo');
          setSaving(false);
          return;
        }
        data.limit = limit;
      }

      if (cardFormData.expiresAt) {
        data.expiresAt = new Date(cardFormData.expiresAt).toISOString();
      }

      await adminService.createPromoCard(data);
      setShowCreateCardModal(false);
      setCardFormData({
        title: '',
        description: '',
        type: 'unlimited',
        limit: '',
        benefitType: '',
        expiresAt: '',
      });
      await loadPromoCards();
      setSuccess('Tarjeta promocional creada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear la tarjeta');
    } finally {
      setSaving(false);
    }
  };

  const getCardStatusBadge = (card: any) => {
    if (card.soldOut) {
      return <IonBadge color="danger">Agotada</IonBadge>;
    }
    if (!card.active) {
      return <IonBadge color="medium">Inactiva</IonBadge>;
    }
    return <IonBadge color="success">Activa</IonBadge>;
  };

  const getCardTypeLabel = (card: any) => {
    if (card.type === 'limited') {
      return `Limitada (${card.remaining}/${card.limit})`;
    }
    return 'Ilimitada';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await adminService.updateBusiness(id!, {
        name: formData.name,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
        totalStamps: Number.parseInt(formData.totalStamps, 10) || undefined,
        rewardText: formData.rewardText,
        ownerEmail: formData.ownerEmail || undefined,
      });

      setSuccess('Cambios guardados correctamente');
      setTimeout(() => setSuccess(''), 3000);
      await loadBusiness();
    } catch (err: any) {
      setError(err.message || 'Error al guardar cambios');
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

  if (!business) {
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
          <IonCard>
            <IonCardContent>
              <p>No se encontró el negocio.</p>
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
            <IonBackButton defaultHref="/admin/dashboard" />
          </IonButtons>
          <IonTitle>Detalles del Negocio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="details-container">
          <IonCard>
            <IonCardContent>
              <h2 className="form-title">Editar Negocio</h2>

              {success && (
                <div className="success-message">
                  <IonIcon icon={checkmarkCircle} />
                  <IonText color="success">{success}</IonText>
                </div>
              )}

              {error && (
                <IonText color="danger" className="error-message">
                  {error}
                </IonText>
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
                  <IonLabel position="stacked">Email del Propietario</IonLabel>
                  <IonInput
                    type="email"
                    value={formData.ownerEmail}
                    onIonInput={(e) => setFormData({ ...formData, ownerEmail: e.detail.value! })}
                    placeholder="email@ejemplo.com"
                  />
                  <IonText slot="helper" color="medium">
                    Dejar vacío para mantener el propietario actual
                  </IonText>
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

          {/* Business Info Card */}
          <IonCard>
            <IonCardContent>
              <h3 className="info-title">Información del Negocio</h3>
              <div className="info-item">
                <strong>ID:</strong> {business._id}
              </div>
              <div className="info-item">
                <strong>Propietario:</strong> {business.ownerId?.name || 'N/A'} ({business.ownerId?.email || 'N/A'})
              </div>
              <div className="info-item">
                <strong>Creado:</strong> {new Date(business.createdAt).toLocaleDateString('es-ES')}
              </div>
              <div className="info-item">
                <strong>Última actualización:</strong> {new Date(business.updatedAt).toLocaleDateString('es-ES')}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Promo Cards Section */}
          <IonCard>
            <IonCardContent>
              <div className="cards-header">
                <h3 className="info-title">Tarjetas Promocionales</h3>
                <IonButton
                  size="small"
                  onClick={() => setShowCreateCardModal(true)}
                  className="create-card-button"
                >
                  <IonIcon icon={add} slot="start" />
                  Nueva Tarjeta
                </IonButton>
              </div>

              {loadingCards ? (
                <div className="loading-container">
                  <IonSpinner name="crescent" />
                  <p>Cargando tarjetas...</p>
                </div>
              ) : promoCards.length === 0 ? (
                <div className="empty-state">
                  <IonIcon icon={ticketOutline} size="large" />
                  <p>No hay tarjetas promocionales creadas</p>
                </div>
              ) : (
                <IonList>
                  {promoCards.map((card) => (
                    <IonItem key={card._id}>
                      <IonIcon icon={ticketOutline} slot="start" />
                      <IonLabel>
                        <h2>{card.title}</h2>
                        <p>{card.description || 'Sin descripción'}</p>
                        <p className="card-meta">
                          {getCardTypeLabel(card)} • {card.benefitType}
                        </p>
                      </IonLabel>
                      {getCardStatusBadge(card)}
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {/* Create Promo Card Modal */}
        <IonModal isOpen={showCreateCardModal} onDidDismiss={() => setShowCreateCardModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Nueva Tarjeta Promocional</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCreateCardModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Título *</IonLabel>
              <IonInput
                value={cardFormData.title}
                onIonInput={(e) => setCardFormData({ ...cardFormData, title: e.detail.value! })}
                placeholder="Ej: Desayuno Especial"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Descripción</IonLabel>
              <IonTextarea
                value={cardFormData.description}
                onIonInput={(e) => setCardFormData({ ...cardFormData, description: e.detail.value! })}
                rows={3}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Tipo de Tarjeta *</IonLabel>
              <IonSelect
                value={cardFormData.type}
                onIonChange={(e) => setCardFormData({ ...cardFormData, type: e.detail.value, limit: '' })}
              >
                <IonSelectOption value="unlimited">Ilimitada</IonSelectOption>
                <IonSelectOption value="limited">Limitada</IonSelectOption>
              </IonSelect>
            </IonItem>

            {cardFormData.type === 'limited' && (
              <IonItem>
                <IonLabel position="stacked">Límite de Unidades *</IonLabel>
                <IonInput
                  type="number"
                  value={cardFormData.limit}
                  onIonInput={(e) => setCardFormData({ ...cardFormData, limit: e.detail.value! })}
                  min="1"
                  placeholder="Ej: 100"
                />
              </IonItem>
            )}

            <IonItem>
              <IonLabel position="stacked">Tipo de Beneficio *</IonLabel>
              <IonInput
                value={cardFormData.benefitType}
                onIonInput={(e) => setCardFormData({ ...cardFormData, benefitType: e.detail.value! })}
                placeholder="Ej: Desayuno completo"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Fecha de Expiración (Opcional)</IonLabel>
              <IonDatetimeButton datetime="cardExpiresDatetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="cardExpiresDatetime"
                  presentation="date-time"
                  value={cardFormData.expiresAt}
                  onIonChange={(e) => setCardFormData({ ...cardFormData, expiresAt: e.detail.value! as string })}
                  min={new Date().toISOString()}
                ></IonDatetime>
              </IonModal>
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleCreateCard}
              disabled={saving || !cardFormData.title || !cardFormData.benefitType || (cardFormData.type === 'limited' && !cardFormData.limit)}
              className="submit-button"
            >
              {saving ? (
                <>
                  <IonSpinner name="crescent" />
                  Creando...
                </>
              ) : (
                'Crear Tarjeta'
              )}
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default BusinessDetails;


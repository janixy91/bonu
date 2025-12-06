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
  IonModal,
  IonDatetimeButton,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonAlert,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  checkmarkCircle,
  ticketOutline,
  addOutline,
  refreshOutline,
  powerOutline,
  trashOutline,
  qrCodeOutline,
} from 'ionicons/icons';
import {
  promoCardService,
  businessService,
  codeService,
} from '../services/api.service';
import './PromoCardDetail.css';

const PromoCardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    count: '10',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [stockAmount, setStockAmount] = useState('');
  const history = useHistory();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [cardRes, businessRes] = await Promise.all([
        promoCardService.getPromoCard(id!),
        businessService.getMyBusiness(),
      ]);
      
      setCard(cardRes.card);
      setStatistics(cardRes.statistics);
      setBusiness(businessRes.business);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setSaving(true);
      await promoCardService.togglePromoCardActive(id!, !card.active);
      await loadData();
      setSuccess(`Tarjeta ${!card.active ? 'activada' : 'desactivada'} exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStock = async () => {
    if (!stockAmount || parseInt(stockAmount) <= 0) {
      setError('La cantidad debe ser un número positivo');
      return;
    }

    try {
      setSaving(true);
      await promoCardService.addStock(id!, parseInt(stockAmount));
      setShowStockModal(false);
      setStockAmount('');
      await loadData();
      setSuccess(`Se añadieron ${stockAmount} unidades`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al añadir stock');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (!business?._id) {
      setError('No se encontró el negocio');
      return;
    }

    const count = parseInt(generateForm.count);
    if (!count || count < 1 || count > 100) {
      setError('La cantidad debe estar entre 1 y 100');
      return;
    }

    try {
      setSaving(true);
      await codeService.generateCodesForCard({
        businessId: business._id,
        promoCardId: id!,
        benefitName: card.benefitType,
        expirationDate: new Date(generateForm.expirationDate).toISOString(),
        count,
      });
      setShowGenerateModal(false);
      await loadData();
      setSuccess(`${count} códigos generados exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al generar códigos');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await promoCardService.deletePromoCard(id!);
      history.push('/promo-cards');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la tarjeta');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/promo-cards" />
            </IonButtons>
            <IonTitle>Detalles</IonTitle>
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

  if (!card) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/promo-cards" />
            </IonButtons>
            <IonTitle>Detalles</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardContent>
              <p>Tarjeta no encontrada</p>
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
            <IonBackButton defaultHref="/promo-cards" />
          </IonButtons>
          <IonTitle>{card.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="detail-container">
          {success && (
            <IonCard>
              <IonCardContent>
                <div className="success-message">
                  <IonIcon icon={checkmarkCircle} />
                  <IonText color="success">{success}</IonText>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {error && (
            <IonCard>
              <IonCardContent>
                <IonText color="danger">{error}</IonText>
              </IonCardContent>
            </IonCard>
          )}

          {/* Card Info */}
          <IonCard>
            <IonCardContent>
              <div className="card-header">
                <h2>{card.title}</h2>
                {card.soldOut ? (
                  <IonBadge color="danger">Agotada</IonBadge>
                ) : card.active ? (
                  <IonBadge color="success">Activa</IonBadge>
                ) : (
                  <IonBadge color="medium">Inactiva</IonBadge>
                )}
              </div>
              <p className="card-description">{card.description || 'Sin descripción'}</p>
              <div className="card-info">
                <div className="info-item">
                  <strong>Tipo:</strong> {card.type === 'limited' ? 'Limitada' : 'Ilimitada'}
                </div>
                {card.type === 'limited' && (
                  <div className="info-item">
                    <strong>Stock:</strong> {card.remaining} / {card.limit}
                  </div>
                )}
                <div className="info-item">
                  <strong>Beneficio:</strong> {card.benefitType}
                </div>
                {card.expiresAt && (
                  <div className="info-item">
                    <strong>Expira:</strong> {new Date(card.expiresAt).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Statistics */}
          {statistics && (
            <IonCard>
              <IonCardContent>
                <h3 className="section-title">Estadísticas</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{statistics.totalCodes}</div>
                    <div className="stat-label">Códigos Generados</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{statistics.usedCodes}</div>
                    <div className="stat-label">Códigos Usados</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{statistics.unusedCodes}</div>
                    <div className="stat-label">Códigos Disponibles</div>
                  </div>
                  {card.type === 'limited' && statistics.remaining !== null && (
                    <div className="stat-item">
                      <div className="stat-value">{statistics.remaining}</div>
                      <div className="stat-label">Stock Restante</div>
                    </div>
                  )}
                </div>
                {statistics.totalCodes > 0 && (
                  <div className="percentage-bar">
                    <div className="percentage-label">
                      Porcentaje usado: {statistics.percentageUsed}%
                    </div>
                    <div className="percentage-fill" style={{ width: `${statistics.percentageUsed}%` }}></div>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {/* Actions */}
          <IonCard>
            <IonCardContent>
              <h3 className="section-title">Acciones</h3>
              <div className="actions-grid">
                <IonButton
                  expand="block"
                  onClick={() => setShowGenerateModal(true)}
                  disabled={card.soldOut || !card.active}
                  className="action-button"
                >
                  <IonIcon icon={qrCodeOutline} slot="start" />
                  Generar Códigos
                </IonButton>

                {card.type === 'limited' && (
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={() => setShowStockModal(true)}
                    className="action-button"
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Añadir Stock
                  </IonButton>
                )}

                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleToggleActive}
                  disabled={saving}
                  className="action-button"
                >
                  <IonIcon icon={powerOutline} slot="start" />
                  {card.active ? 'Desactivar' : 'Activar'}
                </IonButton>

                <IonButton
                  expand="block"
                  fill="outline"
                  color="danger"
                  onClick={() => setShowDeleteAlert(true)}
                  disabled={saving}
                  className="action-button"
                >
                  <IonIcon icon={trashOutline} slot="start" />
                  Eliminar
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Generate Codes Modal */}
        <IonModal isOpen={showGenerateModal} onDidDismiss={() => setShowGenerateModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Generar Códigos</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowGenerateModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Cantidad (1-100)</IonLabel>
              <IonInput
                type="number"
                value={generateForm.count}
                onIonInput={(e) => setGenerateForm({ ...generateForm, count: e.detail.value! })}
                min="1"
                max="100"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Fecha de Expiración</IonLabel>
              <IonDatetimeButton datetime="generateExpiresDatetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="generateExpiresDatetime"
                  presentation="date"
                  value={generateForm.expirationDate}
                  onIonChange={(e) => setGenerateForm({ ...generateForm, expirationDate: e.detail.value! as string })}
                  min={new Date().toISOString().split('T')[0]}
                ></IonDatetime>
              </IonModal>
            </IonItem>
            <IonButton expand="block" onClick={handleGenerateCodes} disabled={saving}>
              {saving ? <IonSpinner name="crescent" /> : 'Generar'}
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Add Stock Modal */}
        <IonModal isOpen={showStockModal} onDidDismiss={() => setShowStockModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Añadir Stock</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowStockModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Cantidad a añadir</IonLabel>
              <IonInput
                type="number"
                value={stockAmount}
                onIonInput={(e) => setStockAmount(e.detail.value!)}
                min="1"
                placeholder="Ej: 50"
              />
            </IonItem>
            <IonButton expand="block" onClick={handleAddStock} disabled={saving || !stockAmount}>
              {saving ? <IonSpinner name="crescent" /> : 'Añadir Stock'}
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Delete Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Eliminar Tarjeta"
          message="¿Estás seguro de que quieres eliminar esta tarjeta? Esta acción no se puede deshacer."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PromoCardDetail;


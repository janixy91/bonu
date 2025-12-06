import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonAvatar,
  IonImg,
  IonLabel,
  IonItem,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { businessService, cardService } from '../services/api.service';
import './BusinessDetail.css';

const BusinessDetail: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const history = useHistory();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasCard, setHasCard] = useState(false);
  const [addingCard, setAddingCard] = useState(false);

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [businessRes, cardsRes] = await Promise.all([
        businessService.getBusiness(businessId!),
        cardService.getUserCards(),
      ]);
      setBusiness(businessRes.business);
      setHasCard(cardsRes.cards.some((c: any) => c.businessId._id === businessId));
    } catch (error) {
      console.error('Error loading business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      setAddingCard(true);
      await cardService.createCard(businessId!);
      setHasCard(true);
      history.push('/tabs/home');
    } catch (error: any) {
      alert(error.message || 'Error al añadir tarjeta');
    } finally {
      setAddingCard(false);
    }
  };

  if (loading || !business) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/explore" />
            </IonButtons>
            <IonTitle>Cargando...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent></IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/explore" />
          </IonButtons>
          <IonTitle>{business.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="business-detail-container">
          <IonCard>
            <IonCardContent>
              <div className="business-header">
                <IonAvatar className="business-avatar-large">
                  {business.logoUrl ? (
                    <IonImg src={business.logoUrl} />
                  ) : (
                    <div className="avatar-placeholder">{business.name.charAt(0)}</div>
                  )}
                </IonAvatar>
                <h2>{business.name}</h2>
                {business.description && <p>{business.description}</p>}
              </div>

              <IonItem>
                <IonLabel>
                  <h3>Sellos necesarios</h3>
                  <p>{business.totalStamps} sellos</p>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h3>Recompensa</h3>
                  <p>{business.rewardText}</p>
                </IonLabel>
              </IonItem>

              {!hasCard && (
                <IonButton
                  expand="block"
                  onClick={handleAddCard}
                  disabled={addingCard}
                  className="add-card-button"
                >
                  {addingCard ? 'Añadiendo...' : 'Añadir mi Tarjeta'}
                </IonButton>
              )}

              {hasCard && (
                <IonButton
                  expand="block"
                  onClick={() => history.push('/tabs/home')}
                  className="view-card-button"
                >
                  Ver mi Tarjeta
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BusinessDetail;


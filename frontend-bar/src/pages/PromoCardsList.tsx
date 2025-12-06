import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonButtons,
  IonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { add, ticketOutline, logOut, refreshOutline } from 'ionicons/icons';
import { promoCardService, businessService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './PromoCardsList.css';

const PromoCardsList: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get business info
      const businessRes = await businessService.getMyBusiness();
      setBusiness(businessRes.business);

      if (businessRes.business?._id) {
        // Get promo cards
        const cardsRes = await promoCardService.getPromoCards(businessRes.business._id);
        setCards(cardsRes.cards);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar las tarjetas');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Tarjetas Promocionales</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={logout}>
                <IonIcon icon={logOut} />
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Tarjetas Promocionales</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={loadData}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
            <IonButton onClick={logout}>
              <IonIcon icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="cards-list-container">
          {error && (
            <IonCard>
              <IonCardContent>
                <IonText color="danger">{error}</IonText>
              </IonCardContent>
            </IonCard>
          )}

          {business && (
            <IonCard>
              <IonCardContent>
                <h2 className="business-name">{business.name}</h2>
                <p className="business-description">{business.description || 'Sin descripción'}</p>
              </IonCardContent>
            </IonCard>
          )}

          <IonCard>
            <IonCardContent>
              <IonButton
                expand="block"
                onClick={() => history.push('/promo-cards/new')}
                className="create-button"
              >
                <IonIcon icon={add} slot="start" />
                Crear Nueva Tarjeta
              </IonButton>
            </IonCardContent>
          </IonCard>

          {cards.length === 0 ? (
            <IonCard>
              <IonCardContent>
                <div className="empty-state">
                  <IonIcon icon={ticketOutline} size="large" />
                  <p>No hay tarjetas promocionales creadas</p>
                  <IonButton fill="outline" onClick={() => history.push('/promo-cards/new')}>
                    Crear Primera Tarjeta
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ) : (
            <IonList>
              {cards.map((card) => (
                <IonItem
                  key={card._id}
                  button
                  onClick={() => history.push(`/promo-cards/${card._id}`)}
                >
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PromoCardsList;


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
  IonBadge,
  IonAvatar,
  IonImg,
  IonIcon,
} from '@ionic/react';
import { gift, checkmarkCircle } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { cardService } from '../services/api.service';
import './CardDetail.css';

const CardDetail: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const history = useHistory();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      setLoading(true);
      const response = await cardService.getCard(cardId!);
      setCard(response.card);
    } catch (error) {
      console.error('Error loading card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!card) return;

    if (card.currentStamps < card.businessId.totalStamps) {
      alert(`Necesitas ${card.businessId.totalStamps - card.currentStamps} sellos más`);
      return;
    }

    try {
      setRedeeming(true);
      await cardService.redeemReward(cardId!);
      await loadCard();
      alert('¡Recompensa canjeada exitosamente!');
    } catch (error: any) {
      alert(error.message || 'Error al canjear recompensa');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading || !card) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/home" />
            </IonButtons>
            <IonTitle>Cargando...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent></IonContent>
      </IonPage>
    );
  }

  const business = card.businessId;
  const stamps = Array.from({ length: business.totalStamps }, (_, i) => i < card.currentStamps);
  const isComplete = card.currentStamps >= business.totalStamps;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/home" />
          </IonButtons>
          <IonTitle>{business.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="card-detail-container">
          <IonCard className={isComplete ? 'card-complete' : ''}>
            <IonCardContent>
              <div className="card-header-detail">
                <IonAvatar className="business-avatar-large">
                  {business.logoUrl ? (
                    <IonImg src={business.logoUrl} />
                  ) : (
                    <div className="avatar-placeholder">{business.name.charAt(0)}</div>
                  )}
                </IonAvatar>
                <h2>{business.name}</h2>
                <IonBadge color={isComplete ? 'success' : 'medium'}>
                  {card.currentStamps} / {business.totalStamps}
                </IonBadge>
              </div>

              <div className="stamps-grid">
                {stamps.map((filled, index) => (
                  <div
                    key={index}
                    className={`stamp ${filled ? 'filled' : ''} ${isComplete ? 'complete' : ''}`}
                  >
                    {filled && <IonIcon icon={checkmarkCircle} />}
                  </div>
                ))}
              </div>

              <div className="reward-section">
                <IonIcon icon={gift} className="reward-icon" />
                <h3>Recompensa</h3>
                <p>{business.rewardText}</p>
              </div>

              <IonButton
                expand="block"
                disabled={!isComplete || redeeming}
                onClick={handleRedeem}
                className="redeem-button"
                color={isComplete ? 'success' : 'medium'}
              >
                {redeeming ? 'Canjeando...' : isComplete ? 'Canjear Recompensa' : 'Completa la tarjeta'}
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CardDetail;


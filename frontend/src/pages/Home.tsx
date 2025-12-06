import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSkeletonText,
  IonBadge,
  IonAvatar,
  IonImg,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ticketOutline } from 'ionicons/icons';
import { useAuthStore } from '../store/authStore';
import { cardService } from '../services/api.service';
import './Home.css';

const Home: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await cardService.getUserCards();
      setCards(response.cards);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadCards();
    event.detail.complete();
  };

  const getProgressPercentage = (current: number, total: number) => {
    return Math.min((current / total) * 100, 100);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Tarjetas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="home-container">
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => history.push('/redeem-code')}
            className="redeem-code-button"
          >
            <IonIcon icon={ticketOutline} slot="start" />
            Canjear código
          </IonButton>

          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <IonCard key={i}>
                  <IonCardContent>
                    <IonSkeletonText animated style={{ width: '60%', height: '20px' }} />
                    <IonSkeletonText animated style={{ width: '40%', height: '16px', marginTop: '10px' }} />
                  </IonCardContent>
                </IonCard>
              ))}
            </>
          ) : cards.length === 0 ? (
            <div className="empty-state">
              <IonImg src="/assets/empty-cards.svg" className="empty-icon" />
              <h3>No tienes tarjetas aún</h3>
              <p>Explora los comercios disponibles y añade tu primera tarjeta</p>
            </div>
          ) : (
            cards.map((card) => {
              const business = card.businessId;
              const progress = getProgressPercentage(card.currentStamps, business.totalStamps);
              const isComplete = card.currentStamps >= business.totalStamps;

              return (
                <IonCard
                  key={card._id}
                  className={isComplete ? 'card-complete' : ''}
                  onClick={() => history.push(`/card/${card._id}`)}
                >
                  <IonCardHeader>
                    <div className="card-header">
                      <IonAvatar className="business-avatar">
                        {business.logoUrl ? (
                          <IonImg src={business.logoUrl} />
                        ) : (
                          <div className="avatar-placeholder">{business.name.charAt(0)}</div>
                        )}
                      </IonAvatar>
                      <div className="card-header-info">
                        <IonCardTitle>{business.name}</IonCardTitle>
                        <IonBadge color={isComplete ? 'success' : 'medium'}>
                          {card.currentStamps} / {business.totalStamps}
                        </IonBadge>
                      </div>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="reward-text">{business.rewardText}</p>
                  </IonCardContent>
                </IonCard>
              );
            })
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;


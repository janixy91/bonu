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
import { tarjetaClienteService } from '../services/api.service';
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
      const response = await tarjetaClienteService.getMisTarjetas();
      // Transform the response to match the expected format
      setCards((response.tarjetas || []).map(tarjeta => ({
        _id: tarjeta.tarjetaClienteId,
        businessId: {
          _id: tarjeta.comercio?._id || tarjeta.comercio?.id,
          name: tarjeta.comercio?.name,
          logoUrl: tarjeta.comercio?.logoUrl,
        },
        currentStamps: tarjeta.sellosActuales || 0,
        totalStamps: tarjeta.totalStamps || 10,
        rewardText: tarjeta.valorRecompensa,
        nombre: tarjeta.nombre,
        estado: tarjeta.estadoCliente,
      })));
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
              const totalStamps = card.totalStamps || 10;
              const currentStamps = card.currentStamps || 0;
              const progress = getProgressPercentage(currentStamps, totalStamps);
              const isComplete = currentStamps >= totalStamps;

              return (
                <IonCard
                  key={card._id}
                  className={`stamp-card ${isComplete ? 'card-complete' : ''}`}
                  onClick={() => history.push(`/mis-tarjetas`)}
                >
                  <IonCardContent className="stamp-card-content">
                    {/* Header with business info */}
                    <div className="stamp-card-header">
                      <div className="stamp-card-logo">
                        {business?.logoUrl ? (
                          <IonImg src={business.logoUrl} className="business-logo-img" />
                        ) : (
                          <div className="business-logo-placeholder">
                            {(business?.name || card.nombre || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="stamp-card-title-section">
                        <h2 className="stamp-card-business-name">{business?.name || card.nombre || 'Tarjeta'}</h2>
                        <p className="stamp-card-reward">{card.rewardText || card.valorRecompensa || 'Recompensa'}</p>
                      </div>
                    </div>

                    {/* Stamps grid */}
                    <div className="stamps-grid">
                      {Array.from({ length: totalStamps }, (_, index) => {
                        const isFilled = index < currentStamps;
                        return (
                          <div
                            key={index}
                            className={`stamp ${isFilled ? 'stamp-filled' : 'stamp-empty'} ${isComplete && isFilled ? 'stamp-complete' : ''}`}
                          >
                            {isFilled && (
                              <IonImg 
                                src="/assets/logo-transparente.png" 
                                className="stamp-logo"
                                alt="BONU"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                   
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


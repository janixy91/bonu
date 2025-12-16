import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonSkeletonText,
  IonImg,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { tarjetaClienteService } from '../services/api.service';
import StampCard from '../components/StampCard';
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


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton color="light" />
          </IonButtons>
          <IonTitle>Mi Colección</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ paddingBottom: '100px' }}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="home-container">
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
              const isComplete = currentStamps >= totalStamps;

              return (
                <StampCard
                  key={card._id}
                  id={card._id}
                  businessName={business?.name}
                  businessLogoUrl={business?.logoUrl}
                  cardName={card.nombre}
                  rewardText={card.rewardText || card.valorRecompensa || 'Recompensa'}
                  totalStamps={totalStamps}
                  currentStamps={currentStamps}
                  isComplete={isComplete}
                  onClick={() => history.push(`/mis-tarjetas`)}
                />
              );
            })
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;


import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonImg,
  IonSkeletonText,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { add, arrowForward } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { businessService, cardService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './Explore.css';

const Explore: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCards, setUserCards] = useState<any[]>([]);
  const history = useHistory();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [businessesRes, cardsRes] = await Promise.all([
        businessService.getBusinesses(),
        cardService.getUserCards(),
      ]);
      console.log('Businesses received:', businessesRes.businesses?.length || 0);
      console.log('Businesses data:', businessesRes.businesses);
      setBusinesses(businessesRes.businesses || []);
      setUserCards(cardsRes.cards || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasCard = (businessId: string) => {
    return userCards.some((card) => card.businessId._id === businessId);
  };

  const handleAddCard = async (businessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await cardService.createCard(businessId);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Error al añadir tarjeta');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Explorar Comercios</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {[1, 2, 3, 4].map((i) => (
              <IonItem key={i}>
                <IonAvatar slot="start">
                  <IonSkeletonText animated />
                </IonAvatar>
                <IonLabel>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                  <IonSkeletonText animated style={{ width: '40%' }} />
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Explorar Comercios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {businesses.length === 0 ? (
          <div className="empty-state">
            <p>No hay comercios disponibles</p>
          </div>
        ) : (
          <IonList>
            {businesses.map((business) => {
              const alreadyHasCard = hasCard(business._id);
              return (
                <IonItem
                  key={business._id}
                  onClick={() => history.push(`/business/${business._id}`)}
                  button
                >
                  <IonAvatar slot="start">
                    {business.logoUrl ? (
                      <IonImg src={business.logoUrl} />
                    ) : (
                      <div className="avatar-placeholder">{business.name.charAt(0)}</div>
                    )}
                  </IonAvatar>
                  <IonLabel>
                    <h2>{business.name}</h2>
                    {business.description ? (
                      <p className="business-description">{business.description}</p>
                    ) : (
                      <p className="business-description empty">Sin descripción</p>
                    )}
                  </IonLabel>
                  {!alreadyHasCard && (
                   
                    <IonButton
                      slot="end"
                      fill="clear"
                      onClick={(e) => handleAddCard(business._id, e)}
                    >
                      <IonIcon icon={add} />
                    </IonButton>)}
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Explore;


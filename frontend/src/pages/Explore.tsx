import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonSkeletonText,
  IonButtons,
  IonMenuButton,
  IonAlert,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { tarjetaClienteService } from '../services/api.service';
import StampCard from '../components/StampCard';
import './Explore.css';

const Explore: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addedCardName, setAddedCardName] = useState('');
  const history = useHistory();

  useEffect(() => {
    loadTarjetas();
  }, []);

  const loadTarjetas = async () => {
    try {
      setLoading(true);
      const response = await tarjetaClienteService.getTarjetasDisponibles();
      setTarjetas(response.tarjetas || []);
    } catch (error) {
      console.error('Error loading tarjetas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnadir = async (id: string) => {
    try {
      setAddingId(id);
      const tarjeta = tarjetas.find(t => t.id === id);
      const cardName = tarjeta?.nombre || tarjeta?.comercio?.name || 'tarjeta';
      
      await tarjetaClienteService.anadirTarjeta(id);
      await loadTarjetas();
      
      setAddedCardName(cardName);
      setShowSuccessAlert(true);
      
      // Emitir evento para actualizar la lista de colección
      window.dispatchEvent(new CustomEvent('cardAdded'));
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al añadir tarjeta');
      setShowErrorAlert(true);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'rgba(26, 32, 44, 0.98)' }}>
          <IonButtons slot="start">
            <IonMenuButton color="light" />
          </IonButtons>
          <IonTitle>Explorar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ paddingBottom: '100px' }}>
        <div className="explore-container">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <IonCard key={i} className="stamp-card">
                  <IonCardContent className="stamp-card-content">
                    <IonSkeletonText animated style={{ width: '60%', height: '20px' }} />
                    <IonSkeletonText animated style={{ width: '40%', height: '16px', marginTop: '10px' }} />
                  </IonCardContent>
                </IonCard>
              ))}
            </>
          ) : tarjetas.length === 0 ? (
            <div className="empty-state">
              <h3>No hay tarjetas disponibles</h3>
              <p>Vuelve más tarde para ver nuevas tarjetas</p>
            </div>
          ) : (
            tarjetas.map((tarjeta) => {
              const totalStamps = tarjeta.totalStamps || 10;
              const business = tarjeta.comercio;

              return (
                <StampCard
                  key={tarjeta.id}
                  id={tarjeta.id}
                  businessName={business?.name}
                  businessLogoUrl={business?.logoUrl}
                  cardName={tarjeta.nombre}
                  rewardText={tarjeta.valorRecompensa || 'Recompensa'}
                  totalStamps={totalStamps}
                  currentStamps={0}
                  showAddButton={true}
                  onAdd={() => handleAnadir(tarjeta.id)}
                  isAdding={addingId === tarjeta.id}
                  isAvailable={tarjeta.disponible}
                  showBadge={tarjeta.tipo === 'limitada' && tarjeta.limiteActual !== undefined}
                  badgeText={
                    tarjeta.tipo === 'limitada' && tarjeta.limiteActual !== undefined
                      ? `${tarjeta.limiteActual} disponibles`
                      : undefined
                  }
                  badgeColor="warning"
                  description={tarjeta.descripcion}
                />
              );
            })
          )}
        </div>
      </IonContent>

      {/* Success Alert */}
      <IonAlert
        isOpen={showSuccessAlert}
        onDidDismiss={() => setShowSuccessAlert(false)}
        header="¡Tarjeta añadida!"
        message={`${addedCardName} se ha añadido exitosamente a tu colección`}
        buttons={[
          {
            text: 'Ver mi colección',
            handler: () => {
              history.push('/tabs/home');
            }
          },
          {
            text: 'Continuar explorando',
            role: 'cancel'
          }
        ]}
        cssClass="success-alert"
      />

      {/* Error Alert */}
      <IonAlert
        isOpen={showErrorAlert}
        onDidDismiss={() => setShowErrorAlert(false)}
        header="Error"
        message={errorMessage}
        buttons={['OK']}
        cssClass="error-alert"
      />
    </IonPage>
  );
};

export default Explore;


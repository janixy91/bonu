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
  IonIcon,
  IonButton,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ticketOutline } from 'ionicons/icons';
import { tarjetaClienteService } from '../services/api.service';
import StampCard from '../components/StampCard';
import './Explore.css';

const Explore: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
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
      await tarjetaClienteService.anadirTarjeta(id);
      await loadTarjetas();
      alert('Tarjeta añadida exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al añadir tarjeta');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'rgba(26, 32, 44, 0.98)' }}>
          <IonTitle style={{ paddingLeft: '0.75rem', textAlign: 'left' }}>Explorar</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              onClick={() => history.push('/redeem-code')} 
              fill="outline"
              color="light"
              style={{ 
                marginRight: '0.5rem',
                '--border-radius': '8px',
                '--border-width': '2px',
                '--border-style': 'solid',
                '--border-color': 'rgba(255, 255, 255, 0.5)',
                fontWeight: '500'
              }}
            >
              <IonIcon icon={ticketOutline} slot="start" style={{ marginRight: '0.5rem' }} />
              Obtener sello
            </IonButton>
          </IonButtons>
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
                />
              );
            })
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Explore;


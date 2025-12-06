import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { tarjetaClienteService } from '../services/api.service';
import './TarjetasDisponibles.css';

const TarjetasDisponibles: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

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
        <IonToolbar color="primary">
          <IonTitle>Tarjetas Disponibles</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="tarjetas-container">
          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Cargando tarjetas...</p>
            </div>
          ) : tarjetas.length === 0 ? (
            <IonCard>
              <IonCardContent>
                <p className="empty-message">No hay tarjetas disponibles en este momento</p>
              </IonCardContent>
            </IonCard>
          ) : (
            <div className="tarjetas-list">
              {tarjetas.map((tarjeta) => (
                <IonCard key={tarjeta.id}>
                  <IonCardContent>
                    <div className="tarjeta-header">
                      <div className="tarjeta-info">
                        <h3>{tarjeta.nombre}</h3>
                        {tarjeta.descripcion && (
                          <p className="tarjeta-description">{tarjeta.descripcion}</p>
                        )}
                      </div>
                      {tarjeta.comercio && (
                        <IonBadge color="primary">
                          {tarjeta.comercio.name}
                        </IonBadge>
                      )}
                    </div>

                    <div className="tarjeta-details">
                      <IonItem>
                        <IonLabel>
                          <h4>Tipo</h4>
                          <p>{tarjeta.tipo === 'ilimitada' ? 'Ilimitada' : 'Limitada'}</p>
                        </IonLabel>
                      </IonItem>
                      {tarjeta.tipo === 'limitada' && (
                        <IonItem>
                          <IonLabel>
                            <h4>Disponibles</h4>
                            <p>{tarjeta.limiteActual || 0}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      <IonItem>
                        <IonLabel>
                          <h4>Recompensa</h4>
                          <p>{tarjeta.valorRecompensa}</p>
                        </IonLabel>
                      </IonItem>
                    </div>

                    <IonButton
                      expand="block"
                      onClick={() => handleAnadir(tarjeta.id)}
                      disabled={addingId === tarjeta.id || !tarjeta.disponible}
                    >
                      {addingId === tarjeta.id ? (
                        <>
                          <IonSpinner name="crescent" />
                          Añadiendo...
                        </>
                      ) : (
                        'Añadir Tarjeta'
                      )}
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TarjetasDisponibles;


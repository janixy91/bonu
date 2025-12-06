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
  IonProgressBar,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { tarjetaClienteService } from '../services/api.service';
import './MisTarjetas.css';

const MisTarjetas: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    loadTarjetas();
  }, []);

  const loadTarjetas = async () => {
    try {
      setLoading(true);
      const response = await tarjetaClienteService.getMisTarjetas();
      setTarjetas(response.tarjetas || []);
    } catch (error) {
      console.error('Error loading tarjetas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCanjear = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres canjear esta tarjeta?')) {
      return;
    }

    try {
      setRedeemingId(id);
      await tarjetaClienteService.canjearTarjeta(id);
      await loadTarjetas();
      alert('Tarjeta canjeada exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al canjear tarjeta');
    } finally {
      setRedeemingId(null);
    }
  };

  const getEstadoColor = (estadoCliente: string, estadoTarjeta: string) => {
    if (estadoCliente === 'canjeada') return 'success';
    if (estadoCliente === 'desactivada_por_bar' || estadoTarjeta === 'desactivada') return 'medium';
    return 'primary';
  };

  const getEstadoTexto = (estadoCliente: string, estadoTarjeta: string) => {
    if (estadoCliente === 'canjeada') return 'Canjeada';
    if (estadoCliente === 'desactivada_por_bar' || estadoTarjeta === 'desactivada') return 'Desactivada';
    return 'Activa';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Tarjetas</IonTitle>
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
                <p className="empty-message">No tienes tarjetas aún</p>
              </IonCardContent>
            </IonCard>
          ) : (
            <div className="tarjetas-list">
              {tarjetas.map((tarjeta) => {
                const puedeCanjear = tarjeta.estadoCliente === 'activa' && 
                                     tarjeta.estadoTarjeta === 'activa' &&
                                     (!tarjeta.totalStamps || tarjeta.sellosActuales >= tarjeta.totalStamps);

                return (
                  <IonCard key={tarjeta.tarjetaClienteId}>
                    <IonCardContent>
                      <div className="tarjeta-header">
                        <div className="tarjeta-info">
                          <h3>{tarjeta.nombre}</h3>
                          {tarjeta.descripcion && (
                            <p className="tarjeta-description">{tarjeta.descripcion}</p>
                          )}
                        </div>
                        <IonBadge color={getEstadoColor(tarjeta.estadoCliente, tarjeta.estadoTarjeta)}>
                          {getEstadoTexto(tarjeta.estadoCliente, tarjeta.estadoTarjeta)}
                        </IonBadge>
                      </div>

                      {tarjeta.comercio && (
                        <IonItem>
                          <IonLabel>
                            <h4>Comercio</h4>
                            <p>{tarjeta.comercio.name}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {tarjeta.totalStamps && (
                        <>
                          <IonItem>
                            <IonLabel>
                              <h4>Progreso</h4>
                              <p>{tarjeta.sellosActuales} / {tarjeta.totalStamps} sellos</p>
                            </IonLabel>
                          </IonItem>
                          <IonProgressBar
                            value={tarjeta.sellosActuales / tarjeta.totalStamps}
                            color="primary"
                          />
                        </>
                      )}

                      <IonItem>
                        <IonLabel>
                          <h4>Recompensa</h4>
                          <p>{tarjeta.valorRecompensa}</p>
                        </IonLabel>
                      </IonItem>

                      {tarjeta.fechaAnadida && (
                        <IonItem>
                          <IonLabel>
                            <h4>Añadida</h4>
                            <p>{new Date(tarjeta.fechaAnadida).toLocaleDateString()}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {puedeCanjear && (
                        <IonButton
                          expand="block"
                          color="success"
                          onClick={() => handleCanjear(tarjeta.tarjetaClienteId)}
                          disabled={redeemingId === tarjeta.tarjetaClienteId}
                        >
                          {redeemingId === tarjeta.tarjetaClienteId ? (
                            <>
                              <IonSpinner name="crescent" />
                              Canjeando...
                            </>
                          ) : (
                            'Canjear Tarjeta'
                          )}
                        </IonButton>
                      )}

                      {tarjeta.estadoCliente === 'canjeada' && tarjeta.fechaCanje && (
                        <IonItem>
                          <IonLabel>
                            <h4>Canjeada</h4>
                            <p>{new Date(tarjeta.fechaCanje).toLocaleDateString()}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MisTarjetas;


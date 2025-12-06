import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBadge,
  IonSpinner,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { add, createOutline, trashOutline, eyeOutline, logOut } from 'ionicons/icons';
import { tarjetaService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './TarjetasList.css';

const TarjetasList: React.FC = () => {
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadTarjetas();
  }, []);

  const loadTarjetas = async () => {
    try {
      setLoading(true);
      const response = await tarjetaService.getTarjetas();
      setTarjetas(response.tarjetas || []);
    } catch (error) {
      console.error('Error loading tarjetas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la tarjeta "${nombre}"?`)) {
      return;
    }

    try {
      await tarjetaService.deleteTarjeta(id);
      await loadTarjetas();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar tarjeta');
    }
  };

  const handleDesactivar = async (id: string) => {
    try {
      await tarjetaService.desactivarTarjeta(id);
      await loadTarjetas();
    } catch (error: any) {
      alert(error.message || 'Error al desactivar tarjeta');
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Tarjetas</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="tarjetas-container">
          <div className="header-actions">
            <IonButton onClick={() => history.push('/tarjetas/nueva')}>
              <IonIcon icon={add} slot="start" />
              Nueva Tarjeta
            </IonButton>
          </div>

          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Cargando tarjetas...</p>
            </div>
          ) : tarjetas.length === 0 ? (
            <IonCard>
              <IonCardContent>
                <p className="empty-message">No hay tarjetas creadas aún</p>
              </IonCardContent>
            </IonCard>
          ) : (
            <div className="tarjetas-list">
              {tarjetas.map((tarjeta) => (
                <IonCard key={tarjeta._id || tarjeta.id}>
                  <IonCardContent>
                    <div className="tarjeta-header">
                      <div className="tarjeta-info">
                        <h3>{tarjeta.nombre || tarjeta.title}</h3>
                        {tarjeta.descripcion && (
                          <p className="tarjeta-description">{tarjeta.descripcion}</p>
                        )}
                      </div>
                      <IonBadge
                        color={tarjeta.estado === 'activa' ? 'success' : 'danger'}
                        className={tarjeta.estado === 'activa' ? 'active-badge' : 'inactive-badge'}
                        onClick={() => tarjeta.estado === 'activa' && handleDesactivar(tarjeta._id || tarjeta.id)}
                      >
                        {tarjeta.estado === 'activa' ? 'Activa' : tarjeta.estado === 'desactivada' ? 'Desactivada' : 'Eliminada'}
                      </IonBadge>
                    </div>

                    <div className="tarjeta-details">
                      <IonItem>
                        <IonLabel>
                          <h4>Tipo</h4>
                          <p>{tarjeta.tipo === 'ilimitada' ? 'Ilimitada' : 'Limitada'}</p>
                        </IonLabel>
                      </IonItem>
                      {tarjeta.tipo === 'limitada' && (
                        <>
                          <IonItem>
                            <IonLabel>
                              <h4>Límite Total</h4>
                              <p>{tarjeta.limiteTotal}</p>
                            </IonLabel>
                          </IonItem>
                          <IonItem>
                            <IonLabel>
                              <h4>Disponibles</h4>
                              <p>{tarjeta.limiteActual || 0}</p>
                            </IonLabel>
                          </IonItem>
                        </>
                      )}
                      <IonItem>
                        <IonLabel>
                          <h4>Recompensa</h4>
                          <p>{tarjeta.valorRecompensa || tarjeta.rewardText}</p>
                        </IonLabel>
                      </IonItem>
                      {tarjeta.clientesConTarjeta !== undefined && (
                        <IonItem>
                          <IonLabel>
                            <h4>Clientes con tarjeta</h4>
                            <p>{tarjeta.clientesConTarjeta}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </div>

                    <div className="tarjeta-actions">
                      <IonButton
                        fill="outline"
                        size="small"
                        onClick={() => history.push(`/tarjetas/${tarjeta._id || tarjeta.id}`)}
                      >
                        <IonIcon icon={eyeOutline} slot="start" />
                        Ver
                      </IonButton>
                      <IonButton
                        fill="outline"
                        size="small"
                        onClick={() => history.push(`/tarjetas/${tarjeta._id || tarjeta.id}/editar`)}
                      >
                        <IonIcon icon={createOutline} slot="start" />
                        Editar
                      </IonButton>
                      {tarjeta.clientesConTarjeta === 0 && (
                        <IonButton
                          color="danger"
                          fill="outline"
                          size="small"
                          onClick={() => handleDelete(tarjeta._id || tarjeta.id, tarjeta.nombre || tarjeta.title)}
                        >
                          <IonIcon icon={trashOutline} slot="start" />
                          Eliminar
                        </IonButton>
                      )}
                    </div>
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

export default TarjetasList;


import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  IonButton,
} from '@ionic/react';
import { star, locationOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { pointsService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './Points.css';

const Points: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<Array<{
    business: {
      id: string;
      name: string;
      logoUrl: string | null;
    };
    totalPoints: number;
    checkInCount: number;
    lastCheckIn: string | null;
  }>>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
      return;
    }
    loadPoints();
  }, [isAuthenticated, history]);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await pointsService.getUserPoints();
      setPoints(data.points);
    } catch (err: any) {
      console.error('Error loading points:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (e: CustomEvent) => {
    await loadPoints();
    (e.target as HTMLIonRefresherElement).complete();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis Puntos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="points-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando puntos...</p>
          </div>
        ) : points.length === 0 ? (
          <div className="empty-container">
            <IonIcon icon={star} className="empty-icon" />
            <h2>No tienes puntos aún</h2>
            <p>Haz check-in en tus bares favoritos para empezar a acumular puntos</p>
            <IonButton onClick={() => history.push('/checkin')}>
              Hacer check-in
            </IonButton>
          </div>
        ) : (
          <div className="points-container">
            {points.map((point) => (
              <IonCard
                key={point.business.id}
                className="point-card"
                onClick={() => history.push(`/business/${point.business.id}`)}
              >
                <IonCardContent>
                  <div className="point-card-header">
                    {point.business.logoUrl && (
                      <img
                        src={point.business.logoUrl}
                        alt={point.business.name}
                        className="business-logo"
                      />
                    )}
                    <div className="point-card-info">
                      <h3>{point.business.name}</h3>
                      <p className="last-checkin">
                        Último check-in: {formatDate(point.lastCheckIn)}
                      </p>
                    </div>
                  </div>
                  <div className="point-card-footer">
                    <div className="points-display">
                      <IonIcon icon={star} className="star-icon" />
                      <span className="points-value">{point.totalPoints}</span>
                      <span className="points-label">puntos</span>
                    </div>
                    <IonBadge color="medium" className="checkin-count">
                      {point.checkInCount} check-ins
                    </IonBadge>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Points;


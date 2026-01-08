import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonSpinner,
} from '@ionic/react';
import { star, locationOutline, giftOutline } from 'ionicons/icons';
import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useIonViewWillEnter } from '@ionic/react';
import { useAuthStore } from '../store/authStore';
import { pointsService } from '../services/api.service';
import './Home.css';

const Home: React.FC = () => {
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
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const loadPoints = useCallback(async () => {
    try {
      console.log('[Home] Loading points...');
      setLoading(true);
      const data = await pointsService.getUserPoints();
      console.log('[Home] Points loaded:', data.points?.length || 0);
      setPoints(data.points || []);
    } catch (err: any) {
      console.error('[Home] Error loading points:', err);
      // Don't show error to user if it's just a loading issue
      // The error is already logged for debugging
      if (err.status === 401 || err.status === 403) {
        // Authentication error - this will be handled by the API service
        // Don't set points, but don't crash the app either
        setPoints([]);
      } else {
        // For other errors, still set empty array to prevent crashes
        setPoints([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Track previous user ID to detect user changes (important after logout/login)
  const [previousUserId, setPreviousUserId] = useState<string | undefined>(user?.id);
  
  // Reset state when user changes (important after logout/login)
  useEffect(() => {
    const currentUserId = user?.id;
    console.log('[Home] Auth state changed:', { 
      isAuthenticated, 
      userId: currentUserId,
      previousUserId,
      userChanged: currentUserId !== previousUserId
    });
    
    // If user changed or logged out, reset state
    if (currentUserId !== previousUserId) {
      console.log('[Home] User changed or logged out, resetting state');
      setPoints([]);
      setLoading(true); // Set to true so we show loading state
      setPreviousUserId(currentUserId);
    }
    
    if (!isAuthenticated || !user?.id) {
      // Reset state when logged out
      console.log('[Home] Not authenticated, resetting state');
      setPoints([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, previousUserId]);

  // Use Ionic lifecycle hook to ensure component is ready when view enters
  useIonViewWillEnter(() => {
    console.log('[Home] useIonViewWillEnter triggered:', { isAuthenticated, userId: user?.id });
    if (isAuthenticated && user?.id) {
      // Reset loading state and load fresh data
      setLoading(true);
      loadPoints();
    } else {
      setLoading(false);
    }
  });

  // Load points when authenticated and user is available
  useEffect(() => {
    console.log('[Home] useEffect triggered:', { isAuthenticated, userId: user?.id });
    // Only load points if user is authenticated and we have a user ID
    // This prevents API calls before token is ready after login
    if (isAuthenticated && user?.id) {
      // Don't load here - let useIonViewWillEnter handle it
      // This prevents double loading
    } else {
      console.log('[Home] Not authenticated or no user, setting loading to false');
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const handleRefresh = async (e: CustomEvent) => {
    try {
      await loadPoints();
    } catch (err) {
      console.error('[Home] Error refreshing points:', err);
    } finally {
      (e.target as HTMLIonRefresherElement).complete();
    }
  };

  const totalPoints = points.reduce((sum, p) => sum + (p.totalPoints || 0), 0);
  const totalCheckIns = points.reduce((sum, p) => sum + (p.checkInCount || 0), 0);

  console.log('[Home] Rendering:', { 
    loading, 
    pointsCount: points.length, 
    hasUser: !!user,
    userName: user?.name,
    isAuthenticated,
    totalPoints,
    totalCheckIns
  });

  // Ensure we always render something visible
  if (!isAuthenticated) {
    console.log('[Home] Not authenticated, showing loading state');
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>BONU</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="home-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  console.log('[Home] Rendering JSX...', {
    willRender: true,
    hasContent: true,
    loading,
    pointsCount: points.length
  });
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>BONU</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent 
        className="home-content" 
        style={{ 
          '--background': 'var(--ion-background-color)',
          opacity: 1,
          visibility: 'visible',
          display: 'block',
          position: 'relative',
          zIndex: 1
        } as any}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div 
          className="home-container" 
          style={{ 
            minHeight: '100%', 
            padding: '1rem',
            opacity: 1,
            visibility: 'visible',
            display: 'block'
          }}
        >
          {/* Welcome Card */}
          <IonCard className="welcome-card">
            <IonCardContent>
              <h1>¡Hola, {user?.name || 'Usuario'}!</h1>
              <p>Acumula puntos haciendo check-in en tus bares favoritos</p>
            </IonCardContent>
          </IonCard>

          {/* Stats Card */}
          <IonCard className="stats-card">
            <IonCardContent>
              <div className="stats-grid">
                <div className="stat-item">
                  <IonIcon icon={star} className="stat-icon" />
                  <div className="stat-value">{totalPoints}</div>
                  <div className="stat-label">Puntos totales</div>
                </div>
                <div className="stat-item">
                  <IonIcon icon={locationOutline} className="stat-icon" />
                  <div className="stat-value">{totalCheckIns}</div>
                  <div className="stat-label">Check-ins</div>
                </div>
                <div className="stat-item">
                  <IonIcon icon={giftOutline} className="stat-icon" />
                  <div className="stat-value">{points.length}</div>
                  <div className="stat-label">Bares</div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Quick Actions */}
          <div className="quick-actions">
            <IonButton
              expand="block"
              className="checkin-button"
              onClick={() => history.push('/tabs/checkin')}
            >
              <IonIcon icon={locationOutline} slot="start" />
              Hacer check-in
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              className="points-button"
              onClick={() => history.push('/tabs/points')}
            >
              <IonIcon icon={star} slot="start" />
              Ver mis puntos
            </IonButton>
          </div>

          {/* Points by Business */}
          {loading ? (
            <div className="loading-container">
              <IonSkeletonText animated style={{ width: '100%', height: '100px' }} />
              <IonSkeletonText animated style={{ width: '100%', height: '100px' }} />
            </div>
          ) : points.length === 0 ? (
            <IonCard className="empty-card">
              <IonCardContent>
                <IonIcon icon={locationOutline} className="empty-icon" />
                <h2>No tienes puntos aún</h2>
                <p>Haz check-in en tus bares favoritos para empezar a acumular puntos</p>
                <IonButton onClick={() => history.push('/tabs/checkin')}>
                  Hacer mi primer check-in
                </IonButton>
              </IonCardContent>
            </IonCard>
          ) : (
            <div className="points-list">
              <h2 className="section-title">Tus puntos por bar</h2>
              {points.slice(0, 5).map((point) => (
                <IonCard
                  key={point.business.id}
                  className="point-card"
                  onClick={() => history.push(`/business/${point.business.id}`)}
                >
                  <IonCardContent>
                    <div className="point-card-content">
                      {point.business.logoUrl && (
                        <img
                          src={point.business.logoUrl}
                          alt={point.business.name}
                          className="business-logo"
                        />
                      )}
                      <div className="point-card-info">
                        <h3>{point.business.name}</h3>
                        <div className="point-card-stats">
                          <span className="points-badge">
                            <IonIcon icon={star} />
                            {point.totalPoints} puntos
                          </span>
                          <span className="checkins-badge">{point.checkInCount} check-ins</span>
                        </div>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
              {points.length > 5 && (
                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={() => history.push('/tabs/points')}
                >
                  Ver todos los puntos
                </IonButton>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;

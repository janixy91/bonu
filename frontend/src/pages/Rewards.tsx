import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonButton,
  IonIcon,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
} from '@ionic/react';
import { giftOutline, star, checkmarkCircle } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { rewardService, pointsService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './Rewards.css';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  available: boolean;
}

const Rewards: React.FC = () => {
  const history = useHistory();
  const { businessId } = useParams<{ businessId: string }>();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
      return;
    }
    if (businessId) {
      loadRewards();
      loadUserPoints();
    }
  }, [isAuthenticated, businessId, history]);

  const loadRewards = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const data = await rewardService.getRewards(businessId);
      setRewards(data.rewards);
    } catch (err: any) {
      console.error('Error loading rewards:', err);
      setErrorMessage(err.message || 'Error al cargar recompensas');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPoints = async () => {
    if (!businessId) return;
    try {
      const data = await pointsService.getUserPoints(businessId);
      if (data.points.length > 0) {
        setUserPoints(data.points[0].totalPoints);
      }
    } catch (err: any) {
      console.error('Error loading user points:', err);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!businessId) return;
    if (userPoints < reward.pointsRequired) {
      setErrorMessage(`No tienes suficientes puntos. Necesitas ${reward.pointsRequired} puntos`);
      setShowErrorAlert(true);
      return;
    }

    setRedeeming(reward.id);

    try {
      const result = await rewardService.redeemReward(reward.id, businessId);
      setSuccessMessage(result.message || `¡Recompensa canjeada! ${reward.name}`);
      setShowSuccessAlert(true);
      await loadRewards();
      await loadUserPoints();
    } catch (err: any) {
      console.error('Error redeeming reward:', err);
      setErrorMessage(err.message || 'Error al canjear recompensa');
      setShowErrorAlert(true);
    } finally {
      setRedeeming(null);
    }
  };

  const handleRefresh = async (e: CustomEvent) => {
    await loadRewards();
    await loadUserPoints();
    (e.target as HTMLIonRefresherElement).complete();
  };

  if (!isAuthenticated || !businessId) {
    return null;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Recompensas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="rewards-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="rewards-container">
          {/* Points Display */}
          <IonCard className="points-card">
            <IonCardContent>
              <div className="points-display">
                <IonIcon icon={star} className="points-icon" />
                <div className="points-info">
                  <div className="points-value">{userPoints}</div>
                  <div className="points-label">Tus puntos</div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Rewards List */}
          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Cargando recompensas...</p>
            </div>
          ) : rewards.length === 0 ? (
            <IonCard className="empty-card">
              <IonCardContent>
                <IonIcon icon={giftOutline} className="empty-icon" />
                <h2>No hay recompensas disponibles</h2>
                <p>Este bar aún no ha configurado recompensas</p>
              </IonCardContent>
            </IonCard>
          ) : (
            <div className="rewards-list">
              {rewards.map((reward) => {
                const canAfford = userPoints >= reward.pointsRequired;
                const isAvailable = reward.available;

                return (
                  <IonCard
                    key={reward.id}
                    className={`reward-card ${!canAfford ? 'disabled' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                  >
                    <IonCardContent>
                      <div className="reward-header">
                        <div className="reward-info">
                          <h3>{reward.name}</h3>
                          {reward.description && <p className="reward-description">{reward.description}</p>}
                        </div>
                        <div className="reward-points">
                          <IonBadge color={canAfford ? 'primary' : 'medium'}>
                            <IonIcon icon={star} />
                            {reward.pointsRequired}
                          </IonBadge>
                        </div>
                      </div>
                      {reward.maxRedemptions && (
                        <div className="reward-limit">
                          {reward.redemptionCount} / {reward.maxRedemptions} canjeados
                        </div>
                      )}
                      <IonButton
                        expand="block"
                        disabled={!canAfford || !isAvailable || redeeming === reward.id}
                        onClick={() => handleRedeem(reward)}
                        className="redeem-button"
                      >
                        {redeeming === reward.id ? (
                          <>
                            <IonSpinner name="crescent" />
                            Canjeando...
                          </>
                        ) : !canAfford ? (
                          `Necesitas ${reward.pointsRequired - userPoints} puntos más`
                        ) : !isAvailable ? (
                          'No disponible'
                        ) : (
                          <>
                            <IonIcon icon={checkmarkCircle} slot="start" />
                            Canjear
                          </>
                        )}
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>
          )}
        </div>

        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={() => setShowSuccessAlert(false)}
          header="¡Éxito!"
          message={successMessage}
          buttons={['OK']}
        />

        <IonAlert
          isOpen={showErrorAlert}
          onDidDismiss={() => setShowErrorAlert(false)}
          header="Error"
          message={errorMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Rewards;


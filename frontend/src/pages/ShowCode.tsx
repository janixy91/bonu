import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonSpinner,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { otpService } from '../services/api.service';
import './ShowCode.css';

const ShowCode: React.FC = () => {
  const [code, setCode] = useState<string | null>(null);
  const [validUntil, setValidUntil] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchOTP = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await otpService.getCurrentOTP(user.id);
      setCode(response.code);
      setValidUntil(new Date(response.validUntil));
      setTimeLeft(Math.max(0, Math.floor((new Date(response.validUntil).getTime() - Date.now()) / 1000)));
    } catch (error) {
      console.error('Error fetching OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOTP();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!validUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((validUntil.getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Refresh code when it expires
      if (remaining === 0) {
        fetchOTP();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [validUntil]);

  const progressPercentage = validUntil
    ? Math.max(0, (timeLeft / 12) * 100) // 12 seconds validity
    : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mostrar código</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="show-code-content">
        <div className="code-container">
          <IonCard>
            <IonCardContent>
              {loading ? (
                <div className="loading-container">
                  <IonSpinner name="crescent" />
                  <p>Cargando código...</p>
                </div>
              ) : code ? (
                <>
                  <div className="code-display">
                    <h1 className="code-number">{code}</h1>
                    <p className="code-label">Muestra este código al comercio</p>
                  </div>

                  <div className="countdown-container">
                    <div className="countdown-bar">
                      <div
                        className="countdown-progress"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="countdown-text">
                      {timeLeft > 0 ? `El código se renovará en ${timeLeft}s` : 'Renovando código...'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="error-container">
                  <p>No se pudo cargar el código</p>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShowCode;


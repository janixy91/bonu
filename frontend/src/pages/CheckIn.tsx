import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonAlert,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/react';
import { checkmarkCircle, locationOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { checkinService, businessService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './CheckIn.css';

const CheckIn: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated } = useAuthStore();
  const [businessId, setBusinessId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [business, setBusiness] = useState<{ id: string; name: string; logoUrl: string | null } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      history.push('/login');
    }
  }, [isAuthenticated, history]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Por favor, introduce un código');
      return;
    }

    setCheckingIn(true);
    setError(null);

    try {
      // Buscar el bar por código (asumiendo que el código es el businessId)
      // En el futuro, esto podría ser un código especial que se mapea a businessId
      const result = await checkinService.createCheckIn(code, 'code');
      setSuccessMessage(
        `¡Check-in exitoso! +${result.checkIn.points} puntos. Total: ${result.totalPoints} puntos`
      );
      setShowSuccessAlert(true);
      setCode('');

      setTimeout(() => {
        history.push('/tabs/home');
      }, 2000);
    } catch (err: any) {
      console.error('Error checking in:', err);
      setError(err.message || 'Error al registrar check-in');
      setShowErrorAlert(true);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleBusinessCheckIn = async (id: string) => {
    setCheckingIn(true);
    setError(null);

    try {
      const result = await checkinService.createCheckIn(id, 'code');
      setSuccessMessage(
        `¡Check-in exitoso! +${result.checkIn.points} puntos. Total: ${result.totalPoints} puntos`
      );
      setShowSuccessAlert(true);

      setTimeout(() => {
        history.push('/tabs/home');
      }, 2000);
    } catch (err: any) {
      console.error('Error checking in:', err);
      setError(err.message || 'Error al registrar check-in');
      setShowErrorAlert(true);
    } finally {
      setCheckingIn(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Check-in</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="checkin-content">
        <div className="checkin-container">
          <IonCard className="info-card">
            <IonCardContent>
              <IonIcon icon={locationOutline} className="info-icon" />
              <h2>Haz check-in en tu bar favorito</h2>
              <p>Acerca tu móvil a la NFC o introduce el código del local</p>
            </IonCardContent>
          </IonCard>

          <IonCard className="code-card">
            <IonCardContent>
              <form onSubmit={handleCodeSubmit}>
                <IonItem lines="none" className="code-input-item">
                  <IonLabel position="stacked">Código del local</IonLabel>
                  <IonInput
                    type="text"
                    value={code}
                    onIonInput={(e) => setCode(e.detail.value!)}
                    placeholder="Introduce el código"
                    required
                    disabled={checkingIn}
                  />
                </IonItem>
                <IonButton
                  expand="block"
                  type="submit"
                  disabled={checkingIn || !code.trim()}
                  className="checkin-button"
                >
                  {checkingIn ? (
                    <>
                      <IonSpinner name="crescent" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <IonIcon icon={checkmarkCircle} slot="start" />
                      Hacer check-in
                    </>
                  )}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
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
          message={error || 'Error al registrar check-in'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default CheckIn;


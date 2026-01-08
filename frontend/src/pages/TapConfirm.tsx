import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonImg,
  IonSpinner,
  IonAlert,
  IonIcon,
} from '@ionic/react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { tapService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './TapConfirm.css';

const TapConfirm: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [addingStamp, setAddingStamp] = useState(false);
  const [business, setBusiness] = useState<{ id: string; name: string; logoUrl: string | null } | null>(null);
  const [tapIntentId, setTapIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(location.search);
    const intentId = params.get('tapIntentId');
    const barId = params.get('barId') || params.get('local'); // Soporta ambos nombres

    if (intentId) {
      // Si ya tenemos un tapIntentId, cargarlo directamente
      setTapIntentId(intentId);
      loadTapIntent(intentId);
    } else if (barId) {
      // Si tenemos barId/local, crear un nuevo TapIntent
      createTapIntentFromBarId(barId);
    } else {
      setError('No se encontró el identificador de bar o tap');
      setLoading(false);
    }
  }, [location]);

  const createTapIntentFromBarId = async (barId: string) => {
    try {
      const data = await tapService.createTapIntent(barId);
      setTapIntentId(data.tapIntentId);
      setBusiness(data.business);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      console.error('Error creating tap intent:', err);
      setError(err.message || 'Error al crear la intención de tap');
      setLoading(false);
    }
  };

  const loadTapIntent = async (intentId: string) => {
    try {
      const data = await tapService.getTapIntent(intentId);
      setBusiness(data.business);
      setError(null);
    } catch (err: any) {
      console.error('Error loading tap intent:', err);
      setError(err.message || 'Error al cargar la información del tap');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStamp = async () => {
    if (!tapIntentId) return;

    setAddingStamp(true);
    setError(null);

    try {
      const result = await tapService.addStampFromTap(tapIntentId);
      setSuccessMessage(
        result.message || `¡Check-in exitoso! +${result.checkIn.points} puntos. Total: ${result.totalPoints} puntos`
      );
      setShowSuccessAlert(true);

      // Redirigir a home después de 2 segundos
      setTimeout(() => {
        history.push('/tabs/home');
      }, 2000);
    } catch (err: any) {
      console.error('Error adding check-in:', err);
      setError(err.message || 'Error al registrar check-in');
      setShowErrorAlert(true);
    } finally {
      setAddingStamp(false);
    }
  };

  // Si no está autenticado, redirigir a login preservando los parámetros
  useEffect(() => {
    if (!isAuthenticated) {
      const params = new URLSearchParams(location.search);
      const intentId = params.get('tapIntentId');
      const barId = params.get('barId') || params.get('local');
      
      if (intentId) {
        history.push(`/login?redirect=/tap?tapIntentId=${intentId}`);
      } else if (barId) {
        history.push(`/login?redirect=/tap?local=${barId}`);
      } else {
        history.push('/login');
      }
    }
  }, [isAuthenticated, location, history]);

  if (!isAuthenticated) {
    return null; // El redirect se maneja en el useEffect
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Check-in</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="tap-confirm-content">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando información...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <IonIcon icon={closeCircle} className="error-icon" />
            <p>{error}</p>
            <IonButton onClick={() => history.push('/tabs/home')}>
              Volver al inicio
            </IonButton>
          </div>
        ) : business ? (
          <div className="tap-confirm-container">
            <IonCard className="business-card">
              <IonCardContent>
                {business.logoUrl && (
                  <IonImg src={business.logoUrl} alt={business.name} className="business-logo" />
                )}
                <h2 className="business-name">{business.name}</h2>
              </IonCardContent>
            </IonCard>

            <IonCard className="confirmation-card">
              <IonCardContent>
                <p className="confirmation-text">
                  ¿Quieres hacer check-in en este local?
                </p>
                <IonButton
                  expand="block"
                  onClick={handleAddStamp}
                  disabled={addingStamp}
                  className="add-stamp-button"
                >
                  {addingStamp ? (
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
              </IonCardContent>
            </IonCard>
          </div>
        ) : null}

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
          message={error || 'Error al añadir el sello'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default TapConfirm;


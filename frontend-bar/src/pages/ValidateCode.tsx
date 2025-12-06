import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon,
  IonButtons,
} from '@ionic/react';
import { useState } from 'react';
import { checkmarkCircle, closeCircle, logOut, ticketOutline } from 'ionicons/icons';
import { stampService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import { useHistory } from 'react-router-dom';
import './ValidateCode.css';

const ValidateCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const handleCodeSubmit = async () => {
    if (code.length !== 5 || !/^\d{5}$/.test(code)) {
      setResult({ success: false, message: 'El código debe tener 5 dígitos' });
      return;
    }

    try {
      setValidating(true);
      setResult(null);

      const response = await stampService.validateCode(code);
      
      setResult({
        success: true,
        message: `¡Consumición validada! Sello añadido correctamente.`,
      });
      
      // Reset code after successful validation
      setCode('');
      
      // Clear result after 3 seconds
      setTimeout(() => {
        setResult(null);
      }, 3000);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error al validar el código',
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Validar Código</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="validate-code-content">
        <div className="validate-container">
          <IonCard>
            <IonCardContent>
              {user && (
                <div className="user-info">
                  <p className="welcome-text">Bienvenido, {user.name}</p>
                </div>
              )}

              <h2 className="section-title">Ingresa el código del cliente</h2>
              <p className="section-description">
                Ingresa el código de 5 dígitos que muestra el cliente en su app
              </p>

              <IonItem>
                <IonLabel position="stacked">Código</IonLabel>
                <IonInput
                  type="text"
                  value={code}
                  onIonInput={(e) => setCode(e.detail.value!)}
                  placeholder="00000"
                  maxlength={5}
                  inputMode="numeric"
                  className="code-input"
                  autofocus
                />
              </IonItem>

              {result && (
                <div className={`result-container ${result.success ? 'success' : 'error'}`}>
                  <IonIcon
                    icon={result.success ? checkmarkCircle : closeCircle}
                    size="large"
                  />
                  <IonText color={result.success ? 'success' : 'danger'}>
                    {result.message}
                  </IonText>
                </div>
              )}

              <IonButton
                expand="block"
                onClick={handleCodeSubmit}
                disabled={code.length !== 5 || validating}
                className="submit-button"
              >
                {validating ? (
                  <>
                    <IonSpinner name="crescent" />
                    Validando...
                  </>
                ) : (
                  'Validar consumición'
                )}
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardContent>
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => history.push('/promo-cards')}
                className="promo-cards-button"
              >
                <IonIcon icon={ticketOutline} slot="start" />
                Gestionar Tarjetas Promocionales
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ValidateCode;


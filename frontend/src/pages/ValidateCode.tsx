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
} from '@ionic/react';
import { useState } from 'react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { stampService } from '../services/api.service';
import './ValidateCode.css';

const ValidateCode: React.FC = () => {
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [pinEntered, setPinEntered] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handlePinSubmit = () => {
    // TODO: Validate PIN against backend
    // For now, just accept any 4-digit PIN
    if (pin.length === 4 && /^\d{4}$/.test(pin)) {
      setPinEntered(true);
      setResult(null);
    } else {
      setResult({ success: false, message: 'PIN debe tener 4 dígitos' });
    }
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
        message: `¡Consumición validada! Sello añadido a la tarjeta.`,
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

  const handleBack = () => {
    setPinEntered(false);
    setPin('');
    setCode('');
    setResult(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Validar código</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="validate-code-content">
        <div className="validate-container">
          <IonCard>
            <IonCardContent>
              {!pinEntered ? (
                <>
                  <h2 className="section-title">Ingresa tu PIN</h2>
                  <p className="section-description">
                    Ingresa tu PIN de 4 dígitos para continuar
                  </p>

                  <IonItem>
                    <IonLabel position="stacked">PIN</IonLabel>
                    <IonInput
                      type="password"
                      value={pin}
                      onIonInput={(e) => setPin(e.detail.value!)}
                      placeholder="0000"
                      maxlength={4}
                      inputMode="numeric"
                    />
                  </IonItem>

                  {result && !result.success && (
                    <div className="result-container error">
                      <IonIcon icon={closeCircle} size="large" />
                      <IonText color="danger">{result.message}</IonText>
                    </div>
                  )}

                  <IonButton
                    expand="block"
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 4}
                    className="submit-button"
                  >
                    Continuar
                  </IonButton>
                </>
              ) : (
                <>
                  <h2 className="section-title">Ingresa el código del cliente</h2>
                  <p className="section-description">
                    Ingresa el código de 5 dígitos que muestra el cliente
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

                  <div className="button-group">
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

                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={handleBack}
                      className="back-button"
                    >
                      Volver
                    </IonButton>
                  </div>
                </>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ValidateCode;


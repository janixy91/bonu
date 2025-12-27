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
  IonMenuButton,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { checkmarkCircle, closeCircle, ticketOutline, qrCodeOutline, arrowBack, close, phonePortraitOutline } from 'ionicons/icons';
import { codeService, otpService } from '../services/api.service';
import { useAuthStore } from '../store/authStore';
import './RedeemCode.css';

interface RedeemedCode {
  code: string;
  businessName: string;
  benefitName: string;
  redeemedAt: string;
}

const RedeemCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      businessName: string;
      benefitName: string;
      redeemedAt: string;
    };
  } | null>(null);
  const [redeemedHistory, setRedeemedHistory] = useState<RedeemedCode[]>([]);
  
  // OTP Code state
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpValidUntil, setOtpValidUntil] = useState<Date | null>(null);
  const [otpTimeLeft, setOtpTimeLeft] = useState<number>(0);
  const [otpLoading, setOtpLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const history = useHistory();

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('bonu-redeemed-codes');
    if (savedHistory) {
      try {
        setRedeemedHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Fetch OTP code
  const fetchOTP = async () => {
    if (!user?.id) return;

    try {
      setOtpLoading(true);
      const response = await otpService.getCurrentOTP(user.id);
      setOtpCode(response.code);
      setOtpValidUntil(new Date(response.validUntil));
      setOtpTimeLeft(Math.max(0, Math.floor((new Date(response.validUntil).getTime() - Date.now()) / 1000)));
    } catch (error) {
      console.error('Error fetching OTP:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOTP();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!otpValidUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpValidUntil.getTime() - Date.now()) / 1000));
      setOtpTimeLeft(remaining);

      // Refresh code when it expires
      if (remaining === 0) {
        fetchOTP();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpValidUntil]);

  const handleCodeChange = (value: string) => {
    // Auto-uppercase and filter alphanumeric
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (normalized.length <= 10) {
      setCode(normalized);
      setResult(null);
    }
  };

  const handleRedeem = async () => {
    if (!code.trim() || code.length < 6) {
      setResult({
        success: false,
        message: 'El código debe tener entre 6 y 10 caracteres',
      });
      return;
    }

    try {
      setValidating(true);
      setResult(null);

      const response = await codeService.redeemCode(code);

      const redeemedCode: RedeemedCode = {
        code: code.toUpperCase(),
        businessName: response.business,
        benefitName: response.benefit,
        redeemedAt: response.used_at,
      };

      // Add to history
      const newHistory = [redeemedCode, ...redeemedHistory].slice(0, 10); // Keep last 10
      setRedeemedHistory(newHistory);
      localStorage.setItem('bonu-redeemed-codes', JSON.stringify(newHistory));

      setResult({
        success: true,
        message: '¡Código canjeado exitosamente!',
        data: {
          businessName: response.business,
          benefitName: response.benefit,
          redeemedAt: response.used_at,
        },
      });

      // Clear code after success
      setCode('');
    } catch (error: any) {
      let errorMessage = 'Error al canjear el código';
      
      // Check status code from error
      if (error.status === 409) {
        errorMessage = 'Este código ya fue utilizado';
      } else if (error.status === 404) {
        errorMessage = 'Código no válido';
      } else if (error.status === 410) {
        errorMessage = 'Este código ha caducado';
      } else if (error.message) {
        // Fallback to error message if status not available
        errorMessage = error.message;
      }

      setResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const otpProgressPercentage = otpValidUntil
    ? Math.max(0, (otpTimeLeft / 12) * 100) // 12 seconds validity
    : 0;

  const handleBack = () => {
    history.push('/tabs/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'rgba(26, 32, 44, 0.98)' }}>
          <IonButtons slot="start">
            <IonMenuButton color="light" />
          </IonButtons>
          <IonTitle>Canjear código</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleBack} className="header-button">
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="redeem-code-content" style={{ paddingBottom: '100px' }}>
        <div className="redeem-container">
          {/* NFC Section */}
          <IonCard className="nfc-section-card">
            <IonCardContent>
              <div className="nfc-section">
                <IonIcon icon={phonePortraitOutline} size="large" className="nfc-icon" />
                <h2 className="section-title">Usa NFC</h2>
                <p className="section-description">
                  Pide al camarero que acerque su dispositivo NFC de Bonu a tu teléfono
                </p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Separator */}
          <div className="section-separator">
            <span className="separator-text">ó</span>
          </div>

          {/* Generate OTP Code Section */}
          {/* <IonCard>
            <IonCardContent>
              <div className="otp-code-section">
                <IonIcon icon={qrCodeOutline} size="large" className="otp-icon" />
                <h2 className="section-title">Genera tu código</h2>
                <p className="section-description">
                  Muestra este código al establecimiento para que añadan un sello a tu tarjeta
                </p>

                {otpLoading ? (
                  <div className="otp-loading-container">
                    <IonSpinner name="crescent" />
                    <p>Cargando código...</p>
                  </div>
                ) : otpCode ? (
                  <>
                    <div className="otp-code-display">
                      <h1 className="otp-code-number">{otpCode}</h1>
                      <p className="otp-code-label">Muestra este código al comercio</p>
                    </div>

                    <div className="otp-countdown-container">
                      <div className="otp-countdown-bar">
                        <div
                          className="otp-countdown-progress"
                          style={{ width: `${otpProgressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="otp-countdown-text">
                        {otpTimeLeft > 0 ? `El código se renovará en ${otpTimeLeft}s` : 'Renovando código...'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="otp-error-container">
                    <p>No se pudo cargar el código</p>
                    <IonButton fill="outline" onClick={fetchOTP}>
                      Reintentar
                    </IonButton>
                  </div>
                )}
              </div>
            </IonCardContent>
          </IonCard> */}

          {/* Redeem Code Section */}
          <IonCard>
            <IonCardContent>
              <div className="code-input-section">
                <IonIcon icon={ticketOutline} size="large" className="ticket-icon" />
                <h2 className="section-title">Introduce un código</h2>
                <p className="section-description">
                  Ingresa el código de tu cupón o papel para canjear tu sello
                </p>

                <IonItem className="code-input-item">
                  <IonLabel position="stacked">Código</IonLabel>
                  <IonInput
                    type="text"
                    value={code}
                    onIonInput={(e) => handleCodeChange(e.detail.value!)}
                    placeholder="..."
                    maxlength={10}
                    className="code-input"
                    disabled={validating}
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
                    {result.success && result.data && (
                      <div className="success-details">
                        <div className="detail-item">
                          <strong>Bar:</strong> {result.data.businessName}
                        </div>
                        <div className="detail-item">
                          <strong>Beneficio:</strong> {result.data.benefitName}
                        </div>
                        <div className="detail-item">
                          <strong>Canjeado el:</strong> {formatDate(result.data.redeemedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <IonButton
                  expand="block"
                  onClick={handleRedeem}
                  disabled={code.length < 3 || validating}
                  className="submit-button"
                >
                  {validating ? (
                    <>
                      <IonSpinner name="crescent" />
                      Validando...
                    </>
                  ) : (
                    'Validar código'
                  )}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {redeemedHistory.length > 0 && (
            <IonCard className="history-card">
              <IonCardContent>
                <h3 className="history-title">Historial de códigos canjeados</h3>
                <div className="history-list">
                  {redeemedHistory.map((item, index) => (
                    <div key={index} className="history-item">
                      <div className="history-code">{item.code}</div>
                      <div className="history-details">
                        <div className="history-benefit">{item.benefitName}</div>
                        <div className="history-business">{item.businessName}</div>
                        <div className="history-date">{formatDate(item.redeemedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RedeemCode;


import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonTextarea,
  useIonViewWillEnter,
} from '@ionic/react';
import { useState, useRef } from 'react';
import { pilotService } from '../services/api.service';
import './Register.css';

const Register: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);

  useIonViewWillEnter(() => {
    contentRef.current?.scrollToTop(0);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await pilotService.registerPilot({
        businessName: businessName.trim(),
        email: email.trim(),
        contactName: contactName.trim(),
        address: address.trim(),
      });
      
      setSuccess(true);
      // Reset form
      setBusinessName('');
      setEmail('');
      setContactName('');
      setAddress('');
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud de registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} className="register-content">
        <div className="register-container">
          <div className="register-card">
            <div className="logo-container">
              <img 
                src="/assets/logo-transparente.png" 
                alt="BONU Logo" 
                className="register-logo"
              />
            </div>

            <h1 className="register-title">Registro al Programa Piloto</h1>
            <p className="register-subtitle">Completa el formulario para unirte al programa piloto de BONU</p>

            {success && (
              <div className="success-container">
                <IonText color="success">
                  <strong>¡Solicitud enviada correctamente!</strong>
                  <p>Te contactaremos pronto.</p>
                </IonText>
              </div>
            )}

            {error && (
              <div className="error-container">
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="register-form">
                <div className="input-wrapper">
                  <IonItem className="custom-input-item" lines="none">
                    <IonLabel position="stacked" className="input-label">
                      Nombre del Negocio *
                    </IonLabel>
                    <IonInput
                      type="text"
                      value={businessName}
                      onIonInput={(e) => setBusinessName(e.detail.value!)}
                      required
                      className="custom-input"
                      placeholder="Ej: Bar El Centro"
                    />
                  </IonItem>
                </div>

                <div className="input-wrapper">
                  <IonItem className="custom-input-item" lines="none">
                    <IonLabel position="stacked" className="input-label">
                      Email *
                    </IonLabel>
                    <IonInput
                      type="email"
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      required
                      className="custom-input"
                      placeholder="tu@email.com"
                    />
                  </IonItem>
                </div>

                <div className="input-wrapper">
                  <IonItem className="custom-input-item" lines="none">
                    <IonLabel position="stacked" className="input-label">
                      Nombre de Contacto *
                    </IonLabel>
                    <IonInput
                      type="text"
                      value={contactName}
                      onIonInput={(e) => setContactName(e.detail.value!)}
                      required
                      className="custom-input"
                      placeholder="Tu nombre completo"
                    />
                  </IonItem>
                </div>

                <div className="input-wrapper">
                  <IonItem className="custom-input-item" lines="none">
                    <IonLabel position="stacked" className="input-label">
                      Dirección para el Pack de Bienvenida *
                    </IonLabel>
                    <IonTextarea
                      value={address}
                      onIonInput={(e) => setAddress(e.detail.value!)}
                      required
                      className="custom-textarea"
                      placeholder="Calle, número, código postal, ciudad..."
                      rows={3}
                    />
                  </IonItem>
                </div>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={loading}
                  className="register-button"
                >
                  {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
                </IonButton>
              </form>
            )}

            {/* <div className="register-footer">
              <IonText className="footer-text">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="login-link">
                  Inicia sesión
                </Link>
              </IonText>
            </div> */}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;


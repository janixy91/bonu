import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  useIonViewWillEnter,
} from '@ionic/react';
import { useState, useRef } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Register.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const register = useAuthStore((state) => state.register);
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Scroll to top when view enters
  useIonViewWillEnter(() => {
    contentRef.current?.scrollToTop(0);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      // Small delay to ensure state is persisted
      setTimeout(() => {
        window.location.href = '/tabs/home';
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
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

            <h1 className="register-title">Crear Cuenta</h1>
            <p className="register-subtitle">Regístrate para comenzar</p>

            {error && (
              <div className="error-container">
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="input-wrapper">
                <IonItem className="custom-input-item" lines="none">
                  <IonLabel position="stacked" className="input-label">
                    Nombre
                  </IonLabel>
                  <IonInput
                    type="text"
                    value={name}
                    onIonInput={(e) => setName(e.detail.value!)}
                    required
                    className="custom-input"
                    placeholder="Tu nombre"
                  />
                </IonItem>
              </div>

              <div className="input-wrapper">
                <IonItem className="custom-input-item" lines="none">
                  <IonLabel position="stacked" className="input-label">
                    Email
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
                    Contraseña
                  </IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value!)}
                    required
                    className="custom-input"
                    placeholder="••••••••"
                    minlength={6}
                  />
                </IonItem>
              </div>

              <div className="input-wrapper">
                <IonItem className="custom-input-item" lines="none">
                  <IonLabel position="stacked" className="input-label">
                    Confirmar Contraseña
                  </IonLabel>
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                    required
                    className="custom-input"
                    placeholder="••••••••"
                    minlength={6}
                  />
                </IonItem>
              </div>

              <IonButton
                expand="block"
                type="submit"
                disabled={loading}
                className="register-button"
              >
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </IonButton>
            </form>

            <div className="register-footer">
              <IonText className="footer-text">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="login-link">
                  Inicia sesión
                </Link>
              </IonText>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;


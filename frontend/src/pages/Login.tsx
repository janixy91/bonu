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
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const login = useAuthStore((state) => state.login);
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Scroll to top when view enters
  useIonViewWillEnter(() => {
    contentRef.current?.scrollToTop(0);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Small delay to ensure state is persisted
      setTimeout(() => {
        window.location.href = '/tabs/home';
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent ref={contentRef} className="login-content">
        <div className="login-container">
          <div className="login-card">
            <div className="logo-container">
              <img 
                src="/assets/logo-transparente.png" 
                alt="BONU Logo" 
                className="login-logo"
              />
            </div>

            <h1 className="login-title">Bienvenido</h1>
            <p className="login-subtitle">Inicia sesión para continuar</p>

            {error && (
              <div className="error-container">
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
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
                  />
                </IonItem>
              </div>

              <IonButton
                expand="block"
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </IonButton>
            </form>

            <div className="login-footer">
              <IonText className="footer-text">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="register-link">
                  Regístrate
                </Link>
              </IonText>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;


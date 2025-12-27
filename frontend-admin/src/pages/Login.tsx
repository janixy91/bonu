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
import { useHistory } from 'react-router-dom';
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
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        history.push('/admin/dashboard');
      } else if (user?.role === 'business_owner') {
        history.push('/business-owner/dashboard');
      } else {
        setError('No tienes permisos para acceder a este panel');
        useAuthStore.getState().logout();
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
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
                onError={(e) => {
                  // Fallback si no se encuentra el logo
                  console.error('Logo not found at /assets/logo-transparente.png');
                }}
              />
            </div>

            <h1 className="login-title">Panel de Administración</h1>
            <p className="login-subtitle">Acceso para administradores y dueños de negocios</p>

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
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;


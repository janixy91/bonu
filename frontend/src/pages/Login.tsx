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
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/tabs/home';
  };

  // Scroll to top when view enters
  useIonViewWillEnter(() => {
    contentRef.current?.scrollToTop(0);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[Login] Starting login...');
      await login(email, password);
      console.log('[Login] Login successful, checking auth state...');
      
      // Wait for Zustand to persist state to localStorage
      // Check that token is actually saved before navigating
      let attempts = 0;
      const maxAttempts = 20;
      while (attempts < maxAttempts) {
        const stored = localStorage.getItem('bonu-auth-storage');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state?.accessToken && parsed.state?.isAuthenticated) {
              console.log('[Login] Token confirmed in localStorage, safe to navigate');
              break; // Token is saved, safe to navigate
            }
          } catch (e) {
            // Continue waiting
          }
        }
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }
      
      // Also verify the store state is updated
      const currentState = useAuthStore.getState();
      console.log('[Login] Final state check:', {
        isAuthenticated: currentState.isAuthenticated,
        hasAccessToken: !!currentState.accessToken,
        hasUser: !!currentState.user
      });
      
      // After logout/login, force a full page reload to ensure clean state
      // This prevents issues with IonRouterOutlet and IonTabs not properly remounting
      const redirectUrl = getRedirectUrl();
      console.log('[Login] Navigating to:', redirectUrl);
      console.log('[Login] Forcing full page reload to ensure clean state...');
      
      // Use window.location.href to force a complete page reload
      // This ensures all components remount cleanly after logout/login
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('[Login] Login error:', err);
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


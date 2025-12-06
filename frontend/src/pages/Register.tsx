import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Auth.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name);
      history.push('/tabs/home');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>BONU</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="auth-content">
        <div className="auth-container">
          <IonCard>
            <IonCardContent>
              <h2 className="auth-title">Crear Cuenta</h2>

              {error && (
                <IonText color="danger" className="error-message">
                  {error}
                </IonText>
              )}

              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonLabel position="stacked">Nombre</IonLabel>
                  <IonInput
                    type="text"
                    value={name}
                    onIonInput={(e) => setName(e.detail.value!)}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Contraseña</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value!)}
                    required
                    minlength={6}
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={loading}
                  className="auth-button"
                >
                  {loading ? 'Creando cuenta...' : 'Registrarse'}
                </IonButton>
              </form>

              <div className="auth-footer">
                <IonText>
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="auth-link">
                    Inicia sesión
                  </Link>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;


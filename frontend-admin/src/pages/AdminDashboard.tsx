import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { logOut, add, business } from 'ionicons/icons';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/api.service';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllBusinesses();
      setBusinesses(response.businesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este negocio?')) {
      return;
    }

    try {
      await adminService.deleteBusiness(id);
      await loadBusinesses();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar negocio');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Panel de Administración</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} className="logout-button">
              <IonIcon icon={logOut} slot="start" />
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h2>Negocios Registrados</h2>
                    <IonButton onClick={() => history.push('/admin/create-business')}>
              <IonIcon icon={add} slot="start" />
              Nuevo Negocio
            </IonButton>
          </div>

          {loading ? (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Cargando negocios...</p>
            </div>
          ) : businesses.length === 0 ? (
            <IonCard>
              <IonCardContent>
                <p className="empty-message">No hay negocios registrados</p>
              </IonCardContent>
            </IonCard>
          ) : (
            <div className="businesses-list">
              {businesses.map((business) => (
                <IonCard key={business._id}>
                  <IonCardContent>
                    <div className="business-header">
                      <div className="business-info">
                        <h3>{business.name}</h3>
                        <p className="business-owner">
                          Propietario: ({business.ownerId?.email || 'N/A'})
                        </p>
                        {business.description && (
                          <p className="business-description">{business.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="business-actions">
                      <IonButton
                        fill="outline"
                        onClick={() => history.push(`/admin/businesses/${business._id}`)}
                      >
                        Ver Detalles
                      </IonButton>
                      <IonButton
                        color="danger"
                        fill="outline"
                        onClick={() => handleDelete(business._id)}
                      >
                        Eliminar
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;


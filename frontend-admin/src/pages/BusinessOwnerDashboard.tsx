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
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonBadge,
  IonSkeletonText,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { logOut, peopleOutline, statsChartOutline, ticketOutline, timeOutline, settingsOutline } from 'ionicons/icons';
import { useAuthStore } from '../store/authStore';
import { businessOwnerService } from '../services/api.service';
import './BusinessOwnerDashboard.css';
import './BusinessDetails.css';

const BusinessOwnerDashboard: React.FC = () => {
  const [business, setBusiness] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const businessResponse = await businessOwnerService.getMyBusiness();
      const businessData = businessResponse.business;
      setBusiness(businessData);
      
      // Load check-in statistics
      if (businessData && (businessData._id || businessData.id)) {
        try {
          const statsResponse = await businessOwnerService.getBusinessStats(businessData._id || businessData.id);
          setStats(statsResponse);
        } catch (statsErr) {
          console.error('Error loading stats:', statsErr);
          // Don't fail the whole page if stats fail
        }
      }
    } catch (err: any) {
      console.error('Error loading business:', err);
      // Set business to null if there's an error
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle className="business-title">Mi Negocio</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout} className="logout-button">
                <IonIcon icon={logOut} slot="start" />
                Salir
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Cargando...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!business) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle className="business-title">Mi Negocio</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout} className="logout-button">
                <IonIcon icon={logOut} slot="start" />
                Salir
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardContent>
              <p>No se encontró un negocio asociado a tu cuenta.</p>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="business-title">Mi Negocio</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} className="logout-button">
              <IonIcon icon={logOut} slot="start" />
              Salir
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="details-container">
          {/* Quick Actions */}
          <div className="quick-actions-bar">
            <IonButton
              fill="clear"
              size="small"
              onClick={() => history.push('/business-owner/info')}
              className="info-button"
            >
              <IonIcon icon={settingsOutline} slot="start" />
              Información del Negocio
            </IonButton>
            <IonButton
              fill="clear"
              size="small"
              onClick={() => history.push('/business-owner/generate-codes')}
              className="generate-codes-button-small"
            >
              <IonIcon icon={ticketOutline} slot="start" />
              Generar puntos extra
            </IonButton>
          </div>

          {/* Check-in Statistics Section */}
          <IonCard>
            <IonCardContent>
              <div className="cards-header">
                <h2 className="section-title">
                  <IonIcon icon={statsChartOutline} slot="start" />
                  Estadísticas de Check-ins
                </h2>
              </div>

              {stats ? (
                <div className="stats-container">
                  {/* Summary Stats */}
                  <div className="stats-grid">
                    <IonCard className="stat-card">
                      <IonCardContent>
                        <IonIcon icon={peopleOutline} className="stat-icon" />
                        <div className="stat-value">{stats.stats.totalCustomers || 0}</div>
                        <div className="stat-label">Clientes Totales</div>
                      </IonCardContent>
                    </IonCard>
                    <IonCard className="stat-card">
                      <IonCardContent>
                        <IonIcon icon={statsChartOutline} className="stat-icon" />
                        <div className="stat-value">{stats.stats.totalCheckIns || 0}</div>
                        <div className="stat-label">Check-ins Totales</div>
                      </IonCardContent>
                    </IonCard>
                    <IonCard className="stat-card">
                      <IonCardContent>
                        <IonIcon icon={timeOutline} className="stat-icon" />
                        <div className="stat-value">{stats.stats.recentCheckIns || 0}</div>
                        <div className="stat-label">Últimos 30 días</div>
                      </IonCardContent>
                    </IonCard>
                  </div>

                  {/* Top Customers */}
                  {stats.topCustomers && stats.topCustomers.length > 0 ? (
                    <div className="top-customers-section">
                      <h3 className="subsection-title">Top Clientes</h3>
                      <div className="customers-list">
                        {stats.topCustomers.map((customer: any, index: number) => (
                          <IonItem key={index} className="customer-item" lines="none">
                            <IonLabel>
                              <h3>{customer.alias || 'Cliente'}</h3>
                              <p>{customer.totalPoints} puntos • {customer.checkInCount} check-ins</p>
                              {customer.lastCheckIn && (
                                <p className="last-checkin">
                                  Último check-in: {new Date(customer.lastCheckIn).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              )}
                            </IonLabel>
                            <IonBadge color="primary" slot="end">
                              #{index + 1}
                            </IonBadge>
                          </IonItem>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="top-customers-section">
                      <h3 className="subsection-title">Top Clientes</h3>
                      <p className="empty-message">Aún no hay clientes registrados</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="stats-container">
                  <div className="stats-grid">
                    {[1, 2, 3].map((i) => (
                      <IonCard key={i} className="stat-card">
                        <IonCardContent>
                          <IonSkeletonText animated style={{ width: '60px', height: '60px', margin: '0 auto' }} />
                          <IonSkeletonText animated style={{ width: '80px', height: '40px', margin: '1rem auto' }} />
                          <IonSkeletonText animated style={{ width: '120px', height: '20px', margin: '0 auto' }} />
                        </IonCardContent>
                      </IonCard>
                    ))}
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BusinessOwnerDashboard;

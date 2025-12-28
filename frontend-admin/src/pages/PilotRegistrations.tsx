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
  IonText,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  useIonViewWillEnter,
} from '@ionic/react';
import { useState, useEffect, useRef } from 'react';
import { adminPilotService } from '../services/api.service';
import './PilotRegistrations.css';

interface PilotRegistration {
  _id: string;
  businessName: string;
  email: string;
  contactName: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const PilotRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<PilotRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const contentRef = useRef<HTMLIonContentElement>(null);

  useIonViewWillEnter(() => {
    contentRef.current?.scrollToTop(0);
    loadRegistrations();
  });

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await adminPilotService.getPilotRegistrations(status);
      setRegistrations(response.registrations);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [statusFilter]);

  const handleRefresh = async (e: CustomEvent) => {
    await loadRegistrations();
    (e.target as HTMLIonRefresherElement).complete();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'medium';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return status;
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

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Solicitudes del Programa Piloto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="pilot-registrations-container">
          {/* Status Filter */}
          <IonSegment
            value={statusFilter}
            onIonChange={(e) => setStatusFilter(e.detail.value as any)}
            className="status-filter"
          >
            <IonSegmentButton value="all">
              <IonLabel>Todas ({registrations.length})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pending">
              <IonLabel>Pendientes ({pendingCount})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="approved">
              <IonLabel>Aprobadas ({approvedCount})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="rejected">
              <IonLabel>Rechazadas ({rejectedCount})</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {loading && (
            <div className="loading-container">
              <IonSpinner name="crescent" />
              <p>Cargando solicitudes...</p>
            </div>
          )}

          {error && (
            <IonCard>
              <IonCardContent>
                <IonText color="danger">{error}</IonText>
              </IonCardContent>
            </IonCard>
          )}

          {!loading && !error && registrations.length === 0 && (
            <IonCard>
              <IonCardContent>
                <div className="empty-state">
                  <IonText color="medium">
                    <p>No hay solicitudes {statusFilter !== 'all' ? `con estado "${getStatusLabel(statusFilter)}"` : ''}.</p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {!loading && !error && registrations.length > 0 && (
            <div className="registrations-list">
              {registrations.map((registration) => (
                <IonCard key={registration._id} className="registration-card">
                  <IonCardContent>
                    <div className="registration-header">
                      <div>
                        <h2 className="business-name">{registration.businessName}</h2>
                        <IonBadge color={getStatusColor(registration.status)} className="status-badge">
                          {getStatusLabel(registration.status)}
                        </IonBadge>
                      </div>
                    </div>

                    <div className="registration-details">
                      <IonItem lines="none" className="detail-item">
                        <IonLabel>
                          <h3>Email</h3>
                          <p>{registration.email}</p>
                        </IonLabel>
                      </IonItem>

                      <IonItem lines="none" className="detail-item">
                        <IonLabel>
                          <h3>Contacto</h3>
                          <p>{registration.contactName}</p>
                        </IonLabel>
                      </IonItem>

                      <IonItem lines="none" className="detail-item">
                        <IonLabel>
                          <h3>Dirección</h3>
                          <p className="address-text">{registration.address}</p>
                        </IonLabel>
                      </IonItem>

                      {registration.notes && (
                        <IonItem lines="none" className="detail-item">
                          <IonLabel>
                            <h3>Notas</h3>
                            <p>{registration.notes}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      <div className="registration-footer">
                        <IonText color="medium" className="date-text">
                          <small>Solicitud recibida: {formatDate(registration.createdAt)}</small>
                        </IonText>
                      </div>
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

export default PilotRegistrations;


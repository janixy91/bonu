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
  IonTextarea,
  IonButton,
  IonText,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonIcon,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { checkmarkCircle } from 'ionicons/icons';
import { promoCardService, businessService } from '../services/api.service';
import './CreatePromoCard.css';

const CreatePromoCard: React.FC = () => {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'unlimited' as 'unlimited' | 'limited',
    limit: '',
    benefitType: '',
    expiresAt: '',
  });
  const history = useHistory();

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const businessRes = await businessService.getMyBusiness();
      setBusiness(businessRes.business);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    if (!business?._id) {
      setError('No se encontró un negocio asociado');
      setSaving(false);
      return;
    }

    try {
      const data: any = {
        businessId: business._id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        benefitType: formData.benefitType,
      };

      if (formData.type === 'limited') {
        const limit = parseInt(formData.limit);
        if (!limit || limit <= 0) {
          setError('El límite debe ser un número positivo');
          setSaving(false);
          return;
        }
        data.limit = limit;
      }

      if (formData.expiresAt) {
        data.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      await promoCardService.createPromoCard(data);
      setSuccess(true);
      
      setTimeout(() => {
        history.push('/promo-cards');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear la tarjeta');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/promo-cards" />
            </IonButtons>
            <IonTitle>Nueva Tarjeta</IonTitle>
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/promo-cards" />
          </IonButtons>
          <IonTitle>Nueva Tarjeta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="form-container">
          <IonCard>
            <IonCardContent>
              <h2 className="form-title">Crear Tarjeta Promocional</h2>

              {success && (
                <div className="success-message">
                  <IonIcon icon={checkmarkCircle} />
                  <IonText color="success">Tarjeta creada exitosamente</IonText>
                </div>
              )}

              {error && (
                <IonText color="danger" className="error-message">
                  {error}
                </IonText>
              )}

              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonLabel position="stacked">Título *</IonLabel>
                  <IonInput
                    value={formData.title}
                    onIonInput={(e) => setFormData({ ...formData, title: e.detail.value! })}
                    required
                    placeholder="Ej: Desayuno Especial"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Descripción</IonLabel>
                  <IonTextarea
                    value={formData.description}
                    onIonInput={(e) => setFormData({ ...formData, description: e.detail.value! })}
                    rows={3}
                    placeholder="Descripción de la tarjeta promocional"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Tipo de Tarjeta *</IonLabel>
                  <IonSelect
                    value={formData.type}
                    onIonChange={(e) => setFormData({ ...formData, type: e.detail.value, limit: '' })}
                  >
                    <IonSelectOption value="unlimited">Ilimitada</IonSelectOption>
                    <IonSelectOption value="limited">Limitada</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {formData.type === 'limited' && (
                  <IonItem>
                    <IonLabel position="stacked">Límite de Unidades *</IonLabel>
                    <IonInput
                      type="number"
                      value={formData.limit}
                      onIonInput={(e) => setFormData({ ...formData, limit: e.detail.value! })}
                      min="1"
                      required
                      placeholder="Ej: 100"
                    />
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel position="stacked">Tipo de Beneficio *</IonLabel>
                  <IonInput
                    value={formData.benefitType}
                    onIonInput={(e) => setFormData({ ...formData, benefitType: e.detail.value! })}
                    required
                    placeholder="Ej: Desayuno completo, Café gratis, etc."
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Fecha de Expiración (Opcional)</IonLabel>
                  <IonDatetimeButton datetime="expiresDatetime"></IonDatetimeButton>
                  <IonModal keepContentsMounted={true}>
                    <IonDatetime
                      id="expiresDatetime"
                      presentation="date-time"
                      value={formData.expiresAt}
                      onIonChange={(e) => setFormData({ ...formData, expiresAt: e.detail.value! as string })}
                      min={new Date().toISOString()}
                    ></IonDatetime>
                  </IonModal>
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={saving || !formData.title || !formData.benefitType || (formData.type === 'limited' && !formData.limit)}
                  className="submit-button"
                >
                  {saving ? (
                    <>
                      <IonSpinner name="crescent" />
                      Creando...
                    </>
                  ) : (
                    'Crear Tarjeta'
                  )}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CreatePromoCard;


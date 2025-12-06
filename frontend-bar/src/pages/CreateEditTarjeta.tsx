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
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { tarjetaService } from '../services/api.service';
import './CreateEditTarjeta.css';

const CreateEditTarjeta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'ilimitada' as 'ilimitada' | 'limitada',
    limiteTotal: '',
    cantidad: 'ilimitado',
    sellosRequeridos: '10',
    valorRecompensa: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadTarjeta();
    }
  }, [id]);

  const loadTarjeta = async () => {
    try {
      setLoadingData(true);
      const response = await tarjetaService.getTarjeta(id!);
      const tarjeta = response.tarjeta;
      const tipo = tarjeta.tipo || (tarjeta.type === 'stamp' ? 'limitada' : 'ilimitada');
      
      // Determinar el valor de cantidad
      let cantidad = 'ilimitado';
      if (tipo === 'limitada' && tarjeta.limiteTotal) {
        const limiteStr = tarjeta.limiteTotal.toString();
        // Verificar si coincide con valores predefinidos
        if (['10', '25', '50', '100', '200', '500'].includes(limiteStr)) {
          cantidad = limiteStr;
        } else {
          cantidad = 'custom';
        }
      }
      
      setFormData({
        nombre: tarjeta.nombre || tarjeta.title || '',
        descripcion: tarjeta.descripcion || tarjeta.description || '',
        tipo: tipo,
        limiteTotal: tarjeta.limiteTotal?.toString() || '',
        cantidad: cantidad,
        valorRecompensa: tarjeta.valorRecompensa || tarjeta.rewardText || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar la tarjeta');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: any = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        valorRecompensa: formData.valorRecompensa,
        totalStamps: parseInt(formData.sellosRequeridos) || 10,
      };

      if (formData.tipo === 'limitada') {
        const limite = formData.cantidad === 'custom' 
          ? parseInt(formData.limiteTotal) 
          : (formData.cantidad === 'ilimitado' ? null : parseInt(formData.cantidad));
        
        if (limite !== null && (!limite || limite < 1)) {
          setError('La cantidad debe ser mayor a 0 para tarjetas limitadas');
          setLoading(false);
          return;
        }
        data.limiteTotal = limite;
      } else {
        // Si es ilimitada, asegurarse de que limiteTotal sea null
        data.limiteTotal = null;
      }

      if (isEdit) {
        await tarjetaService.updateTarjeta(id!, data);
      } else {
        await tarjetaService.createTarjeta(data);
      }

      history.push('/tarjetas');
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tarjetas" />
            </IonButtons>
            <IonTitle>{isEdit ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</IonTitle>
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
            <IonBackButton defaultHref="/tarjetas" />
          </IonButtons>
          <IonTitle>{isEdit ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="form-container">
          <IonCard>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                {error && (
                  <IonText color="danger" className="error-message">
                    {error}
                  </IonText>
                )}

                <IonItem>
                  <IonLabel position="stacked">Nombre de la Tarjeta *</IonLabel>
                  <IonInput
                    value={formData.nombre}
                    onIonInput={(e) => setFormData({ ...formData, nombre: e.detail.value! })}
                    required
                    placeholder="Ej: Tarjeta de Fidelización"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Descripción</IonLabel>
                  <IonTextarea
                    value={formData.descripcion}
                    onIonInput={(e) => setFormData({ ...formData, descripcion: e.detail.value! })}
                    rows={3}
                    placeholder="Describe la tarjeta..."
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Cantidad de personas que pueden obtener la tarjeta *</IonLabel>
                  <IonSelect
                    value={formData.cantidad}
                    onIonChange={(e) => {
                      const cantidad = e.detail.value;
                      if (cantidad === 'ilimitado') {
                        setFormData({ ...formData, cantidad: 'ilimitado', tipo: 'ilimitada', limiteTotal: '' });
                      } else {
                        setFormData({ ...formData, cantidad: cantidad, tipo: 'limitada', limiteTotal: cantidad });
                      }
                    }}
                  >
                    <IonSelectOption value="ilimitado">Ilimitado</IonSelectOption>
                    <IonSelectOption value="10">10</IonSelectOption>
                    <IonSelectOption value="25">25</IonSelectOption>
                    <IonSelectOption value="50">50</IonSelectOption>
                    <IonSelectOption value="100">100</IonSelectOption>
                    <IonSelectOption value="200">200</IonSelectOption>
                    <IonSelectOption value="500">500</IonSelectOption>
                    <IonSelectOption value="custom">Personalizado</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {formData.cantidad === 'custom' && (
                  <IonItem>
                    <IonLabel position="stacked">Cantidad Personalizada *</IonLabel>
                    <IonInput
                      type="number"
                      value={formData.limiteTotal}
                      onIonInput={(e) => {
                        const valor = e.detail.value!;
                        setFormData({ ...formData, limiteTotal: valor, tipo: 'limitada', cantidad: valor || 'custom' });
                      }}
                      min="1"
                      required
                      placeholder="Ej: 100"
                    />
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel position="stacked">Número de Sellos Requeridos para Canjear *</IonLabel>
                  <IonInput
                    type="number"
                    value={formData.sellosRequeridos}
                    onIonInput={(e) => setFormData({ ...formData, sellosRequeridos: e.detail.value! })}
                    min="1"
                    required
                    placeholder="Ej: 10"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Valor de la Recompensa *</IonLabel>
                  <IonTextarea
                    value={formData.valorRecompensa}
                    onIonInput={(e) => setFormData({ ...formData, valorRecompensa: e.detail.value! })}
                    rows={2}
                    required
                    placeholder="Ej: 10€ de descuento, 2 raciones gratis..."
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={loading || !formData.nombre || !formData.valorRecompensa || !formData.sellosRequeridos}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <IonSpinner name="crescent" />
                      Guardando...
                    </>
                  ) : (
                    isEdit ? 'Actualizar Tarjeta' : 'Crear Tarjeta'
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

export default CreateEditTarjeta;


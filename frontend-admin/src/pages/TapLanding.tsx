import { IonPage, IonContent, IonSpinner, IonText } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tapService } from '../services/api.service';
import './TapLanding.css';

const TapLanding: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    const handleTap = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const barId = params.get('barId') || params.get('local');

        if (!barId) {
          setError('No se encontró el identificador del local');
          setLoading(false);
          return;
        }

        // Crear TapIntent
        const data = await tapService.createTapIntent(barId);
        setBusinessName(data.business.name);

        // Intentar abrir la app móvil con deep link
        const deepLink = `bonu://tap?tapIntentId=${data.tapIntentId}`;
        
        // Detectar si estamos en un dispositivo móvil
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // En móvil, intentar abrir la app directamente
          // Si la app está instalada, se abrirá. Si no, el navegador mostrará error
          window.location.href = deepLink;
          
          // Si después de un tiempo no se abrió la app, mostrar opción de descarga
          setTimeout(() => {
            setLoading(false);
          }, 2000);
        } else {
          // En desktop, mostrar mensaje de que necesita un móvil
          setError('Esta funcionalidad solo está disponible en dispositivos móviles');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error handling tap:', err);
        setError(err.message || 'Error al procesar el tap');
        setLoading(false);
      }
    };

    handleTap();
  }, [location]);

  return (
    <IonPage>
      <IonContent className="tap-landing-content">
        {loading ? (
          <div className="tap-landing-container">
            <div className="loading-section">
              <IonSpinner name="crescent" />
              <h2>Abriendo BONU...</h2>
              {businessName && <p>Local: {businessName}</p>}
            </div>
          </div>
        ) : error ? (
          <div className="tap-landing-container">
            <div className="error-section">
              <IonText color="danger">
                <h2>Error</h2>
                <p>{error}</p>
              </IonText>
            </div>
          </div>
        ) : (
          <div className="tap-landing-container">
            <div className="fallback-section">
              <h2>¿No tienes la app BONU?</h2>
              <p>Descarga la app para añadir sellos y disfrutar de recompensas</p>
              {/* Aquí podrías añadir botones de descarga para iOS y Android */}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TapLanding;


import {
  IonContent,
  IonPage,
  IonButton,
  IonImg,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useAuthStore } from '../store/authStore';
import 'swiper/css';
import 'swiper/css/pagination';
import './Onboarding.css';

const Onboarding: React.FC = () => {
  const history = useHistory();
  const setOnboardingComplete = useAuthStore((state) => state.setOnboardingComplete);

  const handleGetStarted = () => {
    console.log('handleGetStarted');
    setOnboardingComplete();
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="onboarding-content">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          speed={400}
          className="onboarding-swiper"
        >
          <SwiperSlide>
            <div className="slide-container">
              <IonImg src="/assets/icon-bonu.svg" className="slide-icon" />
              <h2>Bienvenido a BONU</h2>
              <p>Tu sistema de tarjetas de fidelización digital</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-icon-placeholder">🎁</div>
              <h2>Acumula Sellos</h2>
              <p>Visita tus comercios favoritos y acumula sellos en cada compra</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-icon-placeholder">🏆</div>
              <h2>Canjea Recompensas</h2>
              <p>Cuando completes tu tarjeta, disfruta de increíbles recompensas</p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-icon-placeholder">📱</div>
              <h2>Todo en tu Móvil</h2>
              <p>Lleva todas tus tarjetas contigo, sin necesidad de papel</p>
            </div>
          </SwiperSlide>
        </Swiper>

        <div className="onboarding-footer">
          <IonButton expand="block" onClick={handleGetStarted} className="get-started-button">
            Empezar
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;


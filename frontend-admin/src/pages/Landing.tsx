import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  settingsOutline, 
  analyticsOutline, 
  shieldCheckmarkOutline,
  peopleOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  qrCodeOutline,
  logoWhatsapp,
  logoInstagram
} from 'ionicons/icons';
import './Landing.css';

const Landing: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    history.push('/login');
  };

  const handleRegister = () => {
    history.push('/register');
  };

  return (
    <IonPage>
      <IonContent className="landing-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-logo">
              <img 
                src="/assets/logo-transparente.png" 
                alt="BONU Logo" 
                className="hero-logo-img"
              />
            </div>
            <h1 className="hero-title">BONU</h1>
            <p className="hero-subtitle">
              Sistema de fidelización digital para tu negocio
            </p>
            <p className="hero-description">
              Únete a nuestro programa piloto y transforma la forma en que fidelizas 
              a tus clientes. Sistema de check-ins y puntos que tus 
              clientes acumulan cada vez que visitan tu local.
            </p>
        
         
            <div className="hero-buttons">
              <IonButton 
                className="cta-button primary" 
                onClick={handleRegister}
              >
                Unirse al piloto
                <IonIcon icon={arrowForwardOutline} slot="end" />
              </IonButton>
            </div>
          </div>
        </section>

        {/* What is BONU Section */}
        <section className="what-is-section">
          <div className="section-container">
            <h2 className="section-title">¿Qué es BONU?</h2>
            <p className="section-description">
              BONU es una plataforma digital que permite a los negocios crear y gestionar 
              programas de fidelización modernos. Tus clientes hacen check-in cada vez que visitan 
              tu local, acumulan puntos y canjean recompensas cuando alcanzan sus objetivos.
            </p>
          </div>
        </section>

        {/* Validation Methods Section - MAIN FEATURE */}
        <section className="validation-section">
          <div className="section-container">
            <h2 className="section-title">Lo que nos hace especial</h2>
            <p className="section-description">
              Lo que hace especial a BONU es lo fácil que es hacer check-in. <strong>Sin esfuerzo para tus empleados:</strong>
            </p>
            <div className="validation-methods">
              <div className="validation-method-card highlight">
                <div className="method-icon">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <h3 className="method-title">Check-in por NFC</h3>
                <p className="method-description">
                  Coloca un cartel NFC en tu barra. <strong>El cliente solo tiene que acercar su móvil al cartel </strong>  
                   automáticamente hace check-in y gana puntos. <strong>¡Tus camareros no tienen que hacer nada!</strong>
                </p>
              </div>

              <div className="validation-method-card highlight">
                <div className="method-icon">
                  <IonIcon icon={qrCodeOutline} />
                </div>
                <h3 className="method-title">Puntos extras con códigos</h3>
                <p className="method-description">
                  Genera códigos especiales para repartir puntos extras cuando quieras premiar a tus clientes. 
                  El cliente introduce el código en su móvil y <strong>recibe puntos adicionales instantáneamente</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-container">
            <h2 className="section-title">Más beneficios para tu negocio</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <IonIcon icon={peopleOutline} />
                </div>
                <h3 className="feature-title">Fideliza más clientes</h3>
                <p className="feature-description">
                  Incentiva las visitas repetidas con un sistema de recompensas atractivo 
                  y fácil de usar para tus clientes
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <h3 className="feature-title">Check-ins digitales</h3>
                <p className="feature-description">
                  Tus clientes hacen check-in cada vez que visitan tu local desde su móvil. 
                  Acumulan puntos automáticamente sin necesidad de tarjetas físicas
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <IonIcon icon={analyticsOutline} />
                </div>
                <h3 className="feature-title">Control total</h3>
                <p className="feature-description">
                  Configura cuántos puntos otorgas por check-in, qué recompensas ofreces y gestiona 
                  todo desde un panel intuitivo con estadísticas en tiempo real
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <IonIcon icon={settingsOutline} />
                </div>
                <h3 className="feature-title">Fácil de implementar</h3>
                <p className="feature-description">
                  Configura tu negocio en minutos. Solo necesitas tu logo, nombre y 
                  definir tu programa de recompensas
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <h3 className="feature-title">Para locales hosteleros</h3>
                <p className="feature-description">
                  Diseñado especialmente para bares, cafeterías y restaurantes. 
                  Perfecto para fidelizar a tus clientes habituales
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <IonIcon icon={shieldCheckmarkOutline} />
                </div>
                <h3 className="feature-title">Seguro y confiable</h3>
                <p className="feature-description">
                  Sistema robusto con códigos únicos de validación y seguimiento 
                  completo de todas las transacciones
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="how-it-works-section">
          <div className="section-container">
            <h2 className="section-title">Cómo funciona</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <h3 className="step-title">Te registras</h3>
                <p className="step-description">
                  Únete al programa piloto y configura tu negocio en minutos
                </p>
              </div>

              <div className="step-arrow">
                <IonIcon icon={arrowForwardOutline} />
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <h3 className="step-title">Configuras tu programa</h3>
                <p className="step-description">
                  Define cuántos puntos otorgas por check-in, qué recompensas ofreces y cuántos puntos necesitan para canjearlas
                </p>
              </div>

              <div className="step-arrow">
                <IonIcon icon={arrowForwardOutline} />
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <h3 className="step-title">Tus clientes se unen</h3>
                <p className="step-description">
                  Los clientes descargan la app y encuentran tu negocio para empezar a acumular puntos
                </p>
              </div>

              <div className="step-arrow">
                <IonIcon icon={arrowForwardOutline} />
              </div>

              <div className="step highlight-step">
                <div className="step-number">4</div>
                <h3 className="step-title">Check-ins automáticos</h3>
                <p className="step-description">
                  El cliente acerca su móvil al cartel NFC en tu barra y <strong>hace check-in automáticamente</strong>. 
                  Sin intervención de tus empleados. También puedes repartir códigos para puntos extras cuando quieras.
                </p>
              </div>

              <div className="step-arrow">
                <IonIcon icon={arrowForwardOutline} />
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <h3 className="step-title">Entregas recompensas</h3>
                <p className="step-description">
                  Cuando acumulan suficientes puntos, entregas la recompensa y ellos vuelven por más
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pilot Program Section */}
        <section className="pilot-section">
          <div className="section-container">
            <div className="pilot-card">
              <h2 className="pilot-title">🎯 Programa Piloto</h2>
              <p className="pilot-description">
                Estamos buscando negocios innovadores que quieran probar BONU y ayudarnos 
                a mejorar la plataforma. Como participante del piloto, tendrás:
              </p>
              <ul className="pilot-benefits">
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Acceso gratuito durante el período piloto</span>
                </li>
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Cartel NFC gratis para colocar en tu barra - los clientes hacen check-in automáticamente</span>
                </li>
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Códigos impresos gratis para repartir puntos extras cuando quieras</span>
                </li>
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Carteles personalizados para promocionar tu programa de fidelización</span>
                </li>
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Soporte prioritario y atención personalizada</span>
                </li>
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Influencia directa en el desarrollo de nuevas funcionalidades</span>
                </li>
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Panel de administración completo y fácil de usar</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <h2 className="cta-title">¿Listo para unirte al piloto?</h2>
            <p className="cta-description">
              Únete a otros negocios innovadores y comienza a fidelizar a tus clientes 
              de forma digital. Es gratis durante el período piloto.
            </p>
            <IonButton 
              className="cta-button primary large" 
              onClick={handleRegister}
            >
              Unirse al programa piloto
              <IonIcon icon={arrowForwardOutline} slot="end" />
            </IonButton>
            {/* <p className="cta-note">
              Ya tienes cuenta? <button onClick={handleLogin} className="cta-link">Inicia sesión aquí</button>
            </p> */}
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <div className="section-container">
            <h2 className="section-title">¿Tienes preguntas?</h2>
            <p className="section-description">
              Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
            </p>
            <div className="contact-buttons">
              <IonButton 
                className="whatsapp-button"
                href="https://wa.me/34663152183?text=Hola%20he%20visto%20BONU%20y%20me%20interesa%20el%20piloto" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <IonIcon icon={logoWhatsapp} slot="start" />
                Hablar por WhatsApp
              </IonButton>
            
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-container">
            <div className="footer-logo">
              <img 
                src="/assets/logo-transparente.png" 
                alt="BONU Logo" 
                className="footer-logo-img"
              />
              <span className="footer-brand">BONU</span>
            </div>
            <p className="footer-text">
              Sistema de fidelización digital para negocios
            </p>
            <div className="footer-social">
              <a 
                href="https://wa.me/34663152183?text=Hola%20he%20visto%20BONU%20y%20me%20interesa%20el%20piloto" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="WhatsApp"
              >
                <IonIcon icon={logoWhatsapp} />
              </a>
              <a 
                href="https://instagram.com/getbonu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <IonIcon icon={logoInstagram} />
              </a>
            </div>
            <IonButton fill="clear" onClick={handleRegister} className="footer-link">
              Unirse al piloto
            </IonButton>
          </div>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default Landing;


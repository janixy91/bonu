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
              a tus clientes.  Tarjetas digitales con recompensas que tus 
              clientes llevan siempre en el móvil.
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
              programas de fidelización modernos. Tus clientes acumulan sellos digitales en 
              sus móviles y canjean recompensas cuando completan sus tarjetas.
            </p>
          </div>
        </section>

        {/* Validation Methods Section - MAIN FEATURE */}
        <section className="validation-section">
          <div className="section-container">
            <h2 className="section-title">Lo que nos hace especial</h2>
            <p className="section-description">
              Lo que hace especial a BONU es lo fácil que es validar sellos. Dos formas simples 
              que no requieren esfuerzo de tus empleados:
            </p>
            <div className="validation-methods">
              <div className="validation-method-card highlight">
                <div className="method-icon">
                  <IonIcon icon={qrCodeOutline} />
                </div>
                <h3 className="method-title">Códigos en papel</h3>
                <p className="method-description">
                  Imprime o solicita códigos y repártelos a tus clientes cuando lo consideres, ¡Tú marcas las reglas!. El cliente introduce 
                  el código en su móvil tranquilamente. <strong>Tus camareros solo dan un papelito.</strong>
                </p>
              </div>

              <div className="validation-method-card highlight">
                <div className="method-icon">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <h3 className="method-title">Validación por NFC</h3>
                <p className="method-description">
                  Aún más rápido: el camarero acerca su dispositivo NFC al móvil del cliente 
                  y<strong> con un solo toque valida el sello</strong>. Instantáneo y sin complicaciones.
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
                  <IonIcon icon={qrCodeOutline} />
                </div>
                <h3 className="feature-title">Tarjetas digitales</h3>
                <p className="feature-description">
                  Tus clientes llevan sus tarjetas de fidelización siempre en el móvil. 
                  Sin necesidad de tarjetas físicas que se pierden o se olvidan
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <IonIcon icon={analyticsOutline} />
                </div>
                <h3 className="feature-title">Control total</h3>
                <p className="feature-description">
                  Configura cuántos sellos necesitas, qué recompensas ofreces y gestiona 
                  todo desde un panel intuitivo
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
                  Define cuántos sellos necesitas, cuales son las reglas para obtenerlos y qué recompensa ofreces
                </p>
              </div>

              <div className="step-arrow">
                <IonIcon icon={arrowForwardOutline} />
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <h3 className="step-title">Tus clientes se unen</h3>
                <p className="step-description">
                  Los clientes descargan la app y añaden tu tarjeta de fidelización
                </p>
              </div>

              <div className="step-arrow">
                <IonIcon icon={arrowForwardOutline} />
              </div>

              <div className="step highlight-step">
                <div className="step-number">4</div>
                <h3 className="step-title">Validas sellos fácilmente</h3>
                <p className="step-description">
                  Reparte un código en papel o valida por NFC con un solo toque. <strong>Sin complicaciones para tus camareros.</strong>
                </p>
              </div>

              <div className="step-arrow">
                <IonIcon icon={arrowForwardOutline} />
              </div>

              <div className="step">
                <div className="step-number">5</div>
                <h3 className="step-title">Entregas recompensas</h3>
                <p className="step-description">
                  Cuando completan su tarjeta, entregas la recompensa y ellos vuelven por más
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
                  <span>Códigos impresos gratis para repartir a tus clientes</span>
                </li>
                <li>
                  <IonIcon icon={checkmarkCircleOutline} className="benefit-icon" />
                  <span>Dispositivos NFC gratis para validar sellos con un solo toque</span>
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
            <p className="cta-note">
              Ya tienes cuenta? <button onClick={handleLogin} className="cta-link">Inicia sesión aquí</button>
            </p>
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
                href="https://wa.me/1234567890" 
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


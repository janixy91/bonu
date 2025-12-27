import {
  IonCard,
  IonCardContent,
  IonImg,
  IonSpinner,
  IonBadge,
  IonIcon,
} from '@ionic/react';
import { addOutline, wallet } from 'ionicons/icons';
import { useState, useRef, useEffect } from 'react';
import './StampCard.css';

interface StampCardProps {
  id: string;
  businessName?: string;
  businessLogoUrl?: string;
  cardName?: string;
  rewardText: string;
  totalStamps: number;
  currentStamps?: number;
  isComplete?: boolean;
  onClick?: () => void;
  showAddButton?: boolean;
  onAdd?: () => void;
  isAdding?: boolean;
  isAvailable?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  badgeColor?: string;
  description?: string;
}

const StampCard: React.FC<StampCardProps> = ({
  id,
  businessName,
  businessLogoUrl,
  cardName,
  rewardText,
  totalStamps,
  currentStamps = 0,
  isComplete = false,
  onClick,
  showAddButton = false,
  onAdd,
  isAdding = false,
  isAvailable = true,
  showBadge = false,
  badgeText,
  badgeColor = 'warning',
  description,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardBackContentRef = useRef<HTMLDivElement>(null);
  const displayName = businessName || cardName || 'Tarjeta';
  const initials = displayName.charAt(0).toUpperCase();
  const remainingStamps = totalStamps - currentStamps;
  
  const getRemainingStampsText = () => {
    if (remainingStamps <= 0) return '¡Completa!';
    if (remainingStamps === 1) return `${remainingStamps} sello restante`;
    return `${remainingStamps} sellos restantes`;
  };
  
  // Reset scroll when card is flipped
  useEffect(() => {
    if (isFlipped && cardBackContentRef.current) {
      cardBackContentRef.current.scrollTop = 0;
    }
  }, [isFlipped]);
  
  const handleCardClick = () => {
    if (showAddButton) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`stamp-card-wrapper ${isFlipped ? 'flipped' : ''}`}>
      <IonCard
        key={id}
        className={`stamp-card ${isComplete ? 'card-complete' : ''}`}
        onClick={handleCardClick}
        style={showAddButton ? {} : { cursor: 'pointer' }}
      >
        <div className="stamp-card-inner">
          {/* Front of card */}
          <div className="stamp-card-front">
            <IonCardContent className="stamp-card-content">
              {/* Badge - Top Left */}
              {showBadge && badgeText && (
                <div className="stamp-card-badge-container">
                  <IonBadge color={badgeColor} className="stamp-card-badge">
                    {badgeText}
                  </IonBadge>
                </div>
              )}
              
              {/* Add card button - Top Right */}
              {showAddButton && onAdd && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd();
                  }}
                  disabled={isAdding || !isAvailable}
                  className="add-card-icon-button"
                  aria-label="Añadir tarjeta"
                >
                  {isAdding ? (
                    <IonSpinner name="crescent" className="add-card-spinner" />
                  ) : (
                    <div className="add-card-icon-combined">
                      <IonIcon icon={wallet} className="add-card-icon-wallet" />
                      <IonIcon icon={addOutline} className="add-card-icon-plus" />
                    </div>
                  )}
                </button>
              )}
              
              {/* Stamps grid */}
              <div className="stamps-grid">
                {Array.from({ length: totalStamps }, (_, index) => {
                  const isFilled = index < currentStamps;
                  return (
                    <div
                      key={index}
                      className={`stamp ${isFilled ? 'stamp-filled' : 'stamp-empty'} ${
                        isComplete && isFilled ? 'stamp-complete' : ''
                      }`}
                    >
                      {isFilled && (
                        <IonImg
                          src="/assets/logo-transparente.png"
                          className="stamp-logo"
                          alt="BONU"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Header with business info */}
              <div className="stamp-card-header">
                <div className="stamp-card-logo">
                  {businessLogoUrl ? (
                    <IonImg src={businessLogoUrl} className="business-logo-img" />
                  ) : (
                    <div className="business-logo-placeholder">{initials}</div>
                  )}
                </div>
                <div className="stamp-card-title-section">
                  <h2 className="stamp-card-business-name">{displayName}</h2>
                  <p className="stamp-card-reward">{rewardText || 'Recompensa'}</p>
                </div>
              </div>
            </IonCardContent>
          </div>

          {/* Back of card */}
          <div className="stamp-card-back">
            <IonCardContent className="stamp-card-content">
              <div className="card-back-content" ref={cardBackContentRef}>
                {/* Logo/Business info */}
                <div className="card-back-header">
                  <div className="stamp-card-logo">
                    {businessLogoUrl ? (
                      <IonImg src={businessLogoUrl} className="business-logo-img" />
                    ) : (
                      <div className="business-logo-placeholder">{initials}</div>
                    )}
                  </div>
                  <h2 className="card-back-business-name">{businessName || 'Comercio'}</h2>
                  {/* Stamps progress - Top Right */}
                  <div className="card-back-progress-small">
                    <span className="stamps-current-small">{currentStamps}</span>
                    <span className="stamps-separator-small">/</span>
                    <span className="stamps-total-small">{totalStamps}</span>
                  </div>
                </div>

                {/* Separator line */}
                <div className="card-back-separator"></div>

                {/* Card title */}
                {cardName && (
                  <div className="card-back-section">
                    <h3 className="card-back-title">{cardName}</h3>
                  </div>
                )}

                {/* Description */}
                {description && (
                  <div className="card-back-section">
                    <p className="card-back-description">{description}</p>
                  </div>
                )}

                {/* Reward */}
                <div className="card-back-section">
                  <h4 className="card-back-label">Recompensa</h4>
                  <p className="card-back-reward">{rewardText || 'Recompensa'}</p>
                </div>
              </div>
            </IonCardContent>
          </div>
        </div>
      </IonCard>
    </div>
  );
};

export default StampCard;


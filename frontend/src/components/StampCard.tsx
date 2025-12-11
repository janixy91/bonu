import {
  IonCard,
  IonCardContent,
  IonImg,
  IonButton,
  IonSpinner,
  IonBadge,
} from '@ionic/react';
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
}) => {
  const displayName = businessName || cardName || 'Tarjeta';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <IonCard
      key={id}
      className={`stamp-card ${isComplete ? 'card-complete' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      <IonCardContent className="stamp-card-content">
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
            {showBadge && badgeText && (
              <IonBadge color={badgeColor} style={{ marginTop: '0.5rem' }}>
                {badgeText}
              </IonBadge>
            )}
          </div>
        </div>

      

        {/* Add card button (only for Explore) */}
        {showAddButton && onAdd && (
          <IonButton
            expand="block"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            disabled={isAdding || !isAvailable}
            className="add-card-button"
          >
            {isAdding ? (
              <>
                <IonSpinner name="crescent" />
                Añadiendo...
              </>
            ) : (
              'Añadir Tarjeta'
            )}
          </IonButton>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default StampCard;


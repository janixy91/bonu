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
  IonBadge,
  IonIcon,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { checkmarkCircle, createOutline, closeOutline, pencilOutline, add, trashOutline } from 'ionicons/icons';
import { adminService } from '../services/api.service';
import './BusinessDetails.css';

const BusinessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<any>(null);
  const [promoCards, setPromoCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [cardFormData, setCardFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'ilimitada' as 'ilimitada' | 'limitada',
    cantidad: 'ilimitado',
    cantidadPersonalizada: '',
    sellosRequeridos: '10',
    valorRecompensa: '',
  });
  const [savingCard, setSavingCard] = useState(false);
  const [togglingCard, setTogglingCard] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadBusiness();
    }
  }, [id]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getBusiness(id!);
      setBusiness(response.business);
      setPromoCards(response.promoCards || []);
      setFormData({
        name: response.business.name || '',
        description: response.business.description || '',
        logoUrl: response.business.logoUrl || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar el negocio');
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess(false);
    // Reset form data to original business data
    if (business) {
      setFormData({
        name: business.name || '',
        description: business.description || '',
        logoUrl: business.logoUrl || '',
      });
    }
  };

  const handleToggleCardActive = async (cardId: string, currentActive: boolean) => {
    try {
      setTogglingCard(cardId);
      setError('');
      const newActive = !currentActive;
      await adminService.togglePromoCardActive(cardId, newActive);
      
      // Update local state
      setPromoCards(promoCards.map(card => 
        (card._id === cardId || card.id === cardId) 
          ? { ...card, active: newActive, estado: newActive ? 'activa' : 'desactivada' }
          : card
      ));
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado de la tarjeta');
    } finally {
      setTogglingCard(null);
    }
  };

  const handleEditCard = async (cardId: string) => {
    try {
      setEditingCardId(cardId);
      setError('');
      const response = await adminService.getPromoCard(cardId);
      const card = response.promoCard;
      
      const tipo = card.tipo || (card.type === 'stamp' ? 'limitada' : 'ilimitada');
      let cantidad = 'ilimitado';
      if (tipo === 'limitada' && card.limiteTotal) {
        const limiteStr = card.limiteTotal.toString();
        if (['10', '25', '50', '100', '200', '500'].includes(limiteStr)) {
          cantidad = limiteStr;
        } else {
          cantidad = 'custom';
        }
      }

      setCardFormData({
        nombre: card.nombre || card.title || '',
        descripcion: card.descripcion || card.description || '',
        tipo: tipo,
        cantidad: cantidad,
        cantidadPersonalizada: cantidad === 'custom' ? card.limiteTotal?.toString() || '' : '',
        sellosRequeridos: card.totalStamps?.toString() || '10',
        valorRecompensa: card.valorRecompensa || card.rewardText || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar la tarjeta');
      setEditingCardId(null);
    }
  };

  const handleCancelEditCard = () => {
    setEditingCardId(null);
    setCardFormData({
      nombre: '',
      descripcion: '',
      tipo: 'ilimitada',
      cantidad: 'ilimitado',
      cantidadPersonalizada: '',
      sellosRequeridos: '10',
      valorRecompensa: '',
    });
  };

  const handleSaveCard = async (cardId: string) => {
    try {
      setSavingCard(true);
      setError('');

      const data: any = {
        nombre: cardFormData.nombre,
        descripcion: cardFormData.descripcion,
        tipo: cardFormData.tipo,
        valorRecompensa: cardFormData.valorRecompensa,
      };

      if (cardFormData.tipo === 'limitada') {
        const limite = cardFormData.cantidad === 'custom' 
          ? parseInt(cardFormData.cantidadPersonalizada) 
          : (cardFormData.cantidad === 'ilimitado' ? null : parseInt(cardFormData.cantidad));
        
        if (limite === null || limite < 1) {
          setError('La cantidad debe ser mayor a 0 para tarjetas limitadas');
          setSavingCard(false);
          return;
        }
        data.limiteTotal = limite;
      } else {
        data.limiteTotal = null;
      }

      await adminService.updatePromoCard(cardId, data);
      await loadBusiness();
      setEditingCardId(null);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la tarjeta');
    } finally {
      setSavingCard(false);
    }
  };

  const handleCreateCard = () => {
    setIsCreatingCard(true);
    setCardFormData({
      nombre: '',
      descripcion: '',
      tipo: 'ilimitada',
      cantidad: 'ilimitado',
      cantidadPersonalizada: '',
      sellosRequeridos: '10',
      valorRecompensa: '',
    });
    setError('');
  };

  const handleCancelCreateCard = () => {
    setIsCreatingCard(false);
    setCardFormData({
      nombre: '',
      descripcion: '',
      tipo: 'ilimitada',
      cantidad: 'ilimitado',
      cantidadPersonalizada: '',
      sellosRequeridos: '10',
      valorRecompensa: '',
    });
  };

  const handleSaveNewCard = async () => {
    try {
      setSavingCard(true);
      setError('');

      if (!cardFormData.nombre || !cardFormData.valorRecompensa) {
        setError('Nombre y valor de recompensa son requeridos');
        setSavingCard(false);
        return;
      }

      const data: any = {
        businessId: id!,
        nombre: cardFormData.nombre,
        descripcion: cardFormData.descripcion,
        tipo: cardFormData.tipo,
        valorRecompensa: cardFormData.valorRecompensa,
        totalStamps: parseInt(cardFormData.sellosRequeridos) || 10,
      };

      if (cardFormData.tipo === 'limitada') {
        const limite = cardFormData.cantidad === 'custom' 
          ? parseInt(cardFormData.cantidadPersonalizada) 
          : (cardFormData.cantidad === 'ilimitado' ? null : parseInt(cardFormData.cantidad));
        
        if (limite === null || limite < 1) {
          setError('La cantidad debe ser mayor a 0 para tarjetas limitadas');
          setSavingCard(false);
          return;
        }
        data.limiteTotal = limite;
      } else {
        data.limiteTotal = null;
      }

      await adminService.createPromoCard(data);
      await loadBusiness();
      setIsCreatingCard(false);
    } catch (err: any) {
      setError(err.message || 'Error al crear la tarjeta');
    } finally {
      setSavingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la tarjeta "${nombre}"?`)) {
      return;
    }

    try {
      setDeletingCardId(cardId);
      setError('');
      await adminService.deletePromoCard(cardId);
      await loadBusiness();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la tarjeta');
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      await adminService.updateBusiness(id!, {
        name: formData.name,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
      });
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => {
        setSuccess(false);
        loadBusiness();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el negocio');
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
              <IonBackButton defaultHref="/admin/dashboard" />
            </IonButtons>
            <IonTitle>Detalles del Negocio</IonTitle>
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

  if (error && !business) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/admin/dashboard" />
            </IonButtons>
            <IonTitle>Detalles del Negocio</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="error-container">
            <IonText color="danger">{error}</IonText>
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
            <IonBackButton defaultHref="/admin/dashboard" />
          </IonButtons>
          <IonTitle>Detalles del Negocio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="details-container">
          {/* Business Info Card */}
          <IonCard className="business-info-card">
            <IonCardContent>
              <div className="business-info-header">
                <h2 className="section-title">Información del Negocio</h2>
                {!isEditing && (
                  <IonButton
                    size="small"
                    fill="outline"
                    onClick={handleEdit}
                    className="edit-button"
                  >
                    <IonIcon icon={createOutline} slot="start" />
                    Editar
                  </IonButton>
                )}
              </div>

              {error && (
                <IonText color="danger" className="error-message">
                  {error}
                </IonText>
              )}

              {success && (
                <IonText color="success" className="success-message">
                  <IonIcon icon={checkmarkCircle} /> Negocio actualizado correctamente
                </IonText>
              )}

              {!isEditing ? (
                <div className="business-info-view">
                  <div className="info-row">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{business?.name || 'N/A'}</span>
                  </div>
                  {business?.description && (
                    <div className="info-row">
                      <span className="info-label">Descripción:</span>
                      <span className="info-value">{business.description}</span>
                    </div>
                  )}
                  {business?.logoUrl && (
                    <div className="info-row">
                      <span className="info-label">Logo:</span>
                      <span className="info-value">
                        <a href={business.logoUrl} target="_blank" rel="noopener noreferrer">
                          {business.logoUrl}
                        </a>
                      </span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Propietario:</span>
                    <span className="info-value">{business?.ownerId?.email || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <IonItem>
                    <IonLabel position="stacked">Nombre del Negocio *</IonLabel>
                    <IonInput
                      value={formData.name}
                      onIonInput={(e) => setFormData({ ...formData, name: e.detail.value! })}
                      required
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Descripción</IonLabel>
                    <IonTextarea
                      value={formData.description}
                      onIonInput={(e) => setFormData({ ...formData, description: e.detail.value! })}
                      rows={3}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">URL del Logo</IonLabel>
                    <IonInput
                      type="url"
                      value={formData.logoUrl}
                      onIonInput={(e) => setFormData({ ...formData, logoUrl: e.detail.value! })}
                    />
                  </IonItem>

                  <div className="form-actions">
                    <IonButton
                      fill="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <IonIcon icon={closeOutline} slot="start" />
                      Cancelar
                    </IonButton>
                    <IonButton
                      type="submit"
                      disabled={saving}
                      className="submit-button"
                    >
                      {saving ? (
                        <>
                          <IonSpinner name="crescent" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <IonIcon icon={checkmarkCircle} slot="start" />
                          Guardar
                        </>
                      )}
                    </IonButton>
                  </div>
                </form>
              )}
            </IonCardContent>
          </IonCard>

          {/* Promo Cards Section */}
          <IonCard>
            <IonCardContent>
              <div className="cards-header">
                <h2 className="section-title">Tarjetas de Promoción</h2>
                <IonButton
                  size="small"
                  onClick={handleCreateCard}
                  disabled={isCreatingCard}
                >
                  <IonIcon icon={add} slot="start" />
                  Nueva Tarjeta
                </IonButton>
              </div>

              {isCreatingCard && (
                <div className="card-create-form">
                  <h4>Nueva Tarjeta</h4>
                  <IonItem>
                    <IonLabel position="stacked">Nombre *</IonLabel>
                    <IonInput
                      value={cardFormData.nombre}
                      onIonInput={(e) => setCardFormData({ ...cardFormData, nombre: e.detail.value! })}
                      required
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Descripción</IonLabel>
                    <IonTextarea
                      value={cardFormData.descripcion}
                      onIonInput={(e) => setCardFormData({ ...cardFormData, descripcion: e.detail.value! })}
                      rows={2}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Cantidad de personas que pueden obtener la tarjeta *</IonLabel>
                    <IonSelect
                      value={cardFormData.cantidad}
                      onIonChange={(e) => {
                        const cantidad = e.detail.value;
                        if (cantidad === 'ilimitado') {
                          setCardFormData({ ...cardFormData, cantidad: 'ilimitado', tipo: 'ilimitada' });
                        } else {
                          setCardFormData({ ...cardFormData, cantidad: cantidad, tipo: 'limitada' });
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
                  {cardFormData.cantidad === 'custom' && (
                    <IonItem>
                      <IonLabel position="stacked">Cantidad Personalizada *</IonLabel>
                      <IonInput
                        type="number"
                        value={cardFormData.cantidadPersonalizada}
                        onIonInput={(e) => setCardFormData({ ...cardFormData, cantidadPersonalizada: e.detail.value! })}
                        min="1"
                        required
                      />
                    </IonItem>
                  )}
                  <IonItem>
                    <IonLabel position="stacked">Número de Sellos Requeridos para Canjear *</IonLabel>
                    <IonInput
                      type="number"
                      value={cardFormData.sellosRequeridos}
                      onIonInput={(e) => setCardFormData({ ...cardFormData, sellosRequeridos: e.detail.value! })}
                      min="1"
                      required
                      placeholder="Ej: 10"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Valor de la Recompensa *</IonLabel>
                    <IonTextarea
                      value={cardFormData.valorRecompensa}
                      onIonInput={(e) => setCardFormData({ ...cardFormData, valorRecompensa: e.detail.value! })}
                      rows={2}
                      required
                    />
                  </IonItem>
                  <div className="card-edit-actions">
                    <IonButton
                      fill="outline"
                      onClick={handleCancelCreateCard}
                      disabled={savingCard}
                    >
                      Cancelar
                    </IonButton>
                    <IonButton
                      onClick={handleSaveNewCard}
                      disabled={savingCard || !cardFormData.nombre || !cardFormData.valorRecompensa}
                    >
                      {savingCard ? (
                        <>
                          <IonSpinner name="crescent" />
                          Guardando...
                        </>
                      ) : (
                        'Crear Tarjeta'
                      )}
                    </IonButton>
                  </div>
                </div>
              )}

              {promoCards.length === 0 && !isCreatingCard ? (
                <p className="empty-message">No hay tarjetas creadas aún</p>
              ) : (
                <div className="cards-list">
                  {promoCards.map((card) => {
                    const cardId = card._id || card.id;
                    const isEditingThisCard = editingCardId === cardId;
                    
                    return (
                      <IonCard key={cardId} className="promo-card-item">
                        <IonCardContent>
                          {!isEditingThisCard ? (
                            <>
                              <div className="card-header">
                                <div className="card-info">
                                  <h3>{card.nombre || card.title}</h3>
                                  {card.descripcion && (
                                    <p className="card-description">{card.descripcion || card.description}</p>
                                  )}
                                </div>
                                <div className="card-header-actions">
                                  <IonButton
                                    fill="clear"
                                    size="small"
                                    onClick={() => handleEditCard(cardId)}
                                  >
                                    <IonIcon icon={pencilOutline} />
                                  </IonButton>
                                  <IonButton
                                    fill="clear"
                                    size="small"
                                    color="danger"
                                    onClick={() => handleDeleteCard(cardId, card.nombre || card.title)}
                                    disabled={deletingCardId === cardId}
                                  >
                                    {deletingCardId === cardId ? (
                                      <IonSpinner name="crescent" />
                                    ) : (
                                      <IonIcon icon={trashOutline} />
                                    )}
                                  </IonButton>
                                  <IonBadge 
                                    color={card.estado === 'activa' || card.active ? 'success' : 'danger'} 
                                    className={`${card.estado === 'activa' || card.active ? 'active-badge' : 'inactive-badge'} clickable-badge`}
                                    onClick={() => handleToggleCardActive(cardId, card.active || card.estado === 'activa')}
                                  >
                                    {togglingCard === cardId ? (
                                      <>
                                        <IonSpinner name="crescent" />
                                        {card.active || card.estado === 'activa' ? 'Desactivando...' : 'Activando...'}
                                      </>
                                    ) : (
                                      card.estado === 'activa' || card.active ? 'Activa' : 'Inactiva'
                                    )}
                                  </IonBadge>
                                </div>
                              </div>

                              <div className="card-details">
                                <IonItem>
                                  <IonLabel>
                                    <h4>Tipo</h4>
                                    <p>{card.tipo === 'ilimitada' ? 'Ilimitada' : card.tipo === 'limitada' ? 'Limitada' : 'Sellos'}</p>
                                  </IonLabel>
                                </IonItem>
                                {card.tipo === 'limitada' && (
                                  <>
                                    <IonItem>
                                      <IonLabel>
                                        <h4>Límite Total</h4>
                                        <p>{card.limiteTotal}</p>
                                      </IonLabel>
                                    </IonItem>
                                    <IonItem>
                                      <IonLabel>
                                        <h4>Disponibles</h4>
                                        <p>{card.limiteActual || 0}</p>
                                      </IonLabel>
                                    </IonItem>
                                  </>
                                )}
                                {(card.type === 'stamp' || card.totalStamps) && (
                                  <IonItem>
                                    <IonLabel>
                                      <h4>Sellos Requeridos</h4>
                                      <p>{card.totalStamps}</p>
                                    </IonLabel>
                                  </IonItem>
                                )}
                                <IonItem>
                                  <IonLabel>
                                    <h4>Recompensa</h4>
                                    <p>{card.valorRecompensa || card.rewardText}</p>
                                  </IonLabel>
                                </IonItem>
                              </div>
                            </>
                          ) : (
                            <div className="card-edit-form">
                              <h4>Editar Tarjeta</h4>
                              <IonItem>
                                <IonLabel position="stacked">Nombre *</IonLabel>
                                <IonInput
                                  value={cardFormData.nombre}
                                  onIonInput={(e) => setCardFormData({ ...cardFormData, nombre: e.detail.value! })}
                                  required
                                />
                              </IonItem>
                              <IonItem>
                                <IonLabel position="stacked">Descripción</IonLabel>
                                <IonTextarea
                                  value={cardFormData.descripcion}
                                  onIonInput={(e) => setCardFormData({ ...cardFormData, descripcion: e.detail.value! })}
                                  rows={2}
                                />
                              </IonItem>
                              <IonItem>
                                <IonLabel position="stacked">Cantidad de personas que pueden obtener la tarjeta *</IonLabel>
                                <IonSelect
                                  value={cardFormData.cantidad}
                                  onIonChange={(e) => {
                                    const cantidad = e.detail.value;
                                    if (cantidad === 'ilimitado') {
                                      setCardFormData({ ...cardFormData, cantidad: 'ilimitado', tipo: 'ilimitada' });
                                    } else {
                                      setCardFormData({ ...cardFormData, cantidad: cantidad, tipo: 'limitada' });
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
                              {cardFormData.cantidad === 'custom' && (
                                <IonItem>
                                  <IonLabel position="stacked">Cantidad Personalizada *</IonLabel>
                                  <IonInput
                                    type="number"
                                    value={cardFormData.cantidadPersonalizada}
                                    onIonInput={(e) => setCardFormData({ ...cardFormData, cantidadPersonalizada: e.detail.value! })}
                                    min="1"
                                    required
                                  />
                                </IonItem>
                              )}
                              <IonItem>
                                <IonLabel position="stacked">Número de Sellos Requeridos para Canjear *</IonLabel>
                                <IonInput
                                  type="number"
                                  value={cardFormData.sellosRequeridos}
                                  onIonInput={(e) => setCardFormData({ ...cardFormData, sellosRequeridos: e.detail.value! })}
                                  min="1"
                                  required
                                  placeholder="Ej: 10"
                                />
                              </IonItem>
                              <IonItem>
                                <IonLabel position="stacked">Valor de la Recompensa *</IonLabel>
                                <IonTextarea
                                  value={cardFormData.valorRecompensa}
                                  onIonInput={(e) => setCardFormData({ ...cardFormData, valorRecompensa: e.detail.value! })}
                                  rows={2}
                                  required
                                />
                              </IonItem>
                              <div className="card-edit-actions">
                                <IonButton
                                  fill="outline"
                                  onClick={handleCancelEditCard}
                                  disabled={savingCard}
                                >
                                  Cancelar
                                </IonButton>
                                <IonButton
                                  onClick={() => handleSaveCard(cardId)}
                                  disabled={savingCard || !cardFormData.nombre || !cardFormData.valorRecompensa}
                                >
                                  {savingCard ? (
                                    <>
                                      <IonSpinner name="crescent" />
                                      Guardando...
                                    </>
                                  ) : (
                                    'Guardar'
                                  )}
                                </IonButton>
                              </div>
                            </div>
                          )}
                        </IonCardContent>
                      </IonCard>
                    );
                  })}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BusinessDetails;


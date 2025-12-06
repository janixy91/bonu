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
  IonButton,
  IonText,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonBackButton,
  IonList,
  IonBadge,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { downloadOutline, addOutline, refreshOutline } from 'ionicons/icons';
import { useAuthStore } from '../store/authStore';
import { businessOwnerService, codeService } from '../services/api.service';
import jsPDF from 'jspdf';
import './GenerateCodes.css';

interface Code {
  id: string;
  code: string;
  benefitName: string;
  expirationDate: string;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
}

const GenerateCodes: React.FC = () => {
  const [business, setBusiness] = useState<any>(null);
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    benefitName: '',
    expirationDate: '',
    count: '10',
  });
  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0 });
  const history = useHistory();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const businessResponse = await businessOwnerService.getMyBusiness();
      setBusiness(businessResponse.business);

      if (businessResponse.business?._id) {
        await loadCodes(businessResponse.business._id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCodes = async (businessId: string) => {
    try {
      const response = await codeService.getBusinessCodes(businessId);
      setCodes(response.codes);
      setStats({
        total: response.total,
        used: response.used,
        unused: response.unused,
      });
    } catch (error) {
      console.error('Error loading codes:', error);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?._id) return;

    try {
      setGenerating(true);
      const response = await codeService.generateCodes({
        businessId: business._id,
        benefitName: formData.benefitName,
        expirationDate: formData.expirationDate,
        count: parseInt(formData.count),
      });

      // Reset form
      setFormData({
        benefitName: '',
        expirationDate: '',
        count: '10',
      });

      // Reload codes
      await loadCodes(business._id);
    } catch (error: any) {
      alert(error.message || 'Error al generar códigos');
    } finally {
      setGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (codes.length === 0) {
      alert('No hay códigos para exportar');
      return;
    }

    const headers = ['Código', 'Beneficio', 'Fecha Expiración', 'Estado', 'Fecha Uso'];
    const rows = codes.map((code) => [
      code.code,
      code.benefitName,
      new Date(code.expirationDate).toLocaleDateString('es-ES'),
      code.used ? 'Usado' : 'Disponible',
      code.usedAt ? new Date(code.usedAt).toLocaleDateString('es-ES') : '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `codigos_${business?.name || 'negocio'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (codes.length === 0) {
      alert('No hay códigos para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const lineHeight = 7;
    let yPos = margin + 10;

    // Title
    doc.setFontSize(18);
    doc.text('Códigos de Canje', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Business info
    doc.setFontSize(12);
    doc.text(`Negocio: ${business?.name || 'N/A'}`, margin, yPos);
    yPos += 7;
    doc.text(`Total: ${stats.total} | Usados: ${stats.used} | Disponibles: ${stats.unused}`, margin, yPos);
    yPos += 10;

    // Table header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Código', margin, yPos);
    doc.text('Beneficio', margin + 50, yPos);
    doc.text('Expiración', margin + 100, yPos);
    doc.text('Estado', margin + 150, yPos);
    yPos += 5;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // Table rows
    doc.setFont(undefined, 'normal');
    codes.forEach((code, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin + 10;
      }

      doc.setFontSize(9);
      doc.text(code.code, margin, yPos);
      doc.text(code.benefitName.substring(0, 20), margin + 50, yPos);
      doc.text(new Date(code.expirationDate).toLocaleDateString('es-ES'), margin + 100, yPos);
      doc.text(code.used ? 'Usado' : 'Disponible', margin + 150, yPos);
      yPos += lineHeight;
    });

    // Save
    doc.save(`codigos_${business?.name || 'negocio'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Generar Códigos</IonTitle>
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

  if (!business) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Generar Códigos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardContent>
              <p>No se encontró un negocio asociado a tu cuenta.</p>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  // Set default expiration date to 30 days from now
  const defaultExpirationDate = new Date();
  defaultExpirationDate.setDate(defaultExpirationDate.getDate() + 30);
  const defaultDateString = defaultExpirationDate.toISOString().split('T')[0];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/business-owner/dashboard" />
          </IonButtons>
          <IonTitle>Generar Códigos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="generate-codes-container">
          {/* Stats Card */}
          <IonCard>
            <IonCardContent>
              <h2 className="section-title">Estadísticas</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value success">{stats.unused}</div>
                  <div className="stat-label">Disponibles</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value danger">{stats.used}</div>
                  <div className="stat-label">Usados</div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Generate Form */}
          <IonCard>
            <IonCardContent>
              <h2 className="section-title">Generar Nuevos Códigos</h2>
              <form onSubmit={handleGenerate}>
                <IonItem>
                  <IonLabel position="stacked">Nombre del Beneficio *</IonLabel>
                  <IonInput
                    value={formData.benefitName}
                    onIonInput={(e) => setFormData({ ...formData, benefitName: e.detail.value! })}
                    placeholder="Ej: Desayuno completo"
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Fecha de Expiración *</IonLabel>
                  <IonInput
                    type="date"
                    value={formData.expirationDate || defaultDateString}
                    onIonInput={(e) => setFormData({ ...formData, expirationDate: e.detail.value! })}
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Cantidad de Códigos *</IonLabel>
                  <IonInput
                    type="number"
                    value={formData.count}
                    onIonInput={(e) => setFormData({ ...formData, count: e.detail.value! })}
                    min="1"
                    max="100"
                    required
                  />
                  <IonText slot="helper" color="medium">
                    Máximo 100 códigos por generación
                  </IonText>
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  disabled={generating}
                  className="generate-button"
                >
                  {generating ? (
                    <>
                      <IonSpinner name="crescent" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <IonIcon icon={addOutline} slot="start" />
                      Generar Códigos
                    </>
                  )}
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>

          {/* Export Buttons */}
          {codes.length > 0 && (
            <IonCard>
              <IonCardContent>
                <h2 className="section-title">Exportar Códigos</h2>
                <div className="export-buttons">
                  <IonButton expand="block" fill="outline" onClick={exportToCSV}>
                    <IonIcon icon={downloadOutline} slot="start" />
                    Exportar CSV
                  </IonButton>
                  <IonButton expand="block" fill="outline" onClick={exportToPDF}>
                    <IonIcon icon={downloadOutline} slot="start" />
                    Exportar PDF
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* Codes List */}
          {codes.length > 0 && (
            <IonCard>
              <IonCardContent>
                <div className="codes-header">
                  <h2 className="section-title">Lista de Códigos</h2>
                  <IonButton fill="clear" size="small" onClick={() => loadCodes(business._id)}>
                    <IonIcon icon={refreshOutline} />
                  </IonButton>
                </div>
                <IonList>
                  {codes.map((code) => (
                    <IonItem key={code.id} className="code-item">
                      <IonLabel>
                        <h2>
                          <strong>{code.code}</strong>
                          <IonBadge color={code.used ? 'danger' : 'success'} slot="end">
                            {code.used ? 'Usado' : 'Disponible'}
                          </IonBadge>
                        </h2>
                        <p>{code.benefitName}</p>
                        <p className="code-meta">
                          Expira: {formatDate(code.expirationDate)}
                          {code.used && code.usedAt && (
                            <> | Usado: {formatDate(code.usedAt)}</>
                          )}
                        </p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GenerateCodes;


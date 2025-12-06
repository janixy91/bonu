import PromoCard from '../models/PromoCard.model.js';
import TarjetaCliente from '../models/TarjetaCliente.model.js';
import Business from '../models/Business.model.js';

/**
 * POST /admin/promo-cards
 * Create a new promo card for a business (admin only)
 */
export const createPromoCard = async (req, res) => {
  try {
    const { businessId, nombre, descripcion, tipo, limiteTotal, valorRecompensa } = req.body;

    if (!businessId || !nombre || !tipo || !valorRecompensa) {
      return res.status(400).json({ error: 'businessId, nombre, tipo y valorRecompensa son requeridos' });
    }

    if (tipo !== 'ilimitada' && tipo !== 'limitada') {
      return res.status(400).json({ error: 'tipo debe ser "ilimitada" o "limitada"' });
    }

    if (tipo === 'limitada' && (!limiteTotal || limiteTotal < 1)) {
      return res.status(400).json({ error: 'limiteTotal es requerido y debe ser mayor a 0 para tarjetas limitadas' });
    }

    // Verificar que el negocio existe
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const promoCard = new PromoCard({
      businessId,
      nombre,
      descripcion: descripcion || '',
      tipo,
      limiteTotal: tipo === 'limitada' ? limiteTotal : null,
      limiteActual: tipo === 'limitada' ? limiteTotal : null,
      valorRecompensa,
      estado: 'activa',
      active: true,
      isDeleted: false,
      // Legacy fields
      title: nombre,
      description: descripcion || '',
      type: 'stamp',
      totalStamps: 10,
      rewardText: valorRecompensa,
    });

    await promoCard.save();

    res.status(201).json({
      message: 'Promo card created successfully',
      promoCard,
    });
  } catch (error) {
    console.error('Create promo card error:', error);
    res.status(500).json({ error: 'Failed to create promo card' });
  }
};

/**
 * GET /admin/promo-cards/:id
 * Get a promo card by id (admin only)
 */
export const getPromoCard = async (req, res) => {
  try {
    const { id } = req.params;
    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    const clientesConTarjeta = await TarjetaCliente.countDocuments({ tarjetaId: promoCard._id });

    res.json({
      promoCard: {
        ...promoCard.toObject(),
        clientesConTarjeta,
      },
    });
  } catch (error) {
    console.error('Get promo card error:', error);
    res.status(500).json({ error: 'Failed to get promo card' });
  }
};

/**
 * PUT /admin/promo-cards/:id
 * Update a promo card (admin only)
 */
export const updatePromoCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, tipo, limiteTotal, valorRecompensa } = req.body;

    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    // Verificar si tiene clientes
    const tieneClientes = await TarjetaCliente.exists({ tarjetaId: promoCard._id });

    // Validaciones si tiene clientes
    if (tieneClientes) {
      // No se puede cambiar de limitada a ilimitada si ya se alcanzó el límite
      if (promoCard.tipo === 'limitada' && promoCard.limiteActual <= 0 && tipo === 'ilimitada') {
        return res.status(400).json({
          error: 'No se puede cambiar a ilimitada si ya se alcanzó el límite',
        });
      }

      // No se puede bajar el límite por debajo de lo ya reclamado
      if (tipo === 'limitada' && limiteTotal !== undefined) {
        const tarjetasReclamadas = await TarjetaCliente.countDocuments({ tarjetaId: promoCard._id });
        const limiteUsado = promoCard.limiteTotal ? promoCard.limiteTotal - promoCard.limiteActual : 0;
        if (limiteTotal < limiteUsado) {
          return res.status(400).json({
            error: `No se puede bajar el límite por debajo de ${limiteUsado} (ya reclamadas)`,
          });
        }
      }
    }

    // Actualizar campos
    if (nombre !== undefined) {
      promoCard.nombre = nombre;
      promoCard.title = nombre; // Legacy
    }
    if (descripcion !== undefined) {
      promoCard.descripcion = descripcion;
      promoCard.description = descripcion; // Legacy
    }
    if (valorRecompensa !== undefined) {
      promoCard.valorRecompensa = valorRecompensa;
      promoCard.rewardText = valorRecompensa; // Legacy
    }

    // Manejar cambio de tipo
    if (tipo !== undefined && tipo !== promoCard.tipo) {
      if (tipo === 'ilimitada') {
        promoCard.tipo = 'ilimitada';
        promoCard.limiteTotal = null;
        promoCard.limiteActual = null;
      } else if (tipo === 'limitada') {
        if (!limiteTotal || limiteTotal < 1) {
          return res.status(400).json({ error: 'limiteTotal es requerido para tarjetas limitadas' });
        }
        promoCard.tipo = 'limitada';
        const limiteUsado = promoCard.limiteTotal ? promoCard.limiteTotal - promoCard.limiteActual : 0;
        promoCard.limiteTotal = limiteTotal;
        promoCard.limiteActual = limiteTotal - limiteUsado;
      }
    }

    // Actualizar límite si es limitada
    if (tipo === 'limitada' && limiteTotal !== undefined && limiteTotal !== promoCard.limiteTotal) {
      const limiteUsado = promoCard.limiteTotal ? promoCard.limiteTotal - promoCard.limiteActual : 0;
      promoCard.limiteTotal = limiteTotal;
      promoCard.limiteActual = limiteTotal - limiteUsado;
    }

    promoCard.version += 1;
    await promoCard.save();

    res.json({
      message: 'Promo card updated successfully',
      promoCard,
    });
  } catch (error) {
    console.error('Update promo card error:', error);
    res.status(500).json({ error: 'Failed to update promo card' });
  }
};

/**
 * DELETE /admin/promo-cards/:id
 * Delete a promo card (admin only, only if no clients have it)
 */
export const deletePromoCard = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    // Verificar si tiene clientes
    const tieneClientes = await TarjetaCliente.exists({ tarjetaId: promoCard._id });

    if (tieneClientes) {
      return res.status(400).json({
        error: 'No se puede eliminar una tarjeta que tiene clientes asignados. Desactívala en su lugar.',
      });
    }

    promoCard.estado = 'eliminada';
    promoCard.isDeleted = true;
    await promoCard.save();

    res.json({
      message: 'Promo card deleted successfully',
    });
  } catch (error) {
    console.error('Delete promo card error:', error);
    res.status(500).json({ error: 'Failed to delete promo card' });
  }
};

/**
 * PATCH /admin/promo-cards/:id/activate
 * Activate or deactivate a promo card (admin only)
 */
export const togglePromoCardActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be a boolean' });
    }

    const promoCard = await PromoCard.findById(id);

    if (!promoCard) {
      return res.status(404).json({ error: 'Promo card not found' });
    }

    promoCard.active = active;
    promoCard.estado = active ? 'activa' : 'desactivada';
    await promoCard.save();

    res.json({
      message: `Promo card ${active ? 'activated' : 'deactivated'} successfully`,
      promoCard,
    });
  } catch (error) {
    console.error('Toggle promo card active error:', error);
    res.status(500).json({ error: 'Failed to update promo card' });
  }
};


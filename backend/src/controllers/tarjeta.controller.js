import PromoCard from '../models/PromoCard.model.js';
import TarjetaCliente from '../models/TarjetaCliente.model.js';
import Business from '../models/Business.model.js';

/**
 * GET /business-owner/tarjetas
 * Obtener todas las tarjetas del comercio
 */
export const getTarjetas = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Obtener el negocio del usuario
    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const tarjetas = await PromoCard.find({
      businessId: business._id,
      estado: { $ne: 'eliminada' },
      isDeleted: false,
    }).sort({ createdAt: -1 });

    // Contar cuántos clientes tienen cada tarjeta
    const tarjetasConEstadisticas = await Promise.all(
      tarjetas.map(async (tarjeta) => {
        const count = await TarjetaCliente.countDocuments({ tarjetaId: tarjeta._id });
        return {
          ...tarjeta.toObject(),
          clientesConTarjeta: count,
        };
      })
    );

    res.json({ tarjetas: tarjetasConEstadisticas });
  } catch (error) {
    console.error('Get tarjetas error:', error);
    res.status(500).json({ error: 'Failed to get tarjetas' });
  }
};

/**
 * POST /business-owner/tarjetas
 * Crear una nueva tarjeta
 */
export const createTarjeta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { nombre, descripcion, tipo, limiteTotal, valorRecompensa, totalStamps } = req.body;

    if (!nombre || !tipo || !valorRecompensa) {
      return res.status(400).json({ error: 'nombre, tipo y valorRecompensa son requeridos' });
    }

    if (tipo !== 'ilimitada' && tipo !== 'limitada') {
      return res.status(400).json({ error: 'tipo debe ser "ilimitada" o "limitada"' });
    }

    if (tipo === 'limitada' && (!limiteTotal || limiteTotal < 1)) {
      return res.status(400).json({ error: 'limiteTotal es requerido y debe ser mayor a 0 para tarjetas limitadas' });
    }

    // Obtener el negocio del usuario
    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const tarjeta = new PromoCard({
      businessId: business._id,
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
      totalStamps: totalStamps || 10,
      rewardText: valorRecompensa,
    });

    await tarjeta.save();

    res.status(201).json({
      message: 'Tarjeta creada exitosamente',
      tarjeta,
    });
  } catch (error) {
    console.error('Create tarjeta error:', error);
    res.status(500).json({ error: 'Failed to create tarjeta' });
  }
};

/**
 * GET /business-owner/tarjetas/:id
 * Obtener una tarjeta específica
 */
export const getTarjeta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const tarjeta = await PromoCard.findOne({
      _id: id,
      businessId: business._id,
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta not found' });
    }

    const clientesConTarjeta = await TarjetaCliente.countDocuments({ tarjetaId: tarjeta._id });

    res.json({
      tarjeta: {
        ...tarjeta.toObject(),
        clientesConTarjeta,
      },
    });
  } catch (error) {
    console.error('Get tarjeta error:', error);
    res.status(500).json({ error: 'Failed to get tarjeta' });
  }
};

/**
 * PUT /business-owner/tarjetas/:id
 * Editar una tarjeta
 */
export const updateTarjeta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { nombre, descripcion, tipo, limiteTotal, valorRecompensa, totalStamps } = req.body;

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const tarjeta = await PromoCard.findOne({
      _id: id,
      businessId: business._id,
      estado: { $ne: 'eliminada' },
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta not found' });
    }

    // Verificar si tiene clientes
    const tieneClientes = await TarjetaCliente.exists({ tarjetaId: tarjeta._id });

    // Validaciones si tiene clientes
    if (tieneClientes) {
      // No se puede cambiar de limitada a ilimitada si ya se alcanzó el límite
      if (tarjeta.tipo === 'limitada' && tarjeta.limiteActual <= 0 && tipo === 'ilimitada') {
        return res.status(400).json({
          error: 'No se puede cambiar a ilimitada si ya se alcanzó el límite',
        });
      }

      // No se puede bajar el límite por debajo de lo ya reclamado
      if (tipo === 'limitada' && limiteTotal !== undefined) {
        const tarjetasReclamadas = await TarjetaCliente.countDocuments({ tarjetaId: tarjeta._id });
        const limiteUsado = tarjeta.limiteTotal - tarjeta.limiteActual;
        if (limiteTotal < limiteUsado) {
          return res.status(400).json({
            error: `No se puede bajar el límite por debajo de ${limiteUsado} (ya reclamadas)`,
          });
        }
      }
    }

    // Actualizar campos
    if (nombre !== undefined) {
      tarjeta.nombre = nombre;
      tarjeta.title = nombre; // Legacy
    }
    if (descripcion !== undefined) {
      tarjeta.descripcion = descripcion;
      tarjeta.description = descripcion; // Legacy
    }
    if (valorRecompensa !== undefined) {
      tarjeta.valorRecompensa = valorRecompensa;
      tarjeta.rewardText = valorRecompensa; // Legacy
    }
    if (totalStamps !== undefined) {
      tarjeta.totalStamps = totalStamps;
    }

    // Manejar cambio de tipo
    if (tipo !== undefined && tipo !== tarjeta.tipo) {
      if (tipo === 'ilimitada') {
        tarjeta.tipo = 'ilimitada';
        tarjeta.limiteTotal = null;
        tarjeta.limiteActual = null;
      } else if (tipo === 'limitada') {
        if (!limiteTotal || limiteTotal < 1) {
          return res.status(400).json({ error: 'limiteTotal es requerido para tarjetas limitadas' });
        }
        tarjeta.tipo = 'limitada';
        const limiteUsado = tarjeta.limiteTotal ? tarjeta.limiteTotal - tarjeta.limiteActual : 0;
        tarjeta.limiteTotal = limiteTotal;
        tarjeta.limiteActual = limiteTotal - limiteUsado;
      }
    }

    // Actualizar límite si es limitada
    if (tipo === 'limitada' && limiteTotal !== undefined && limiteTotal !== tarjeta.limiteTotal) {
      const limiteUsado = tarjeta.limiteTotal ? tarjeta.limiteTotal - tarjeta.limiteActual : 0;
      tarjeta.limiteTotal = limiteTotal;
      tarjeta.limiteActual = limiteTotal - limiteUsado;
    }

    tarjeta.version += 1;
    await tarjeta.save();

    res.json({
      message: 'Tarjeta actualizada exitosamente',
      tarjeta,
    });
  } catch (error) {
    console.error('Update tarjeta error:', error);
    res.status(500).json({ error: 'Failed to update tarjeta' });
  }
};

/**
 * PATCH /business-owner/tarjetas/:id/desactivar
 * Activar/Desactivar una tarjeta (toggle)
 */
export const desactivarTarjeta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { active } = req.body; // Optional: if provided, set to that value, otherwise toggle

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const tarjeta = await PromoCard.findOne({
      _id: id,
      businessId: business._id,
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta not found' });
    }

    if (tarjeta.estado === 'eliminada') {
      return res.status(400).json({ error: 'No se puede activar/desactivar una tarjeta eliminada' });
    }

    // If active is provided, use it; otherwise toggle
    const newActive = active !== undefined ? active : !tarjeta.active;
    
    tarjeta.estado = newActive ? 'activa' : 'desactivada';
    tarjeta.active = newActive;
    await tarjeta.save();

    res.json({
      message: `Tarjeta ${newActive ? 'activada' : 'desactivada'} exitosamente`,
      tarjeta,
    });
  } catch (error) {
    console.error('Desactivar tarjeta error:', error);
    res.status(500).json({ error: 'Failed to update tarjeta' });
  }
};

/**
 * DELETE /business-owner/tarjetas/:id
 * Eliminar una tarjeta (solo si no tiene clientes)
 */
export const deleteTarjeta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const tarjeta = await PromoCard.findOne({
      _id: id,
      businessId: business._id,
    });

    if (!tarjeta) {
      return res.status(404).json({ error: 'Tarjeta not found' });
    }

    // Verificar si tiene clientes
    const tieneClientes = await TarjetaCliente.exists({ tarjetaId: tarjeta._id });

    if (tieneClientes) {
      return res.status(400).json({
        error: 'No se puede eliminar una tarjeta que tiene clientes asignados. Desactívala en su lugar.',
      });
    }

    tarjeta.estado = 'eliminada';
    tarjeta.isDeleted = true;
    await tarjeta.save();

    res.json({
      message: 'Tarjeta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Delete tarjeta error:', error);
    res.status(500).json({ error: 'Failed to delete tarjeta' });
  }
};


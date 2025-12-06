import PromoCard from '../models/PromoCard.model.js';
import TarjetaCliente from '../models/TarjetaCliente.model.js';
import Business from '../models/Business.model.js';
import mongoose from 'mongoose';

/**
 * GET /cliente/tarjetas-disponibles
 * Obtener tarjetas disponibles para añadir
 */
export const getTarjetasDisponibles = async (req, res) => {
  try {
    const userId = req.user._id;

    // Obtener todas las tarjetas activas de todos los negocios
    const tarjetas = await PromoCard.find({
      estado: 'activa',
      isDeleted: false,
    }).populate('businessId', 'name logoUrl');

    // Filtrar las que el usuario ya tiene
    const tarjetasUsuario = await TarjetaCliente.find({ clienteId: userId }).select('tarjetaId');
    const tarjetasIdsUsuario = tarjetasUsuario.map(t => t.tarjetaId.toString());

    const tarjetasDisponibles = tarjetas
      .filter(tarjeta => {
        // Si ya la tiene, no está disponible
        if (tarjetasIdsUsuario.includes(tarjeta._id.toString())) {
          return false;
        }

        // Si es limitada y no quedan unidades, no está disponible
        if (tarjeta.tipo === 'limitada' && tarjeta.limiteActual <= 0) {
          return false;
        }

        return true;
      })
      .map(tarjeta => ({
        id: tarjeta._id,
        nombre: tarjeta.nombre || tarjeta.title,
        descripcion: tarjeta.descripcion || tarjeta.description,
        tipo: tarjeta.tipo || (tarjeta.type === 'stamp' ? 'limitada' : 'ilimitada'),
        limiteTotal: tarjeta.limiteTotal,
        limiteActual: tarjeta.limiteActual,
        valorRecompensa: tarjeta.valorRecompensa || tarjeta.rewardText,
        comercio: tarjeta.businessId,
        disponible: tarjeta.tipo === 'ilimitada' || (tarjeta.limiteActual && tarjeta.limiteActual > 0),
      }));

    res.json({ tarjetas: tarjetasDisponibles });
  } catch (error) {
    console.error('Get tarjetas disponibles error:', error);
    res.status(500).json({ error: 'Failed to get available tarjetas' });
  }
};

/**
 * POST /cliente/tarjetas/:id/anadir
 * Añadir una tarjeta al cliente
 */
export const anadirTarjeta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Verificar que la tarjeta existe y está activa
    const tarjeta = await PromoCard.findOne({
      _id: id,
      estado: 'activa',
      isDeleted: false,
    }).session(session);

    if (!tarjeta) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Tarjeta no disponible' });
    }

    // Verificar si el usuario ya tiene la tarjeta
    const tarjetaExistente = await TarjetaCliente.findOne({
      tarjetaId: id,
      clienteId: userId,
    }).session(session);

    if (tarjetaExistente) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Ya tienes esta tarjeta' });
    }

    // Si es limitada, verificar y decrementar el límite
    if (tarjeta.tipo === 'limitada') {
      if (!tarjeta.limiteActual || tarjeta.limiteActual <= 0) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'No quedan unidades disponibles de esta tarjeta' });
      }

      // Decrementar el límite de forma atómica
      const resultado = await PromoCard.updateOne(
        { _id: id, limiteActual: { $gt: 0 } },
        { $inc: { limiteActual: -1 }, $inc: { version: 1 } }
      ).session(session);

      if (resultado.modifiedCount === 0) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'No quedan unidades disponibles' });
      }
    }

    // Crear la relación cliente-tarjeta
    const tarjetaCliente = new TarjetaCliente({
      tarjetaId: id,
      clienteId: userId,
      estado: 'activa',
      fechaAnadida: new Date(),
      sellosActuales: 0,
    });

    await tarjetaCliente.save({ session });

    await session.commitTransaction();

    // Obtener la tarjeta actualizada
    const tarjetaActualizada = await PromoCard.findById(id);

    res.status(201).json({
      message: 'Tarjeta añadida exitosamente',
      tarjeta: tarjetaActualizada,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Añadir tarjeta error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya tienes esta tarjeta' });
    }
    res.status(500).json({ error: 'Failed to add tarjeta' });
  } finally {
    session.endSession();
  }
};

/**
 * GET /cliente/mis-tarjetas
 * Obtener las tarjetas del cliente
 */
export const getMisTarjetas = async (req, res) => {
  try {
    const userId = req.user._id;

    const tarjetasCliente = await TarjetaCliente.find({ clienteId: userId })
      .populate({
        path: 'tarjetaId',
        populate: {
          path: 'businessId',
          select: 'name logoUrl',
        },
      })
      .sort({ fechaAnadida: -1 });

    const tarjetas = tarjetasCliente
      .filter(tc => tc.tarjetaId && tc.tarjetaId.estado !== 'eliminada')
      .map(tc => {
        const tarjeta = tc.tarjetaId;
        return {
          id: tarjeta._id,
          tarjetaClienteId: tc._id,
          nombre: tarjeta.nombre || tarjeta.title,
          descripcion: tarjeta.descripcion || tarjeta.description,
          tipo: tarjeta.tipo || (tarjeta.type === 'stamp' ? 'limitada' : 'ilimitada'),
          valorRecompensa: tarjeta.valorRecompensa || tarjeta.rewardText,
          estadoTarjeta: tarjeta.estado,
          estadoCliente: tc.estado,
          fechaAnadida: tc.fechaAnadida,
          fechaCanje: tc.fechaCanje,
          sellosActuales: tc.sellosActuales || 0,
          comercio: tarjeta.businessId,
          // Para compatibilidad con tarjetas de sellos
          totalStamps: tarjeta.totalStamps,
        };
      });

    res.json({ tarjetas });
  } catch (error) {
    console.error('Get mis tarjetas error:', error);
    res.status(500).json({ error: 'Failed to get my tarjetas' });
  }
};

/**
 * PATCH /cliente/tarjetas/:id/canjear
 * Canjear una tarjeta
 */
export const canjearTarjeta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // id de TarjetaCliente

    const tarjetaCliente = await TarjetaCliente.findOne({
      _id: id,
      clienteId: userId,
    }).populate('tarjetaId');

    if (!tarjetaCliente) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    if (tarjetaCliente.estado === 'canjeada') {
      return res.status(400).json({ error: 'Esta tarjeta ya fue canjeada' });
    }

    const tarjeta = tarjetaCliente.tarjetaId;
    if (!tarjeta || tarjeta.estado === 'eliminada') {
      return res.status(404).json({ error: 'Tarjeta no disponible' });
    }

    // Para tarjetas de sellos, verificar que tenga suficientes sellos
    if (tarjeta.type === 'stamp' || tarjeta.totalStamps) {
      const sellosNecesarios = tarjeta.totalStamps || 10;
      if (tarjetaCliente.sellosActuales < sellosNecesarios) {
        return res.status(400).json({
          error: `Necesitas ${sellosNecesarios - tarjetaCliente.sellosActuales} sellos más para canjear esta tarjeta`,
        });
      }
    }

    tarjetaCliente.estado = 'canjeada';
    tarjetaCliente.fechaCanje = new Date();
    await tarjetaCliente.save();

    res.json({
      message: 'Tarjeta canjeada exitosamente',
      tarjeta: tarjetaCliente,
    });
  } catch (error) {
    console.error('Canjear tarjeta error:', error);
    res.status(500).json({ error: 'Failed to redeem tarjeta' });
  }
};


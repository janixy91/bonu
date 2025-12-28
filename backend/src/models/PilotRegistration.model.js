import mongoose from 'mongoose';

const pilotRegistrationSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
pilotRegistrationSchema.index({ email: 1 });
pilotRegistrationSchema.index({ status: 1 });

export default mongoose.model('PilotRegistration', pilotRegistrationSchema);

// {
//     "_id": {
//       "$oid": "6932831d0a442618db6ad9a2"
//     },
//     "email": "jany.admin@gmail.com",
//     "name": "Admin",
//     "password": "$2b$10$Rcv47D.gLaF7gkuKeI9GNOQtxGNE0IZ6K4NDTvOKMimB5v9utlxqu",
//     "role": "admin"
//   }
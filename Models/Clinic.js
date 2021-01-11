import pkg from 'mongoose';
const { model, Schema } = pkg;

export const ClinicSchema = new Schema({
  name: {
    index: true,
    type: String,
    unique: true,
    trim: true,
    required: [true, 'Name field is required'],
    match: [/^[A-Za-z]+$/, 'Just text allowed'],
  },
  services: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
  ],
  doctors: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
  ],
});

export const ClinicModel = model('Clinic', ClinicSchema);

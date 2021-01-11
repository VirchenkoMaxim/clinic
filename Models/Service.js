import pkg from 'mongoose';
const { model, Schema } = pkg;

export const ServiceSchema = new Schema({
  name: {
    index: true,
    type: String,
    unique: true,
    required: [true, 'Name field is required'],
    match: [/^[A-Za-z]+$/, 'Just text allowed'],
  },
  doctors: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    },
  ],
  clinics: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
    },
  ],
});

export const ServiceModel = model('Service', ServiceSchema);

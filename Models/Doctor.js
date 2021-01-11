import pkg from 'mongoose';
const { model, Schema } = pkg;

export const DoctorSchema = new Schema({
  name: {
    index: true,
    type: String,
    unique: true,
    required: [true, 'Name field is required'],
    match: [/^[A-Za-z]+$/, 'Just text allowed'],
  },
  services: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
  ],
  clinics: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
    },
  ],
});

export const DoctorModel = model('Doctor', DoctorSchema);

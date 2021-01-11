import pkg from 'mongoose';
const { model, Schema } = pkg;

export const AdminSchema = new Schema({
  name: {
    index: true,
    required: true,
    type: String,
    unique: true,
  },
  pasword: {
    required: true,
    type: String,
  },
});

export const AdminModel = model('Adnmin', AdminSchema);

import mongoose from 'mongoose';
//Set up default mongoose connection
var mongoDB =
  'mongodb+srv://max_vi:max@cluster0.rndnq.gcp.mongodb.net/clinic?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export { db };

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/lms", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// // menambah 1 data
// const matkul = new Std({
//   matkul: "Struktur Data",
// });

// // // simpan ke collection
// matkul.save().then((matkul) => console.log(matkul));

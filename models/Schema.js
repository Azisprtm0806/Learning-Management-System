const mongoose = require("mongoose");

// Membuat Schema
// db admin
const Admin = mongoose.model("Admin", {
  nama: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  resetPasswordLink: {
    data: String,
    default: "",
  },
});

// db mahasiswa
const Mahasiswa = mongoose.model("Mahasiswa", {
  npm: {
    type: String,
    required: true,
  },
  nama: {
    type: String,
    required: true,
  },
  nohp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

// db dosen
const Dosen = mongoose.model("dosen", {
  nama: {
    type: String,
    required: true,
  },
  matkul: {
    type: String,
    required: true,
  },
});

// db matakuliah
const Aljabar = mongoose.model("aljabar", {
  matkul: {
    type: String,
  },
  presensi: {
    type: String,
  },
  materi: {
    type: String,
  },
});

const Tekdig = mongoose.model("tekdig", {
  matkul: {
    type: String,
  },
  presensi: {
    type: String,
  },
  materi: {
    type: String,
  },
});

const Matdis = mongoose.model("matdis", {
  matkul: {
    type: String,
  },
  presensi: {
    type: String,
  },
  materi: {
    type: String,
  },
});

const KalkulusII = mongoose.model("kalkulusII", {
  matkul: {
    type: String,
  },
  presensi: {
    type: String,
  },
  materi: {
    type: String,
  },
});

const Std = mongoose.model("std", {
  matkul: {
    type: String,
  },
  presensi: {
    type: String,
  },
  materi: {
    type: String,
  },
});

module.exports = {
  Mahasiswa,
  Dosen,
  Admin,
  Aljabar,
  Tekdig,
  Matdis,
  KalkulusII,
  Std,
};

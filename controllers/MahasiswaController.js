const { Mahasiswa, Dosen, Matakuliah } = require("../models/Schema");

exports.dashboard = (req, res) => {
  res.render("PageMahasiswa/dashboard", {
    layout: "layouts/mahasiswa-layouts",
    title: "Daftar Mahasiswa",
  });
};

exports.DataMahasiswa = async (req, res) => {
  const mahasiswa = await Mahasiswa.find();
  res.render("PageMahasiswa/mahasiswa", {
    layout: "layouts/mahasiswa-layouts",
    title: "Daftar Mahasiswa",
    mahasiswa: mahasiswa,
  });
};

exports.DataDosen = async (req, res) => {
  const dosen = await Dosen.find();
  res.render("PageMahasiswa/dosen", {
    layout: "layouts/mahasiswa-layouts",
    title: "Daftar Dosen",
    dosen: dosen,
  });
};

exports.DataCours = async (req, res) => {
  const mataKuliah = await Matakuliah.find();
  const aljabar = await Matakuliah.find({ matKul: "AljabarLinear" });
  const indo = await Matakuliah.find({ matKul: "BahasaIndonesia" });
  const kalkulus = await Matakuliah.find({ matKul: "KalkulusII" });
  const strukturData = await Matakuliah.find({ matKul: "StrukturData" });
  const tekDig = await Matakuliah.find({ matKul: "TeknikDigital" });
  const matDisk = await Matakuliah.find({ matKul: "MatematikaDiskrit" });
  const syar = await Matakuliah.find({ matKul: "Syari'ah" });
  const statiska = await Matakuliah.find({ matKul: "StatiskaProbabilitas" });
  res.render("PageMahasiswa/cours", {
    layout: "layouts/mahasiswa-layouts",
    title: "Cours",
    mataKuliah: mataKuliah,
    aljabar: aljabar,
    indo: indo,
    kalkulus: kalkulus,
    strukturData: strukturData,
    tekDig: tekDig,
    matDisk: matDisk,
    syar: syar,
    statiska: statiska,
    msg: req.flash("msg"),
  });
};

exports.Aljabar = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "AljabarLinear" });
  res.render("PageMahasiswa/cours/AljabarLinear", {
    title: "Mata Kuliah",
    layout: "layouts/mahasiswa-layouts",
    mataKuliah: mataKuliah,
  });
};

exports.indo = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "BahasaIndonesia" });
  res.render("PageMahasiswa/cours/BahasaIndonesia", {
    title: "Mata Kuliah",
    layout: "layouts/main-layouts",
    mataKuliah: mataKuliah,
  });
};

exports.kalkulus = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "KalkulusII" });
  res.render("PageMahasiswa/cours/KalkulusII", {
    title: "Mata Kuliah",
    layout: "layouts/main-layouts",
    mataKuliah: mataKuliah,
  });
};

exports.strukturData = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "StrukturData" });
  res.render("PageMahasiswa/cours/StrukturData", {
    title: "Mata Kuliah",
    layout: "layouts/main-layouts",
    mataKuliah: mataKuliah,
  });
};

exports.tekdik = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "TeknikDigital" });
  res.render("PageMahasiswa/cours/TeknikDigital", {
    title: "Mata Kuliah",
    layout: "layouts/main-layouts",
    mataKuliah: mataKuliah,
  });
};

exports.Matdisk = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "MatematikaDiskrit" });
  res.render("PageMahasiswa/cours/MatematikaDiskrit", {
    title: "Mata Kuliah",
    layout: "layouts/main-layouts",
    mataKuliah: mataKuliah,
  });
};

exports.syariah = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "Syari'ah" });
  res.render("PageMahasiswa/cours/Syari'ah", {
    title: "Mata Kuliah",
    layout: "layouts/main-layouts",
    mataKuliah: mataKuliah,
  });
};

exports.statiska = async (req, res) => {
  const mataKuliah = await Matakuliah.find({ matKul: "StatiskaProbabilitas" });
  res.render("PageMahasiswa/cours/StatiskaProbabilitas", {
    title: "Mata Kuliah",
    layout: "layouts/main-layouts",
    mataKuliah: mataKuliah,
  });
};

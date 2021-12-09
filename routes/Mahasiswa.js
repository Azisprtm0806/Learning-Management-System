const express = require("express");
const router = express.Router();
const {
  DataMahasiswa,
  dashboard,
  DataDosen,
  DataCours,
  Aljabar,
  indo,
  kalkulus,
  strukturData,
  tekdik,
  Matdisk,
  syariah,
  statiska,
} = require("../controllers/MahasiswaController");

router.get("/mahasiswa-dashboard", dashboard);
router.get("/mahasiswa-mahasiswa", DataMahasiswa);
router.get("/mahasiswa-dosen", DataDosen);
router.get("/mahasiswa-cours", DataCours);
router.get("/mahasiswa-AljabarLinear", Aljabar);
router.get("/mahasiswa-BahasaIndonesia", indo);
router.get("/mahasiswa-KalkulusII", kalkulus);
router.get("/mahasiswa-StrukturData", strukturData);
router.get("/mahasiswa-TeknikDigital", tekdik);
router.get("/mahasiswa-MatematikaDiskrit", Matdisk);
router.get("/mahasiswa-Syari'ah", syariah);
router.get("/mahasiswa-StatiskaProbabilitas", statiska);

module.exports = router;

require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { kirimEmail } = require("./helpers/sendEmail");
const RouteMahasiswa = require("./routes/Mahasiswa");
const multer = require("multer");
const path = require("path");

require("./utils/db");
const {
  Mahasiswa,
  Dosen,
  Admin,
  Aljabar,
  Tekdig,
  Matdis,
  KalkulusII,
  Std,
} = require("./models/Schema");

const app = express();
const port = 3000;

// set-up method override
app.use(methodOverride("_method"));

// setup multer img

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// set up body parser
app.use(bodyParser.json());

// set up2 multer img
app.use("/images", express.static(path.join(__dirname, "images"))); // url static unutk mengakses image
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// set up cors
app.use(cors());

// set-up ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// set-up cookie
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// Route Mahasiswa
app.use("/", RouteMahasiswa);

// halaman landing page
app.get("/", (req, res) => {
  res.render("index", {
    layout: "index",
    title: "index",
  });
});

// login page
app.get("/loginPage", (req, res) => {
  res.render("loginPage", {
    layout: "layouts/landingpage-layout",
    title: "Login Page",
  });
});
// <<<-------   Halaman Login/Daftar -------->>>

// daftar
app.get("/daftarAdmin", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.render("loginAdmin/daftarAdmin", {
      layout: "layouts/login-layouts",
      title: "Daftar",
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// proses daftar
app.post(
  "/daftarAdmin",
  [
    check("nama", "Nama tidak boleh kosong").notEmpty(),
    check("username", "Username tidak boleh kosong").notEmpty(),
    check("email", "email tidak boleh kosong")
      .notEmpty()
      .matches(/.+@.+..+/)
      .withMessage("email harus bertanda @"),
    check("password", "password tidak boleh kosong")
      .notEmpty()
      .isLength({ min: 8 })
      .withMessage("Password minimal 8 karakter"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("loginAdmin/daftarAdmin", {
        layout: "layouts/login-layouts",
        title: "daftar",
        errors: errors.array(),
      });
    } else {
      const { nama, username, email, password } = req.body;
      const image = req.file.path;

      const usernameAdmin = await Admin.findOne({ username: username });
      const emailAdmin = await Admin.findOne({ email: email });

      if (usernameAdmin) {
        return res.render("loginAdmin/daftarAdmin", {
          layout: "layouts/login-layouts",
          title: "daftar",
          message: "username sudah terdaftar!!",
        });
      }

      if (emailAdmin) {
        return res.render("loginAdmin/daftarAdmin", {
          layout: "layouts/login-layouts",
          title: "daftar",
          message: "email sudah terdaftar!!",
        });
      }

      const hashPassword = await bcryptjs.hash(password, 10);
      const admin = new Admin({
        nama: nama,
        username: username,
        email: email,
        password: hashPassword,
        image: image,
      });

      admin.save();

      return res.render("loginAdmin/daftarAdmin", {
        layout: "layouts/login-layouts",
        title: "daftar",
        berhasil: "Admin Berhasil di daftarkan",
      });
    }
  }
);

// halaman forgot password
app.get("/forgotPasswordAdmin", (req, res) => {
  res.render("loginAdmin/forgotPasswordAdmin", {
    layout: "layouts/login-layouts",
    title: "lupa password",
  });
});

// proses forgotPassword
app.post("/forgotPasswordAdmin", async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email: email });
  if (!admin) {
    return res.render("loginAdmin/forgotPasswordAdmin", {
      status: false,
      message: "Email tidak tersedia",
      layout: "layouts/login-layouts",
      title: "lupa password",
    });
  }

  const token = await jsonwebtoken.sign(
    {
      idadmin: admin._id,
    },
    process.env.JSWT_SECRET
  );

  await Admin.updateOne({ resetPasswordLink: token });

  const templateEmail = {
    from: "Azis",
    to: email,
    subject: "Link Reset PasswordAdmin",
    html: `<p>Silahkan Klik Link di bawah untuk Reset Password Anda</p> <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>`,
  };
  kirimEmail(templateEmail);

  return res.render("loginAdmin/forgotPasswordAdmin", {
    status: true,
    success: "Silahkan Cek email Anda!!",
    layout: "layouts/login-layouts",
    title: "lupa password",
  });
});

// halaman reset password
app.get("/resetPassword/:token", (req, res) => {
  res.render("loginAdmin/resetPassword", {
    title: "Reset Password",
    layout: "layouts/login-layouts",
  });
});

// proses reset password
app.post("/resetPassword/:token", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username: username });
  if (admin) {
    const hashPassword = await bcryptjs.hash(password, 10);
    admin.password = hashPassword;
    await admin.save();
    return res.render("loginAdmin/resetPassword", {
      title: "Reset Password",
      layout: "layouts/login-layouts",
      status: true,
      message: "Password berhasil di ubah!!",
    });
  }
});

// halaman login
app.get("/loginAdmin", (req, res) => {
  res.render("loginAdmin/loginAdmin", {
    layout: "layouts/login-layouts",
    title: "login",
  });
});

// proses halaman login
app.post("/loginAdmin", async (req, res) => {
  const { username, password } = req.body;

  const dataAdmin = await Admin.findOne({
    $or: [{ username: username }, { email: username }],
  });
  if (dataAdmin) {
    // jika username nya ada masuk prosess ini
    const passwordAdmin = await bcryptjs.compare(password, dataAdmin.password);

    if (passwordAdmin) {
      // jika passwordnya ada masuk prosses ini
      const data = {
        id: dataAdmin._id,
      };
      const token = await jsonwebtoken.sign(data, process.env.JSWT_SECRET);
      res.cookie("token", token);
      res.redirect("/dashboard");
    } else {
      return res.render("loginAdmin/loginAdmin", {
        layout: "layouts/login-layouts",
        title: "Login",
        message: "Password salah",
      });
    }
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "Username atau email tidak tersedia",
    });
  }
});

// <<<-------   end login/daftar -------->>>

// halaman dashboard
app.get("/dashboard", async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    const decode = await jsonwebtoken.verify(token, process.env.JSWT_SECRET);
    req.id = decode.id;
    res.render("dashboard", {
      layout: "layouts/main-layouts",
      title: "dashboard",
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// halaman profile admin
app.get("/profileAdmin", (req, res) => {
  const token = req.cookies.token;

  if (token) {
    res.render("profileAdmin", {
      layout: "layouts/main-layouts",
      title: "Daftar Dosen",
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// logout
app.get("/logout", function (req, res) {
  // Clear cookie.
  const sessionCookie = req.cookies.session || "";
  res.clearCookie("token");
  // Revoke session too. Note this will revoke all user sessions.
  if (sessionCookie) {
    token
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then(function (decodedClaims) {
        return token.auth().revokeRefreshTokens(decodedClaims.sub);
      })
      .then(function () {
        // Redirect to login page on success.
        res.redirect("/dashboard");
      })
      .catch(function () {
        // Redirect to login page on error.
        res.send("error");
      });
  } else {
    // Redirect to login page when no session cookie available.
    res.redirect("/loginAdmin");
  }
});
// <<<-------   Halaman Mahasiswa -------->>>

// halaman mahasiswa
app.get("/mahasiswa", async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    const mahasiswa = await Mahasiswa.find();
    res.render("mahasiswa/mahasiswa", {
      layout: "layouts/main-layouts",
      title: "Daftar Mahasiswa",
      mahasiswa: mahasiswa,
      msg: req.flash("msg"),
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// from tambah data mahasiswa
app.get("/mahasiswa-add", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.render("mahasiswa/add-mahasiswa", {
      title: "Tambah Data Mahasiswa",
      layout: "layouts/main-layouts",
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// proses tambah data mahasiswa
app.post(
  "/mahasiswa",
  [
    body("npm").custom(async (value) => {
      const duplikat = await Mahasiswa.findOne({ npm: value });
      if (duplikat) {
        throw new Error("NPM sudah terdaftar!!");
      }
      return true;
    }),
    check("email", "Email Tidak Valid").isEmail(),
    check("nohp", "No Hp tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("mahasiswa/add-mahasiswa", {
        title: "Tambah data Mahasiswa",
        layout: "layouts/main-layouts",
        errors: errors.array(),
      });
    } else {
      Mahasiswa.insertMany(req.body, (error, result) => {
        // kirim flash massage
        req.flash("msg", "Data mahasiswa berhasil di tambahkan");
        res.redirect("/mahasiswa");
      });
    }
  }
);

// Delete mahasiswa
app.delete("/mahasiswa", (req, res) => {
  Mahasiswa.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data mahasiswa berhasil di hapus");
    res.redirect("/mahasiswa");
  });
});

// form edit mahasiswa
app.get("/mahasiswa/:npm", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const mahasiswa = await Mahasiswa.findOne({ npm: req.params.npm });

    res.render("mahasiswa/edit-mahasiswa", {
      title: "edit mahasiswa",
      layout: "mahasiswa/edit-mahasiswa",
      mahasiswa: mahasiswa,
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// proses edit data mahasiswa
app.put(
  "/mahasiswa",
  [
    check("email", "Email Tidak Valid").isEmail(),
    check("nohp", "No Hp tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("mahasiswa/edit-mahasiswa", {
        title: "edit Mahasiswa",
        layout: "layouts/main-layouts",
        errors: errors.array(),
        mahasiswa: req.body,
      });
    } else {
      mahasiswa = Mahasiswa.updateOne(
        { _id: req.body._id },
        {
          $set: {
            _id: req.body._id,
            npm: req.body.npm,
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        // kirm flash masage
        req.flash("msg", "Data mahasiswa berhasil di ubah");
        res.redirect("/mahasiswa");
      });
    }
  }
);

// <<<-------   END Halaman Mahasiswa -------->>>

// <<<-------   Halaman Dosen -------->>>

// Halaman Dose

app.get("/dosen", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const dosen = await Dosen.find();
    res.render("Dosen/dosen", {
      layout: "layouts/main-layouts",
      title: "Daftar Dosen",
      dosen: dosen,
      msg: req.flash("msg"),
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// from tambah data dosen
app.get("/dosen-add", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.render("dosen/add-dosen", {
      title: "Tambah Data Mahasiswa",
      layout: "layouts/main-layouts",
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// proses tambah data dosen
app.post("/dosen", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("dosen/add-dosen", {
      title: "Tambah data dosen",
      layout: "layouts/main-layouts",
      errors: errors.array(),
    });
  } else {
    Dosen.insertMany(req.body, (error, result) => {
      // kirim flash massage
      req.flash("msg", "Data dosen berhasil di tambahkan");
      res.redirect("/dosen");
    });
  }
});

// Delete Dosen
app.delete("/dosen", (req, res) => {
  Dosen.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data dosen berhasil di hapus");
    res.redirect("/dosen");
  });
});

// form edit dosen
app.get("/dosen-edit/:_id", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const dosen = await Dosen.findOne({ _id: req.params._id });

    res.render("dosen/edit-dosen", {
      title: "edit dosen",
      layout: "layouts/main-layouts",
      dosen: dosen,
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// proses edit data dosen
app.put("/dosen", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("dosen/edit-dosen", {
      title: "edit Dosen",
      errors: errors.array(),
      dosen: req.body,
    });
  } else {
    dosen = Dosen.updateOne(
      { _id: req.body._id },
      {
        $set: {
          _id: req.body._id,
          nama: req.body.nama,
          matkul: req.body.matkul,
        },
      }
    ).then((result) => {
      // kirm flash masage
      req.flash("msg", "Data dosen berhasil di ubah");
      res.redirect("/dosen");
    });
  }
});

// <<<-------   END Halaman Dosen -------->>>

// <<<-------   Halaman COURS -------->>>

// Halaman Cours
app.get("/course", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const aljabar = await Aljabar.find();
    const tekdig = await Tekdig.find();
    const matdis = await Matdis.find();
    const kalkulus = await KalkulusII.find();
    const std = await Std.find();
    res.render("matakuliah/cours", {
      layout: "layouts/main-layouts",
      title: "course",
      aljabar,
      tekdig,
      matdis,
      kalkulus,
      std,
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

app.get("/aljabar", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    res.render("page/AljabarLinear", {
      title: "aljabar Linear",
      layout: "layouts/main-layouts",
    });
  } else {
    return res.render("loginAdmin/loginAdmin", {
      layout: "layouts/login-layouts",
      title: "Login",
      message: "login terlebih dahulu",
    });
  }
});

// blank page
app.use("/dashboard", (req, res) => {
  res.status(404);
  res.render("404", {
    title: "404",
    layout: "404",
  });
});

app.listen(port, () => {
  console.log(
    `Lerning Manajemen Mahasiswa App | listening at http://localhost:${port}`
  );
});

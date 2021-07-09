const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult, check } = require("express-validator");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require('method-override');

// Mengambil koneksi
require('./utils/db');
const Contact = require('./models/contact');

const app = express();
const port = 4501;

// Override Method
app.use(methodOverride('_method'));

// Menggunakan template engine EJS
app.set("view engine", "ejs");

app.use(expressLayouts);
app.use(express.static("public")); // Menentukan tempat asset static
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash Session
app.use(cookieParser("secret"));
app.use(
    session({
        cookie: {
            maxAge: 6000,
        },
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

// Halaman Home
app.get("/", (req, res) => {
    const mahasiswa = [
        {
            nama: "Andry Pebrianto",
            email: "andrypeb227@gmail.com",
        },
        {
            nama: "Bagad Ihwalubin",
            email: "bagadihwa@gmail.com",
        },
        {
            nama: "Edai Cyahyono",
            email: "cyahyadi@gmail.com",
        },
    ];

    res.render("index", {
        title: "Halaman Mahasiswa",
        layout: "layouts/main-layout",
        mahasiswa,
    });
});

// Halaman About
app.get("/about", (req, res) => {
    res.render("about", {
        title: "Halaman About",
        layout: "layouts/main-layout",
    });
});

// Halaman Contact
app.get("/contact", async (req, res) => {
    // Mengambil semua Data Contact
    const contacts = await Contact.find().catch(() => {
        res.status(404).send("<h1>404</h1>");
    });

    res.render("contact", {
        title: "Halaman Contact",
        layout: "layouts/main-layout",
        contacts,
        success: req.flash("success"),
    });
});

// Halaman Tambah Data Contact
app.get("/contact/add", (req, res) => {
    res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
    });
});

// Proses Tambah Data Contact
app.post(
    "/contact",
    [
        check("email", "Email tidak valid!").isEmail(),
        check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
    ],
    async (req, res) => {
        // Mendapatkan error
        const errors = validationResult(req);
        // Jika validasi tidak sesuai
        if (!errors.isEmpty()) {
            res.render("add-contact", {
                title: "Form Tambah Data Contact",
                layout: "layouts/main-layout",
                errors: errors.array(),
            });
        } else {
            await Contact.insertMany(req.body);
            // Mengirimkan flash message sebelum redirect
            req.flash("success", "Data Contact berhasil ditambahkan!");
            res.redirect("/contact");
        }
    }
);

// Form Edit Data Contact
app.get("/contact/edit/:id", async (req, res) => {
    const contact = await Contact.findById(req.params.id).catch(() => {
        res.status(404).send("<h1>404</h1>");
    });

    res.render("edit-contact", {
        title: "Form Edit Data Contact",
        layout: "layouts/main-layout",
        contact,
    });
});

// Proses Update Data Contact
app.put(
    "/contact/:id",
    [
        check("email", "Email tidak valid!").isEmail(),
        check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
    ],
    async (req, res) => {
        // Mendapatkan error
        const errors = validationResult(req);

        // Jika validasi tidak sesuai
        if (!errors.isEmpty()) {
            req.body._id = req.params.id;

            res.render("edit-contact", {
                title: "Form Edit Data Contact",
                layout: "layouts/main-layout",
                errors: errors.array(),
                contact: req.body ,
            });
        } else {
            Contact.findByIdAndUpdate(req.params.id, req.body).then((result) => {
                if (!result) {
                    res.status(404).send({
                        message: "Contact Not Found.",
                    })
                } else {
                    // Mengirimkan flash message sebelum redirect
                    req.flash("success", "Data Contact berhasil diubah!");
                    res.redirect("/contact");
                }
            }).catch((err) => {
                res.status(409).send({
                    message: err.message || "Terjadi suatu kesalahan saat mengubah data.",
                    status: 409,
                });
            });
        }
    }
);

// Halaman Detail Contact
app.get("/contact/:id", async (req, res) => {
    const contact = await Contact.findById(req.params.id).catch(() => {
        res.status(404).send("<h1>404</h1>");
    });

    res.render("detail", {
        title: "Halaman Detail " + contact.nama,
        layout: "layouts/main-layout",
        contact,
    });
});

// Proses Delete Contact
app.delete("/contact/:id", async (req, res) => {
    Contact.findByIdAndRemove(req.params.id).then((result) => {
        if (!result) {
            res.status(404).send({
                message: "Contact Not Found.",
            })
        } else {
            // Mengirimkan flash message sebelum redirect
            req.flash("success", "Data Contact berhasil dihapus!");
            res.redirect("/contact");
        }
    }).catch((err) => {
        res.status(409).send({
            message: err.message || "Terjadi suatu kesalahan saat menghapus data.",
            status: 409,
        });
    });
});

app.listen(port, () => {
    console.log('Aplikasi Berhasil Berjalan di: http://localhost:' + port)
})

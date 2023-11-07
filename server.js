const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: ".env" });
const app = require("./app");

// app.get('/', (req, res) => {
// 	res.send('You are gay');
// });

const DB = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD,
);

mongoose
    .connect(DB, {
        // useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
    })
    .then(() => {
        console.log("Db connection successful!");
    });

// console.log(process.env);
const port = process.env.PORT || 8800;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log("SIGTEM RECEIVED, Shutting down....");
    server.close(() => {
        console.log("Process terminated.");
    });
});

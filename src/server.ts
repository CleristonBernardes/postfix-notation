import * as express         from "express";
import * as bodyParser      from "body-parser";

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 4000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
 next();
});

// app.use('/', "");

/**
 * Start Express server.
 */
app.listen(app.get("port"), () => {
  console.log(("App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
});

module.exports = app;

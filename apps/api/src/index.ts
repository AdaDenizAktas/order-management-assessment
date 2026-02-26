import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const app = buildApp();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
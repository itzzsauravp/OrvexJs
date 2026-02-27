import { app } from "./app";

const PORT = 8000;

app.listen(PORT, undefined, () => {
  console.log(`Listening to server @ http://localhost:${PORT}/`);
});

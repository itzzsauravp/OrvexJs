import { bootstrap } from "./app";

const app = bootstrap();
const PORT = 8000;

app
  .then((listener) => {
    listener.listen(PORT, undefined, () => {
      console.log(`Listening to server @ http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error("Unexpected error occured during application bootstrap\n", error);
    process.exit(1);
  });

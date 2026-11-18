import { app } from './app.js';

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, () => {
  console.log(`FURA CONTROL API server running on http://localhost:${PORT}`);
});

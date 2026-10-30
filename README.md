# Felt — web demo

Cliente React para jugar una mesa Texas Hold'em contra el API Nest + motor Lua.

## Arranque (demo 2 pestañas)

```bash
# terminal 1 — API (desde apps/api)
pnpm start:dev

# terminal 2 — web
cd apps/web
pnpm dev
```

1. Abre http://localhost:5173 → **Crear mesa** (p1 / Ana).
2. Copia el ID (botón arriba a la derecha).
3. Otra pestaña → **Unirse** con ese ID (p2 / Bob).
4. En cualquiera: **Empezar mano** y juega.

Vite hace proxy de `/socket.io` a `http://127.0.0.1:3000`.  
Si el API está en otro host: `VITE_API_URL=http://host:3000 pnpm dev`.

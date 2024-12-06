import * as PIXI from "pixi.js";
const app = new PIXI.Application();
await app.init({ resizeTo: window, backgroundColor: 0x1099bb });
document.body.appendChild(app.canvas);
export default app;

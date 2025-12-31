import type * as PIXI from "pixi.js";

export function attachPointerDebug(app: PIXI.Application, onClick: (p: { x: number; y: number }) => void) {
  const canvas = app.canvas;

  const handler = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onClick({ x, y });
  };

  canvas.addEventListener("pointerdown", handler);

  return () => {
    canvas.removeEventListener("pointerdown", handler);
  };
}

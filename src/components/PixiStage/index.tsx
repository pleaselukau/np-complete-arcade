import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

type PixiStageProps = {
  width?: number;
  height?: number;
};

export default function PixiStage({ width = 900, height = 520 }: PixiStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Pixi app once
    const app = new PIXI.Application();
    appRef.current = app;

    let destroyed = false;

    (async () => {
      await app.init({
        width,
        height,
        background: "#0b1220",
        antialias: true,
      });

      if (destroyed) return;

      containerRef.current!.appendChild(app.canvas);

      // Placeholder content (Phase 0)
      const g = new PIXI.Graphics();
      g.roundRect(40, 40, width - 80, height - 80, 18);
      g.stroke({ width: 2, color: 0x334155 });
      g.fill({ color: 0x0f172a, alpha: 0.7 });
      app.stage.addChild(g);

      const text = new PIXI.Text({
        text: "PixiStage ✅ (Phase 0 placeholder)",
        style: new PIXI.TextStyle({
          fill: 0xe2e8f0,
          fontSize: 20,
          fontFamily: "Arial",
        }),
      });
      text.x = 70;
      text.y = 70;
      app.stage.addChild(text);
    })();

    return () => {
      destroyed = true;
      try {
        appRef.current?.destroy(true);
      } catch {
        // ignore
      }
      appRef.current = null;
    };
  }, [width, height]);

  return <div ref={containerRef} className="w-full overflow-hidden rounded-2xl border border-slate-800" />;
}

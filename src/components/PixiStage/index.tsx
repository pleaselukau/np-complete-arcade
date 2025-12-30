import { useEffect, useMemo, useRef } from "react";
import * as PIXI from "pixi.js";

type PixiReadyPayload = {
  app: PIXI.Application;
  world: PIXI.Container;
  ui: PIXI.Container;
  size: { width: number; height: number };
  dpr: number;
};

type PixiResizePayload = {
  width: number;
  height: number;
  dpr: number;
};

type PixiStageProps = {
  className?: string;
  maxDpr?: number; // cap DPR to avoid GPU pain on 4k
  onAppReady?: (payload: PixiReadyPayload) => void;
  onResize?: (payload: PixiResizePayload) => void;
};

export default function PixiStage({
  className,
  maxDpr = 2,
  onAppReady,
  onResize,
}: PixiStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const appRef = useRef<PIXI.Application | null>(null);
  const worldRef = useRef<PIXI.Container | null>(null);
  const uiRef = useRef<PIXI.Container | null>(null);

  const roRef = useRef<ResizeObserver | null>(null);

  const initialDpr = useMemo(() => {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    return Math.min(Math.max(dpr, 1), maxDpr);
  }, [maxDpr]);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerEl = containerRef.current;

    const app = new PIXI.Application();
    appRef.current = app;

    const world = new PIXI.Container();
    const ui = new PIXI.Container();
    worldRef.current = world;
    uiRef.current = ui;

    let destroyed = false;

    const resizeToElement = async () => {
      if (!containerEl || !appRef.current) return;

      const rect = containerEl.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), maxDpr);

      // If app not initialized yet, init it now.
      if (!(appRef.current as any)._initialized) {
        await appRef.current.init({
          width,
          height,
          resolution: dpr,
          autoDensity: true,
          background: "#0b1220",
          antialias: true,
        });

        if (destroyed) return;

        containerEl.appendChild(appRef.current.canvas);

        // Order: world below, ui above
        appRef.current.stage.addChild(world);
        appRef.current.stage.addChild(ui);

        onAppReady?.({
          app: appRef.current,
          world,
          ui,
          size: { width, height },
          dpr,
        });
      } else {
        appRef.current.renderer.resize(width, height);
        appRef.current.renderer.resolution = dpr;
        appRef.current.renderer.view.style.width = "100%";
        appRef.current.renderer.view.style.height = "100%";

        onResize?.({ width, height, dpr });
      }
    };

    // Initialize now
    resizeToElement();

    // Resize observer
    roRef.current = new ResizeObserver(() => {
      resizeToElement();
    });
    roRef.current.observe(containerEl);

    return () => {
      destroyed = true;
      try {
        roRef.current?.disconnect();
      } catch {
        // ignore
      }
      roRef.current = null;

      try {
        appRef.current?.destroy(true);
      } catch {
        // ignore
      }

      appRef.current = null;
      worldRef.current = null;
      uiRef.current = null;
    };
  }, [maxDpr, onAppReady, onResize]);

  return (
    <div
      ref={containerRef}
      className={
        className ??
        "w-full h-[520px] overflow-hidden rounded-2xl border border-slate-800"
      }
    />
  );
}

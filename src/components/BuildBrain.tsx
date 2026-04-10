import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import hippoIdleAnimation from "../assets/lottie/hippo_idle.json";
import mygIdleAnimation from "../assets/lottie/myg_idle.json";
import pfcIdleAnimation from "../assets/lottie/pfc_idle.json";
import { primeBrainMatchBridgeAudio } from "../utils/brainMatchBridgeAudio";
import { playUiSound } from "../utils/sound";
import BrainGraphic from "./BrainGraphic";

interface BuildBrainProps {
  onComplete: () => void;
}

type PartId = "amygdala" | "prefrontalCortex" | "hippocampus";

interface Position {
  x: number;
  y: number;
}

interface DragState {
  id: PartId;
  pointerOffset: Position;
}

interface RegionDefinition {
  left: number;
  top: number;
  width: number;
  height: number;
}

const PART_CARD_HEIGHT = 148;

const partSizes: Record<PartId, { width: number; height: number }> = {
  amygdala: { width: 108, height: PART_CARD_HEIGHT },
  prefrontalCortex: { width: 138, height: PART_CARD_HEIGHT },
  hippocampus: { width: 144, height: PART_CARD_HEIGHT },
};

const partAnimations: Record<PartId, object> = {
  amygdala: mygIdleAnimation,
  prefrontalCortex: pfcIdleAnimation,
  hippocampus: hippoIdleAnimation,
};

const partAnimationOffsets: Record<PartId, number> = {
  amygdala: 0,
  prefrontalCortex: 10,
  hippocampus: 0,
};

const regionDefinitions: Record<PartId, RegionDefinition> = {
  amygdala: {
    left: 0.21,
    top: 0.53,
    width: 0.18,
    height: 0.22,
  },
  prefrontalCortex: {
    left: 0.24,
    top: 0.14,
    width: 0.3,
    height: 0.24,
  },
  hippocampus: {
    left: 0.55,
    top: 0.54,
    width: 0.24,
    height: 0.2,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function BuildBrain({ onComplete }: BuildBrainProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const brainOutlineRef = useRef<HTMLDivElement | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const positionsRef = useRef<Record<PartId, Position>>({
    amygdala: { x: 0, y: 0 },
    prefrontalCortex: { x: 0, y: 0 },
    hippocampus: { x: 0, y: 0 },
  });

  const [positions, setPositions] = useState<Record<PartId, Position>>(positionsRef.current);
  const [initialPositions, setInitialPositions] = useState<Record<PartId, Position>>(positionsRef.current);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredPart, setHoveredPart] = useState<PartId | null>(null);
  const [feedbackPart, setFeedbackPart] = useState<PartId | null>(null);
  const [brainFeedback, setBrainFeedback] = useState<"final" | null>(null);
  const [completionMessageVisible, setCompletionMessageVisible] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [amygdalaPlaced, setAmygdalaPlaced] = useState(false);
  const [pfcPlaced, setPfcPlaced] = useState(false);
  const [hippocampusPlaced, setHippocampusPlaced] = useState(false);

  const activeRegions = ([
    amygdalaPlaced ? "amygdala" : null,
    pfcPlaced ? "prefrontalCortex" : null,
    hippocampusPlaced ? "hippocampus" : null,
  ].filter((region): region is PartId => region !== null));

  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => () => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
    }
  }, []);

  const isPartPlaced = (partId: PartId) => {
    if (partId === "amygdala") {
      return amygdalaPlaced;
    }
    if (partId === "prefrontalCortex") {
      return pfcPlaced;
    }
    return hippocampusPlaced;
  };

  const setPartPlaced = (partId: PartId, isPlaced: boolean) => {
    if (partId === "amygdala") {
      setAmygdalaPlaced(isPlaced);
      return;
    }
    if (partId === "prefrontalCortex") {
      setPfcPlaced(isPlaced);
      return;
    }
    setHippocampusPlaced(isPlaced);
  };

  const calculateLayout = () => {
    const stage = stageRef.current;
    const brainOutline = brainOutlineRef.current;
    if (!stage || !brainOutline) {
      return null;
    }

    const stageRect = stage.getBoundingClientRect();
    const brainRect = brainOutline.getBoundingClientRect();
    const trayBottomGap = 8;
    const trayY = stage.clientHeight - PART_CARD_HEIGHT - trayBottomGap;

    const nextInitialPositions: Record<PartId, Position> = {
      amygdala: { x: stageRect.width * 0.15, y: trayY },
      prefrontalCortex: {
        x: stageRect.width * 0.5 - partSizes.prefrontalCortex.width / 2,
        y: trayY,
      },
      hippocampus: {
        x: stageRect.width * 0.85 - partSizes.hippocampus.width,
        y: trayY,
      },
    };

    const zoneBounds = Object.fromEntries(
      (Object.entries(regionDefinitions) as Array<[PartId, RegionDefinition]>).map(([partId, region]) => [
        partId,
        {
          left: brainRect.left - stageRect.left + brainRect.width * region.left,
          top: brainRect.top - stageRect.top + brainRect.height * region.top,
          width: brainRect.width * region.width,
          height: brainRect.height * region.height,
        },
      ]),
    ) as Record<PartId, { left: number; top: number; width: number; height: number }>;

    const zoneCenters = Object.fromEntries(
      (Object.entries(zoneBounds) as Array<[PartId, { left: number; top: number; width: number; height: number }]>).map(
        ([partId, bounds]) => [
          partId,
          {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          },
        ],
      ),
    ) as Record<PartId, Position>;

    return { stageRect, nextInitialPositions, zoneBounds, zoneCenters };
  };

  useEffect(() => {
    const syncLayout = () => {
      const layout = calculateLayout();
      if (!layout) {
        return;
      }

      setInitialPositions(layout.nextInitialPositions);

      // Keep already-placed pieces snapped to their target zone on resize.
      setPositions({
        amygdala: amygdalaPlaced
          ? {
              x: layout.zoneCenters.amygdala.x - partSizes.amygdala.width / 2,
              y: layout.zoneCenters.amygdala.y - partSizes.amygdala.height / 2,
            }
          : layout.nextInitialPositions.amygdala,
        prefrontalCortex: pfcPlaced
          ? {
              x: layout.zoneCenters.prefrontalCortex.x - partSizes.prefrontalCortex.width / 2,
              y: layout.zoneCenters.prefrontalCortex.y - partSizes.prefrontalCortex.height / 2,
            }
          : layout.nextInitialPositions.prefrontalCortex,
        hippocampus: hippocampusPlaced
          ? {
              x: layout.zoneCenters.hippocampus.x - partSizes.hippocampus.width / 2,
              y: layout.zoneCenters.hippocampus.y - partSizes.hippocampus.height / 2,
            }
          : layout.nextInitialPositions.hippocampus,
      });
    };

    syncLayout();
    window.addEventListener("resize", syncLayout);

    return () => {
      window.removeEventListener("resize", syncLayout);
    };
  }, [amygdalaPlaced, pfcPlaced, hippocampusPlaced]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const layout = calculateLayout();
      if (!layout) {
        return;
      }

      const partSize = partSizes[dragState.id];

      // Move the part inside the stage using the pointer's offset from the initial grab point.
      const nextX = clamp(
        event.clientX - layout.stageRect.left - dragState.pointerOffset.x,
        0,
        layout.stageRect.width - partSize.width,
      );
      const nextY = clamp(
        event.clientY - layout.stageRect.top - dragState.pointerOffset.y,
        0,
        layout.stageRect.height - partSize.height,
      );

      setPositions((current) => ({
        ...current,
        [dragState.id]: { x: nextX, y: nextY },
      }));
    };

    const handlePointerUp = () => {
      const layout = calculateLayout();
      if (!layout) {
        setDragState(null);
        return;
      }

      const finalPosition = positionsRef.current[dragState.id];
      const partSize = partSizes[dragState.id];
      const partCenter = {
        x: finalPosition.x + partSize.width / 2,
        y: finalPosition.y + partSize.height / 2,
      };
      const dropZoneBounds = layout.zoneBounds[dragState.id];
      const regionPaddingX = 32;
      const regionPaddingY = 28;
      const isWithinRegion =
        partCenter.x >= dropZoneBounds.left - regionPaddingX &&
        partCenter.x <= dropZoneBounds.left + dropZoneBounds.width + regionPaddingX &&
        partCenter.y >= dropZoneBounds.top - regionPaddingY &&
        partCenter.y <= dropZoneBounds.top + dropZoneBounds.height + regionPaddingY;

      // Use a generous region check so players can land inside the target area without precise pixel placement.
      if (isWithinRegion) {
        const completesBrain =
          (dragState.id === "amygdala" ? true : amygdalaPlaced) &&
          (dragState.id === "prefrontalCortex" ? true : pfcPlaced) &&
          (dragState.id === "hippocampus" ? true : hippocampusPlaced);
        const snappedPosition = {
          x: layout.zoneCenters[dragState.id].x - partSize.width / 2,
          y: layout.zoneCenters[dragState.id].y - partSize.height / 2,
        };

        setPositions((current) => ({
          ...current,
          [dragState.id]: snappedPosition,
        }));
        setHoveredPart(null);
        setFeedbackPart(dragState.id);
        const placedPartId = dragState.id;
        const placementLockDelayMs = 240;
        const completionDelayMs = 3000;

        if (feedbackTimeoutRef.current !== null) {
          window.clearTimeout(feedbackTimeoutRef.current);
        }
        if (completionTimeoutRef.current !== null) {
          window.clearTimeout(completionTimeoutRef.current);
        }

        if (completesBrain) {
          setInteractionLocked(true);
          setBrainFeedback("final");
          setCompletionMessageVisible(true);
          playUiSound("celebrate");
        } else {
          playUiSound("placement");
        }

        feedbackTimeoutRef.current = window.setTimeout(() => {
          setPartPlaced(placedPartId, true);
          setFeedbackPart(null);

          if (completesBrain) {
            completionTimeoutRef.current = window.setTimeout(() => {
              setCompletionMessageVisible(false);
              setBrainFeedback(null);
              primeBrainMatchBridgeAudio();
              onComplete();
            }, completionDelayMs - placementLockDelayMs);
          }
        }, placementLockDelayMs);
      } else {
        setPositions((current) => ({
          ...current,
          [dragState.id]: initialPositions[dragState.id],
        }));
      }

      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, initialPositions]);

  const handlePointerDown = (partId: PartId, event: React.PointerEvent<HTMLDivElement>) => {
    if (isPartPlaced(partId) || interactionLocked) {
      return;
    }

    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const partRect = event.currentTarget.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    setPartPlaced(partId, false);
    setDragState({
      id: partId,
      pointerOffset: {
        x: event.clientX - partRect.left,
        y: event.clientY - partRect.top,
      },
    });

    setPositions((current) => ({
      ...current,
      [partId]: {
        x: clamp(partRect.left - stageRect.left, 0, stageRect.width - partRect.width),
        y: clamp(partRect.top - stageRect.top, 0, stageRect.height - partRect.height),
      },
    }));
  };

  const renderPart = (partId: PartId, label: string) => {
    const isPlaced = isPartPlaced(partId);
    const isDragging = dragState?.id === partId;
    const isHovered = hoveredPart === partId;
    const isFeedbackActive = feedbackPart === partId;
    const size = partSizes[partId];

    return (
      <div
        key={partId}
        role="button"
        tabIndex={0}
        aria-label={`Drag ${label}`}
        onPointerDown={(event) => handlePointerDown(partId, event)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
          }
        }}
        onPointerEnter={() => {
          if (!isPlaced && !isDragging) {
            setHoveredPart(partId);
          }
        }}
        onPointerLeave={() => {
          if (hoveredPart === partId) {
            setHoveredPart(null);
          }
        }}
        onFocus={() => {
          if (!isPlaced && !isDragging) {
            setHoveredPart(partId);
          }
        }}
        onBlur={() => {
          if (hoveredPart === partId) {
            setHoveredPart(null);
          }
        }}
        style={{
          ...styles.partBase,
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: `${positions[partId].x}px`,
          top: `${positions[partId].y}px`,
          cursor: isPlaced ? "default" : isDragging ? "grabbing" : "grab",
          transform: isPlaced ? "scale(0.96)" : isDragging ? "scale(1.05)" : isHovered ? "scale(1.035)" : "scale(1)",
          boxShadow: isPlaced
            ? "none"
            : isDragging
              ? "0 18px 30px rgba(15, 23, 42, 0.14), 0 8px 18px rgba(148, 163, 184, 0.12)"
              : isFeedbackActive
                ? "0 0 0 1px rgba(191, 219, 254, 0.52), 0 14px 24px rgba(14, 165, 233, 0.16), 0 0 24px rgba(125, 211, 252, 0.24)"
              : isHovered
                ? "0 14px 24px rgba(15, 23, 42, 0.09), 0 6px 14px rgba(148, 163, 184, 0.1)"
                : "0 3px 8px rgba(15, 23, 42, 0.035)",
          opacity: isPlaced ? 0 : isDragging ? 0.95 : 1,
          zIndex: isFeedbackActive ? 4 : isDragging ? 3 : 1,
          outline: "none",
          pointerEvents: isPlaced || isFeedbackActive ? "none" : "auto",
          animation: isFeedbackActive ? "buildBrainPartSnap 360ms cubic-bezier(0.22, 1, 0.36, 1), buildBrainPieceGlow 520ms ease-out" : undefined,
        }}
      >
        <div style={styles.partAnimationFrame}>
          <Lottie
            animationData={partAnimations[partId]}
            loop
            autoplay
            style={{
              ...styles.partAnimation,
              transform: `translateY(${partAnimationOffsets[partId]}px)`,
            }}
          />
        </div>
        <span style={styles.partLabel}>{label}</span>
      </div>
    );
  };

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Build the brain</h1>
          <p style={styles.description}>
            Drag each brain part into its place. Once all three are locked in, your team can continue.
          </p>
        </div>

        <div ref={stageRef} style={styles.stage}>
          {completionMessageVisible && (
            <div style={styles.completionBanner} aria-live="polite">
              Brain complete!
            </div>
          )}
          <div ref={brainOutlineRef} style={styles.brainOutline}>
            <BrainGraphic
              className={[
                "build-brain-graphic",
                brainFeedback === "final" ? "build-brain-graphic--final" : null,
              ].filter(Boolean).join(" ")}
              style={styles.brainGraphic}
              activeRegions={activeRegions}
              ariaLabel="Brain graphic with draggable regions"
            />

            {(Object.entries(regionDefinitions) as Array<[PartId, RegionDefinition]>).map(([partId, region]) => (
              <div
                key={`${partId}-zone`}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: `${region.left * 100}%`,
                  top: `${region.top * 100}%`,
                  width: `${region.width * 100}%`,
                  height: `${region.height * 100}%`,
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>

          {renderPart("amygdala", "Amygdala")}
          {renderPart("prefrontalCortex", "Prefrontal Cortex")}
          {renderPart("hippocampus", "Hippocampus")}
        </div>

        <div style={styles.progressRow}>
          <span style={styles.progressText}>Amygdala: {amygdalaPlaced ? "Placed" : "Pending"}</span>
          <span style={styles.progressText}>PFC: {pfcPlaced ? "Placed" : "Pending"}</span>
          <span style={styles.progressText}>Hippocampus: {hippocampusPlaced ? "Placed" : "Pending"}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100vh",
    width: "min(1366px, 100%)",
    margin: "0 auto",
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "min(960px, 100%)",
    minHeight: "min(700px, calc(100vh - 4rem))",
    padding: "clamp(1.5rem, 2.8vh, 2rem) clamp(1.5rem, 2.8vw, 2rem)",
    borderRadius: "32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.15rem",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(241, 245, 249, 0.68) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    boxShadow: "0 14px 36px rgba(15, 23, 42, 0.07)",
    backdropFilter: "blur(12px)",
    overflow: "hidden" as const,
  },
  header: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.3rem",
    maxWidth: "620px",
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.7rem, 3vw, 2.35rem)",
    lineHeight: 1.1,
    color: "#0f172a",
  },
  description: {
    margin: 0,
    fontSize: "0.93rem",
    lineHeight: 1.35,
    color: "#475569",
  },
  stage: {
    position: "relative" as const,
    width: "min(840px, 100%)",
    height: "clamp(430px, 52vh, 520px)",
    padding: "1.1rem",
    borderRadius: "24px",
    background: "linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(241, 245, 249, 0.92))",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    overflow: "hidden" as const,
  },
  completionBanner: {
    position: "absolute" as const,
    left: "50%",
    top: "1rem",
    transform: "translateX(-50%)",
    padding: "0.62rem 1rem",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.82)",
    border: "1px solid rgba(125, 211, 252, 0.34)",
    boxShadow: "0 12px 28px rgba(14, 165, 233, 0.14), 0 0 24px rgba(253, 224, 71, 0.18)",
    color: "#0f172a",
    fontSize: "0.92rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
    zIndex: 5,
    animation: "buildBrainCompletionMessage 240ms cubic-bezier(0.22, 1, 0.36, 1)",
    pointerEvents: "none" as const,
  },
  brainOutline: {
    position: "relative" as const,
    width: "min(360px, 58vw)",
    height: "min(250px, 34vw)",
    margin: "0 auto",
    marginTop: "0.85rem",
  },
  brainGraphic: {
    width: "100%",
    height: "100%",
  },
  partBase: {
    position: "absolute" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    textAlign: "center" as const,
    padding: "0.4rem 0.4rem",
    borderRadius: "18px",
    background:
      "radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.12) 38%, rgba(255, 255, 255, 0.04) 72%, rgba(255, 255, 255, 0) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(1px)",
    userSelect: "none" as const,
    touchAction: "none" as const,
    transition: "transform 160ms ease, box-shadow 160ms ease, opacity 180ms ease",
  },
  partAnimationFrame: {
    width: "100%",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 0,
    pointerEvents: "none" as const,
    overflow: "visible" as const,
  },
  partAnimation: {
    width: "118%",
    height: "118%",
    pointerEvents: "none" as const,
  },
  partLabel: {
    minHeight: "1.4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(15, 23, 42, 0.6)",
    fontSize: "0.62rem",
    fontWeight: 550,
    lineHeight: 1.1,
    letterSpacing: "0.015em",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.62)",
    pointerEvents: "none" as const,
  },
  progressRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: "0.55rem",
    marginTop: "0.2rem",
  },
  progressText: {
    padding: "0.4rem 0.7rem",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.74)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    fontSize: "0.84rem",
    color: "#334155",
    fontWeight: 600,
  },
};

export default BuildBrain;

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import brainSvgRaw from "../assets/brain.svg?raw";
import type { BrainRole } from "../types/game";

interface BrainGraphicProps {
  className?: string;
  style?: CSSProperties;
  activeRegion?: BrainRole | null;
  ariaLabel?: string;
}

const addRegionTags = (svg: string, fills: string[], regionClass: string, regionId: string) => {
  return fills.reduce((acc, fill) => {
    const fillPattern = new RegExp(`fill="${fill}"`, "g");
    return acc.replace(
      fillPattern,
      `fill="${fill}" class="brain-region ${regionClass}" data-region="${regionId}"`,
    );
  }, svg);
};

const prefrontalFills = [
  "#9FC0F3",
  "#C6E0FB",
  "#88AEE2",
  "#80A2D7",
  "#BDF1FF",
];

// Keep amygdala to the pink/red body fills only (exclude shared outline tones).
const amygdalaFills = ["#FBD1D2", "#FEB0B3", "#E69393"];
const hippocampusFills = ["#FDDF82", "#E4BD67", "#FFF89E", "#FDF7C2", "#8B946E"];

const INLINED_BRAIN_SVG = addRegionTags(
  addRegionTags(
    addRegionTags(
      brainSvgRaw.replace(
        "<svg ",
        '<svg class="brain-svg-root" data-brain="true" preserveAspectRatio="xMidYMid meet" ',
      ),
      prefrontalFills,
      "brain-region-prefrontal",
      "prefrontalCortex",
    ),
    amygdalaFills,
    "brain-region-amygdala",
    "amygdala",
  ),
  hippocampusFills,
  "brain-region-hippocampus",
  "hippocampus",
);

function BrainGraphic({ className, style, activeRegion = null, ariaLabel = "Brain graphic" }: BrainGraphicProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mergedClassName = ["brain-svg-host", className].filter(Boolean).join(" ");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const allRegionPaths = host.querySelectorAll<SVGPathElement>(".brain-region");

    allRegionPaths.forEach((path) => {
      path.classList.remove("is-active-region");
    });

    if (!activeRegion) {
      host.classList.remove("has-active-region");
      return;
    }

    host.classList.add("has-active-region");
    const activePaths = host.querySelectorAll<SVGPathElement>(
      `.brain-region[data-region="${activeRegion}"]`,
    );
    activePaths.forEach((path) => {
      path.classList.add("is-active-region");
    });
  });

  return (
    <div
      ref={hostRef}
      className={mergedClassName}
      style={style}
      role="img"
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: INLINED_BRAIN_SVG }}
    />
  );
}

export default BrainGraphic;

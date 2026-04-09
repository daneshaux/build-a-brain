import { useMemo } from "react";
import type { CSSProperties } from "react";
import brainSvgRaw from "../assets/brain.svg?raw";
import type { BrainRole } from "../types/game";

interface BrainGraphicProps {
  className?: string;
  style?: CSSProperties;
  activeRegion?: BrainRole | null;
  activeRegions?: BrainRole[];
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
  "#C7E0FD",
  "#7090C5",
  "#50719E",
];

// Keep amygdala to the pink/red body fills only (exclude shared outline tones).
const amygdalaFills = ["#FBD1D2", "#FEB0B3", "#E69393", "#E79390"];
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

function BrainGraphic({
  className,
  style,
  activeRegion = null,
  activeRegions,
  ariaLabel = "Brain graphic",
}: BrainGraphicProps) {
  const resolvedActiveRegions = activeRegions && activeRegions.length > 0
    ? activeRegions
    : activeRegion
      ? [activeRegion]
      : [];
  const mergedClassName = [
    "brain-svg-host",
    resolvedActiveRegions.length > 0 ? "has-active-region" : null,
    className,
  ].filter(Boolean).join(" ");
  const svgMarkup = useMemo(
    () => INLINED_BRAIN_SVG.replace(
      /class="brain-region ([^"]+)" data-region="([^"]+)"/g,
      (_match, regionClass, regionId) => {
        const isActive = resolvedActiveRegions.includes(regionId as BrainRole);
        return `class="brain-region ${regionClass}${isActive ? " is-active-region" : ""}" data-region="${regionId}"`;
      },
    ),
    [resolvedActiveRegions],
  );

  return (
    <div
      className={mergedClassName}
      style={style}
      role="img"
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export default BrainGraphic;

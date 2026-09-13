/**
 * Stage Geometry and Viewport Scaling Utility
 * 
 * Provides mathematical synchronization between the SCUMM background stage,
 * cobblestone walking road baseline, character/NPC sprite dimensions,
 * collision hitboxes, and delta-time movement speeds across all display resolutions.
 */

export const NATIVE_STAGE_WIDTH = 1376;
export const NATIVE_STAGE_HEIGHT = 768;
export const NATIVE_GROUND_OFFSET = 66; // Native distance from image bottom to cobblestone walking footline

// Reference scale tuned for standard Retina MacBook Pro display (~1512x820 viewport)
export const REFERENCE_SCALE = 1.1;

// Base pixel dimensions at native 1.0 scale
export const NATIVE_CHAR_WIDTH = 116;
export const NATIVE_CHAR_HEIGHT = 129;
export const NATIVE_SCHOLAR_WIDTH = 87;
export const NATIVE_SCHOLAR_HEIGHT = 125;

export const SCHOLAR_X_PERCENT = 0.81;

// Base walk speed in CSS pixels/sec at reference scale (1.1)
export const BASE_MOVE_SPEED_PPS = 550;

export interface StageMetrics {
  viewportWidth: number;
  viewportHeight: number;
  stageScale: number;
  groundOffset: number;       // Distance in px from viewport bottom to character feet baseline
  groundY: number;            // Viewport absolute Y of character feet baseline
  characterWidth: number;
  characterHeight: number;
  characterBaseY: number;     // Viewport absolute Y of character top-left
  scholarWidth: number;
  scholarHeight: number;
  scholarX: number;           // Absolute X of Archivist NPC
  scholarProximityThreshold: number;
  scholarObstacleHitbox: {
    id: string;
    left: number;
    right: number;
  };
  roadBoundaries: {
    left: number;
    right: number;
  };
  moveSpeedPps: number;       // Speed in pixels/sec scaled to current viewport
  jumpHeight: number;
}

export function calculateStageMetrics(
  viewportWidth: number = typeof window !== 'undefined' ? window.innerWidth : 1440,
  viewportHeight: number = typeof window !== 'undefined' ? window.innerHeight : 900
): StageMetrics {
  // background-size: cover scales the image by max(W / W_native, H / H_native)
  const stageScale = Math.max(
    viewportWidth / NATIVE_STAGE_WIDTH,
    viewportHeight / NATIVE_STAGE_HEIGHT
  );

  const groundOffset = Math.round(NATIVE_GROUND_OFFSET * stageScale);
  const groundY = viewportHeight - groundOffset;

  const characterWidth = Math.round(NATIVE_CHAR_WIDTH * stageScale);
  const characterHeight = Math.round(NATIVE_CHAR_HEIGHT * stageScale);
  const characterBaseY = groundY - characterHeight;

  const scholarWidth = Math.round(NATIVE_SCHOLAR_WIDTH * stageScale);
  const scholarHeight = Math.round(NATIVE_SCHOLAR_HEIGHT * stageScale);
  const scholarX = viewportWidth * SCHOLAR_X_PERCENT;
  
  const scaleRatio = stageScale / REFERENCE_SCALE;
  const scholarProximityThreshold = Math.round(130 * scaleRatio);
  const scholarObstacleHalfWidth = Math.round(45 * scaleRatio);

  const roadBoundaries = {
    left: Math.round(viewportWidth * 0.04),
    right: Math.round(viewportWidth * 0.94)
  };

  const moveSpeedPps = Math.round(BASE_MOVE_SPEED_PPS * scaleRatio);
  const jumpHeight = Math.round(80 * scaleRatio);

  return {
    viewportWidth,
    viewportHeight,
    stageScale,
    groundOffset,
    groundY,
    characterWidth,
    characterHeight,
    characterBaseY,
    scholarWidth,
    scholarHeight,
    scholarX,
    scholarProximityThreshold,
    scholarObstacleHitbox: {
      id: 'scholar',
      left: scholarX - scholarObstacleHalfWidth,
      right: scholarX + scholarObstacleHalfWidth
    },
    roadBoundaries,
    moveSpeedPps,
    jumpHeight
  };
}

export interface WalkTargetResult {
  targetLeft: number;      // Character left coordinate (x) to stop at
  targetCenterX: number;   // Character center (x) on the stage
  groundY: number;         // Ground Y coordinate (feet baseline)
  markerY: number;         // Y coordinate for crosshair marker
}

/**
 * Calculates the closest reachable point on the cobblestone walk path
 * for any click point across the viewport.
 */
export function getClosestWalkTarget(
  clickX: number,
  currentCharX: number,
  stageMetrics: StageMetrics
): WalkTargetResult {
  const { characterWidth, roadBoundaries, scholarObstacleHitbox, groundY } = stageMetrics;

  // Target character left position so that the character centers on clickX
  let targetLeft = clickX - characterWidth / 2;

  // Clamp within road boundaries
  const minX = roadBoundaries.left;
  const maxX = roadBoundaries.right - characterWidth;
  targetLeft = Math.max(minX, Math.min(maxX, targetLeft));

  // Check obstacle hitboxes (e.g. Scholar NPC)
  const obs = scholarObstacleHitbox;
  if (currentCharX + characterWidth <= obs.left) {
    // Character is to the left of obstacle, cannot pass right past obs.left
    if (targetLeft > obs.left - characterWidth) {
      targetLeft = obs.left - characterWidth;
    }
  } else if (currentCharX >= obs.right) {
    // Character is to the right of obstacle, cannot pass left past obs.right
    if (targetLeft < obs.right) {
      targetLeft = obs.right;
    }
  }

  const targetCenterX = Math.round(targetLeft + characterWidth / 2);

  return {
    targetLeft: Math.round(targetLeft),
    targetCenterX,
    groundY,
    markerY: groundY - 10,
  };
}

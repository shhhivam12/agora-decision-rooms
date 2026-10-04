export interface RoomLoaderProps {
  size?: number;
  label?: string;
  /** Charcoal badge keeps the pale silhouettes visible on light surfaces. */
  badge?: boolean;
  /** Also useful when a screen is kept mounted in a background tab. */
  paused?: boolean;
}

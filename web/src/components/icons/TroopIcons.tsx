import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

// Cavalry - Horse head
export function CavalryIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M18.5 4c-1.5 0-2.5.5-3.5 1.5-1-.5-2-.5-3 0-.5-1-1.5-1.5-3-1.5-2 0-3.5 1.5-3.5 3.5 0 1.5.5 2.5 1.5 3.5l-2 8h3l1-4 2 2v6h3v-6l1.5-3 .5 3h-1v6h3v-6l2-2 1 4h3l-2-8c1-1 1.5-2 1.5-3.5C22 5.5 20.5 4 18.5 4zM9 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
    </svg>
  );
}

// Shield - Classical shield
export function ShieldIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 3.18l6 2.67v4.15c0 3.93-2.58 7.64-6 8.82-3.42-1.18-6-4.89-6-8.82V6.85l6-2.67z"/>
    </svg>
  );
}

// Archer - Bow with arrow
export function ArcherIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M4.93 3.93l1.41 1.41L3 8.59V11h2.41l3.25-3.34 1.41 1.41L7.59 12l2.48 2.93-1.41 1.41L5.41 13H3v2.41l3.34 3.25-1.41 1.41-3.86-3.86v-8.42l3.86-3.86zm14.14 0l3.86 3.86v8.42l-3.86 3.86-1.41-1.41L21 15.41V13h-2.41l-3.25 3.34-1.41-1.41L16.41 12l-2.48-2.93 1.41-1.41L18.59 11H21V8.59l-3.34-3.25 1.41-1.41zM12 8l-4 4 4 4 4-4-4-4zm0 2.83L13.17 12 12 13.17 10.83 12 12 10.83z"/>
    </svg>
  );
}

// Spear - Long spear/pike
export function SpearIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M5.41 21L4 19.59l9.5-9.5-1.41-1.41-9.5 9.5L1.17 16.77 12.94 5l2.83 2.83L4 19.59 5.41 21zM22.83 5.17l-4-4-2.83 2.83-2.83-2.83-1.41 1.41 2.83 2.83L6.17 13.83 7.59 15.24l8.41-8.41 2.83 2.83 1.41-1.41-2.83-2.83 2.83-2.83 2.59 2.58z"/>
    </svg>
  );
}

// Siege - Catapult
export function SiegeIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M21 12.5v7.5h-3v-5H6v5H3v-7.5l2-3V7h2V5h2V3h4v2h2v2h2v2.5l2 3zM7 9h10V7H7v2zm-1 8c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm14 0c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zM12 2c-.55 0-1 .45-1 1v1h2V3c0-.55-.45-1-1-1z"/>
    </svg>
  );
}

// Map of troop type to icon component
export const troopIcons = {
  cavalry: CavalryIcon,
  shield: ShieldIcon,
  archer: ArcherIcon,
  spear: SpearIcon,
  siege: SiegeIcon,
};

export type TroopIconType = keyof typeof troopIcons;

// Get icon component by type
export function TroopIcon({ type, ...props }: { type: TroopIconType } & IconProps) {
  const Icon = troopIcons[type];
  return <Icon {...props} />;
}

// ========== Army Type Icons using SVG images ==========

export type ArmyIconType = 'cavalry' | 'shield' | 'archer' | 'spear' | 'siege';

interface ArmyIconProps {
  type: ArmyIconType;
  size?: number;
  className?: string;
}

// Get army icon using SVG images with transparent background
export function ArmyIcon({ type, size = 20, className = '' }: ArmyIconProps) {
  return (
    <img
      src={`/images/army-types/${type}.svg`}
      alt={type}
      width={size}
      height={size}
      className={className}
    />
  );
}

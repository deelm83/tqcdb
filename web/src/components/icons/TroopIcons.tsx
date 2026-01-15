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

// ========== Army Type Icons (clearer, more distinct) ==========

// Horse head for cavalry - side profile
function ArmyHorseIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M21 6c-1 0-2 .4-2.8 1L17 5l-2 1-1-2h-3l1 3-2 3v5l-2 1v4h3v-3l4-2v5h3v-5l2 1v-6l1-2c.5.3 1.2.5 2 .5V6zM9.5 10c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5z"/>
    </svg>
  );
}

// Simple shield
function ArmyShieldIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  );
}

// Bow - curved bow shape with string
function ArmyBowIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M4 2v20l2-2V4L4 2zm4 3v14c3-1 6-4 6-7s-3-6-6-7zm10 1l-6 6 6 6 2-2-4-4 4-4-2-2z"/>
    </svg>
  );
}

// Spear - long pole with pointed tip
function ArmySpearIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M18.36 2.64L12 9l-1-1-8 8v4h4l8-8-1-1 6.36-6.36-2-2zM5 19v-1.59l7-7L13.59 12l-7 7H5z"/>
    </svg>
  );
}

// Wagon wheel for siege - spoked wheel
function ArmyWheelIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.93 0 3.68.7 5.05 1.85L12 9.5V4zm-1.5 0v5.5L5.95 5.85A7.95 7.95 0 0110.5 4zM4 12c0-1.93.7-3.68 1.85-5.05L9.5 12l-3.65 5.05A7.95 7.95 0 014 12zm6.5 8v-5.5l4.55 3.65A7.95 7.95 0 0110.5 20zm1.5 0v-5.5l5.05 3.65A7.952 7.952 0 0112 20zm6.15-2.95L14.5 12l3.65-5.05A7.95 7.95 0 0120 12c0 1.93-.7 3.68-1.85 5.05zM12 14.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}

// Map of army type to icon component
export const armyIcons = {
  cavalry: ArmyHorseIcon,
  shield: ArmyShieldIcon,
  archer: ArmyBowIcon,
  spear: ArmySpearIcon,
  siege: ArmyWheelIcon,
};

export type ArmyIconType = keyof typeof armyIcons;

// Get army icon component by type
export function ArmyIcon({ type, ...props }: { type: ArmyIconType } & IconProps) {
  const Icon = armyIcons[type];
  return Icon ? <Icon {...props} /> : null;
}

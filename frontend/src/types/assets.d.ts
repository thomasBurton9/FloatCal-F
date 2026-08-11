// Prevent errors when importing icons directly in typescript:
// 'require' call may be converted to an import.
// Or error TS2307: Cannot find module '../../assets/reminder_bell_icon64x64.png' or its corresponding type declarations.

declare module "*.png" {
  const source: import("react-native").ImageSourcePropType;
  export default source;
}

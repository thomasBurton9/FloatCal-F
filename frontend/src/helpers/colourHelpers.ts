// Amount should be between 0 and 1
export function lightenHex(hex: string, amount: number): string {
  const length = hex.length; // Should be 9 ideally
  const r = parseInt(hex.slice(1, 3), 16); // As these are hexcodes we decode them in base 16
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  let a;
  if (length === 9) {
    a = hex.slice(7, 9); //Slice till the end
  }

  function lightenAndConvert(colourValue: number): string {
    let newColour: number = Math.round(
      colourValue + (255 - colourValue) * amount,
    );
    const stringNewColour: string = newColour.toString(16).padStart(2, "0");
    return stringNewColour;
  }
  const newHex = `#${lightenAndConvert(r)}${lightenAndConvert(g)}${lightenAndConvert(b)}${a ? a : "FF"}`;
  return newHex;
}

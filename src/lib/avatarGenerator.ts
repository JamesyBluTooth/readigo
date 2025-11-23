export interface AvatarOptions {
  backgroundColor?: string;
  size?: number;
  skinColor?: string;
  eyes?: string;
  hair?: string;
  hairColor?: string;
  facialHair?: string;
  body?: string;
  clothingColor?: string;
  mouth?: string;
  nose?: string;
}

export const generateAvatarUrl = (seed: string, options?: AvatarOptions): string => {
  const baseUrl = 'https://api.dicebear.com/9.x/personas/svg';
  const params = new URLSearchParams({
    seed,
    backgroundColor: options?.backgroundColor || 'b6e3f4',
    ...(options?.size && { size: options.size.toString() }),
  });

  // Add single-value options
  if (options?.skinColor) {
    params.append('skinColor', options.skinColor);
  }
  if (options?.eyes) {
    params.append('eyes', options.eyes);
  }
  if (options?.hair) {
    params.append('hair', options.hair);
  }
  if (options?.hairColor) {
    params.append('hairColor', options.hairColor);
  }
  
  // Handle facial hair - if "nothing", use probability=0, otherwise set it and mirror hair color
  if (options?.facialHair) {
    if (options.facialHair === 'nothing') {
      params.append('facialHairProbability', '0');
    } else {
      params.append('facialHair', options.facialHair);
      // Mirror hair color to facial hair
      if (options?.hairColor) {
        params.append('facialHairColor', options.hairColor);
      }
    }
  }
  
  if (options?.body) {
    params.append('body', options.body);
  }
  if (options?.clothingColor) {
    params.append('clothingColor', options.clothingColor);
  }
  if (options?.mouth) {
    params.append('mouth', options.mouth);
  }
  if (options?.nose) {
    params.append('nose', options.nose);
  }

  return `${baseUrl}?${params.toString()}`;
};

export const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateSeedFromString = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
};

export const BACKGROUND_COLORS = [
  { name: 'Sky Blue', value: 'b6e3f4' },
  { name: 'Lavender', value: 'd4b5f7' },
  { name: 'Mint', value: 'b5f7d4' },
  { name: 'Peach', value: 'f7d4b5' },
  { name: 'Pink', value: 'f7b5d4' },
  { name: 'Yellow', value: 'f7f4b5' },
  { name: 'Coral', value: 'f7b5b5' },
  { name: 'Teal', value: 'b5f7f4' },
];

export const SKIN_COLORS = [
  { name: 'Tone 1', value: '623d36' },
  { name: 'Tone 2', value: '92594b' },
  { name: 'Tone 3', value: 'b16a5b' },
  { name: 'Tone 4', value: 'd78774' },
  { name: 'Tone 5', value: 'e5a07e' },
  { name: 'Tone 6', value: 'e7a391' },
  { name: 'Tone 7', value: 'eeb4a4' },
];

export const HAIR_COLORS = [
  { name: 'Brown', value: '6c4545' },
  { name: 'Dark Purple', value: '362c47' },
  { name: 'Platinum', value: 'dee1f5' },
  { name: 'Red', value: 'e15c66' },
  { name: 'Pink', value: 'e16381' },
  { name: 'Orange', value: 'f27d65' },
  { name: 'Blonde', value: 'f29c65' },
];

export const CLOTHING_COLORS = [
  { name: 'Green', value: '6dbb58' },
  { name: 'Cyan', value: '54d7c7' },
  { name: 'Blue', value: '456dff' },
  { name: 'Purple', value: '7555ca' },
  { name: 'Red', value: 'e24553' },
  { name: 'Yellow', value: 'f3b63a' },
  { name: 'Pink', value: 'f55d81' },
];

export const AVATAR_FEATURES = {
  eyes: ['glasses', 'happy', 'open', 'sleep', 'sunglasses', 'wink'],
  hair: ['bald', 'balding', 'beanie', 'bobBangs', 'bobCut', 'bunUndercut', 'buzzcut', 'cap', 'curly', 'curlyBun', 'curlyHighTop', 'extralong', 'fade', 'long', 'mohawk', 'pigtails', 'shortCombover', 'shortComboverChops', 'sideShave', 'straightBun'],
  facialHair: ['beardMustache', 'goatee', 'pyramid', 'shadow', 'soulPatch', 'walrus', 'nothing'],
  body: ['checkered', 'rounded', 'small', 'squared'],
  mouth: ['bigSmile', 'frown', 'lips', 'pacifier', 'smile', 'smirk', 'surprise'],
  nose: ['mediumRound', 'smallRound', 'wrinkles'],
};

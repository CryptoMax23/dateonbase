import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const BRAND_COLOR = '#0052FF';
const BG_COLOR = '#f8f9fa';

// Updated generateBrandSVG to accept a text parameter
const generateBrandSVG = (width: number, height: number, fontSize: number = 48, text: string = 'DateOnBase') => `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .base { fill: black; font-family: serif; font-size: ${fontSize}px; }
  </style>
  <rect width="100%" height="100%" fill="${BG_COLOR}"/>
  <text 
    x="50%" 
    y="50%" 
    class="base" 
    dominant-baseline="middle" 
    text-anchor="middle"
    font-weight="bold"
  >
    ${text}
  </text>
</svg>`;

const SIZES = {
  favicon16: { size: 16, fontSize: 8 },
  favicon32: { size: 32, fontSize: 14 },
  favicon: { size: 32, fontSize: 14 },
  appleTouchIcon: { size: 180, fontSize: 36 },
  androidChrome192: { size: 192, fontSize: 40 },
  androidChrome512: { size: 512, fontSize: 96 },
  ogImage: { width: 1200, height: 630, fontSize: 72 },
};

async function generateImage(
  svg: string, 
  outputPath: string, 
  options: { width: number; height: number }
) {
  const buffer = Buffer.from(svg);
  await sharp(buffer)
    .resize(options.width, options.height)
    .png()
    .toFile(outputPath);
}

async function ensurePublicDir() {
  const publicDir = path.join(process.cwd(), 'public');
  try {
    await fs.access(publicDir);
  } catch {
    await fs.mkdir(publicDir);
  }
  return publicDir;
}

async function main() {
  const publicDir = await ensurePublicDir();
  
  // Generate square icons
  for (const [name, config] of Object.entries(SIZES)) {
    if (name === 'ogImage') continue;  // Skip OG image as before
    
    // Add type guard to ensure config has 'size'
    if (typeof (config as any).size === 'number') {  // Simple check before using
      const outputPath = path.join(publicDir, 
        name === 'favicon' 
          ? 'favicon.ico' 
          : `${name.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`
      );
    
      // Determine custom text for specific icons
      const iconsToShowD = ['favicon16', 'favicon32', 'favicon'];
      const customText = iconsToShowD.includes(name) ? 'D' : 'DateOnBase';
      
      // Determine effective font size with adjustments
      let effectiveFontSize = (config as any).fontSize;
      if (name === 'androidChrome192') {
        effectiveFontSize -= 4;  // Slightly smaller for androidChrome192
      } else if (name === 'appleTouchIcon') {
        effectiveFontSize -= 4;  // Slightly smaller for appleTouchIcon
      }
      
      const svg = generateBrandSVG((config as any).size, (config as any).size, effectiveFontSize, customText);
      await generateImage(svg, outputPath, { 
        width: (config as any).size, 
        height: (config as any).size 
      });
    
      console.log(`Generated ${outputPath}`);
    }
  }

  // Generate OG Image
  const ogConfig = SIZES.ogImage;
  const ogSvg = generateBrandSVG(ogConfig.width, ogConfig.height, ogConfig.fontSize);
  await generateImage(ogSvg, path.join(publicDir, 'og-image.png'), {
    width: ogConfig.width,
    height: ogConfig.height
  });
  
  console.log('Generated og-image.png');
}

main().catch(console.error);
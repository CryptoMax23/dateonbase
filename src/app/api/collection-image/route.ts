import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350">
      <style>
        .base { fill: black; font-family: serif; font-size: 48px; }
        .subtitle { fill: black; font-family: serif; font-size: 24px; }
      </style>
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">
        DateOnBase
      </text>
      <text x="50%" y="60%" class="subtitle" dominant-baseline="middle" text-anchor="middle">
        Remember your
      </text>
      <text x="50%" y="70%" class="subtitle" dominant-baseline="middle" text-anchor="middle">
        special dates forever
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
} 
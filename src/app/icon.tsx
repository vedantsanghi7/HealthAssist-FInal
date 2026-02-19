import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: 'linear-gradient(to bottom right, #2563EB, #4F46E5)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '30%', // More rounded (squircle-like)
                }}
            >
                {/* Heart/Pulse SVG path simplified for 32x32 */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: '18px', height: '18px' }} // Slightly smaller icon
                >
                    <path d="M19 14c1.49-1.28 3.6-2.34 2.4-5.25c-0.61-4-5.3-7.5-12.7-7.5c-7.3 0-11.9 3.5-12.6 7.5c-1.1 2.9 1 4 2.5 5.25c1.49 1.25 3.3 2.15 4.9 3.4c2.1 1.63 2.9 6.25 2.9 6.25c0 0 0.8-4.62 2.9-6.25c1.6-1.25 3.4-2.15 4.9-3.4" fill="white" stroke="none" />
                    {/* Pulse line */}
                    <path d="M7 12h2l2-3l3 6l2-3h2" stroke="#2563EB" strokeWidth="1.5" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}

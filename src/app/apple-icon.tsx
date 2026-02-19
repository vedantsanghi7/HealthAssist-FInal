import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 180,
    height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(to bottom right, #2563EB, #4F46E5)',
                    color: 'white',
                    borderRadius: '0', // Apple handles rounding
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    style={{ width: '100px', height: '100px' }}
                >
                    {/* White Heart Shape */}
                    <path d="M50 22 C35 22 24 32 24 45 C24 55 29 62 36 69 L50 82 L64 69 C71 62 76 55 76 45 C76 32 65 22 50 22 Z" fill="white" />

                    {/* Blue Pulse Line (Cutout effect) */}
                    <path d="M34 45 L43 45 L46 39 L51 51 L55 45 L66 45" stroke="#2563EB" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}

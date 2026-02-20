import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

export const GlobalSparkles = () => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1, // Just above the background/blobs, but behind the UI
        }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                {/* 
                  Wide spread of silver sprinkles covering the entire screen.
                  Using a metallic silver color that pops against the dark plum background.
                */}
                <Sparkles
                    count={400}
                    scale={20} // Spread wide across the screen
                    size={2.5}
                    speed={0.3}
                    opacity={0.4}
                    color="#E1E7EF" // Metallic silver
                    noise={2} // Gentle drifting
                />
            </Canvas>
        </div>
    );
};

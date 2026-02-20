import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
// ─── T TOKENS ────────────────────────────────────────────────────────────────
const T = {
    magenta: '#D16BA5',
    lavender: '#B8A5D4',
};

// ─── CUSTOM ETHER SHADER ─────────────────────────────────────────────────────
const vertexShader = `
uniform float uTime;
uniform float uSpeed;
uniform float uDistort;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

// Classic Perlin 3D Noise 
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
    vUv = uv;
    vNormal = normalMatrix * normal;
    
    // Animate the noise
    float noise = cnoise(position * 1.5 + uTime * uSpeed);
    
    // Add displacement
    vec3 newPosition = position + normal * (noise * uDistort);
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

// Pseudo-random noise for glitter
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel effect
    float fresnel = dot(viewDir, normal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 2.5);

    // Mixing colors based on UV and time
    float mixValue = (sin(vUv.y * 10.0 + uTime) + 1.0) * 0.5;
    vec3 baseColor = mix(uColorA, uColorB, mixValue);
    
    // Glittering Silver Edge
    float glint = random(vUv * 200.0);
    // Control the blinking speed and density 
    float twinkle = sin(uTime * 12.0 + glint * 100.0) * 0.5 + 0.5;
    float sparkle = pow(twinkle, 30.0) * glint * 4.0;
    
    vec3 silverHue = vec3(0.85, 0.90, 0.95); // Cool, metallic silver
    vec3 edgeColor = (silverHue * fresnel * 1.5) + (silverHue * sparkle * fresnel);
    
    vec3 finalColor = baseColor + edgeColor;
    
    // Alpha falloff for soft edges
    float alpha = clamp(fresnel * 1.2 + 0.3, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
}
`;

// ─── 3D ORB COMPONENT ────────────────────────────────────────────────────────
const OrbBlob = ({ isAnimating }: { isAnimating: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uSpeed: { value: 0.8 },
            uDistort: { value: 0.3 },
            uColorA: { value: new THREE.Color(T.magenta) },
            uColorB: { value: new THREE.Color(T.lavender) },
        }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current) return;

        // Rotate slowly, and even slower when on the dashboard resting
        const rotationSpeed = isAnimating ? 0.1 : 0.04;
        meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
        meshRef.current.rotation.x = state.clock.elapsedTime * (rotationSpeed * 0.5);

        // Update shader uniforms
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = state.clock.elapsedTime;

        // Smoothly transition speed and distortion based on animation state
        // Resting speed boosted slightly for a more fluid feel
        const targetSpeed = isAnimating ? 2.5 : 0.4;
        const targetDistort = isAnimating ? 0.45 : 0.12;

        mat.uniforms.uSpeed.value = THREE.MathUtils.lerp(mat.uniforms.uSpeed.value, targetSpeed, 0.05);
        mat.uniforms.uDistort.value = THREE.MathUtils.lerp(mat.uniforms.uDistort.value, targetDistort, 0.05);
    });

    return (
        <mesh ref={meshRef}>
            {/* High segment count for smooth displacement */}
            <icosahedronGeometry args={[1.5, 64]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
};

// ─── STAGE WRAPPER ───────────────────────────────────────────────────────────
const SIZE: Record<string, number> = {
    sm: 160,
    md: 240,
    lg: 300,
    xl: 340,
    '2xl': 400,
};

interface EtherealOrbProps {
    isAnimating?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    text?: string;
}

export const EtherealOrb: React.FC<EtherealOrbProps> = ({
    isAnimating = false,
    size = 'xl',
    text = 'AWAKEN'
}) => {
    const diameter = SIZE[size] ?? 340;

    return (
        <div style={{
            position: 'relative',
            width: diameter,
            height: diameter,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>

            {/* The 3D Canvas Context */}
            <div style={{
                position: 'absolute',
                inset: -100, // Make the canvas larger to allow the glowing edges to bleed out naturally
                pointerEvents: 'none',
                zIndex: 1,
            }}>
                <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
                    <OrbBlob isAnimating={isAnimating} />
                    {/* Floating Silver Sprinkles around the void */}
                    <Sparkles
                        count={isAnimating ? 350 : 180}
                        scale={8}
                        size={isAnimating ? 3.5 : 2}
                        speed={isAnimating ? 0.9 : 0.2}
                        opacity={isAnimating ? 0.6 : 0.3}
                        color="#E1E7EF" // Metallic silver
                        noise={3} // chaotic drifting
                    />
                </Canvas>
            </div>

            {/* Floating Text matching SacredCircle */}
            <h2 style={{
                position: 'relative',
                zIndex: 2,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 300,
                fontSize: Math.round(diameter * 0.1),
                letterSpacing: '0.55em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.88)',
                margin: 0,
                userSelect: 'none',
                textShadow: isAnimating
                    ? `0 0 40px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.3)`
                    : `0 0 20px rgba(255,255,255,0.2)`,
                transition: 'text-shadow 0.8s ease-in-out',
            }}>
                {text}
            </h2>
        </div >
    );
};

"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";

export default function Landing3D() {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial color="#00bcd4" metalness={0.6} roughness={0.2} />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

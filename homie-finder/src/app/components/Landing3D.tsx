"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles } from "@react-three/drei";

export default function Landing3D() {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={150} color="#00b4d8" />
        <pointLight position={[-5, -5, -5]} intensity={100} color="#8000ff" />

        <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.5}>
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[1.4, 1]} />
            <meshStandardMaterial
              color="#0077b6"      
              metalness={0.1}     
              roughness={0.5}     
            />
          </mesh>
          <Sparkles count={100} scale={2.5} size={6} speed={0.4} color="#ade8f4" />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

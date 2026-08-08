import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";

function Cube() {
  const ref = useRef();
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.25;
    ref.current.rotation.y += delta * 0.35;
  });
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <RoundedBox ref={ref} args={[2.4, 2.4, 2.4]} radius={0.28} smoothness={6}>
        <MeshDistortMaterial
          color="#A855F7"
          emissive="#6EE7F9"
          emissiveIntensity={0.35}
          roughness={0.1}
          metalness={0.2}
          distort={0.28}
          speed={1.6}
          transparent
          opacity={0.92}
        />
      </RoundedBox>
    </Float>
  );
}

export default function HeroCube() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={2.4} color="#A855F7" />
      <pointLight position={[-5, -3, 2]} intensity={1.8} color="#6EE7F9" />
      <Cube />
    </Canvas>
  );
}

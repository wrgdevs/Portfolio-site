import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function Network({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);

  const { points, lines } = useMemo(() => {
    const random = seededRandom(1847);
    const count = 48;
    const nodePositions: number[][] = [];
    const pointArray = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 1.6 + random() * 2.3;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) * 0.78;
      const z = radius * Math.sin(phi) * Math.sin(theta);
      nodePositions.push([x, y, z]);
      pointArray.set([x, y, z], index * 3);
    }

    const segments: number[] = [];
    for (let a = 0; a < nodePositions.length; a += 1) {
      for (let b = a + 1; b < nodePositions.length; b += 1) {
        const [ax, ay, az] = nodePositions[a];
        const [bx, by, bz] = nodePositions[b];
        const distance = Math.hypot(ax - bx, ay - by, az - bz);
        if (distance < 1.34 && segments.length < 540) {
          segments.push(ax, ay, az, bx, by, bz);
        }
      }
    }

    return {
      points: pointArray,
      lines: new Float32Array(segments)
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y += delta * 0.075;
    group.current.rotation.x += (state.pointer.y * 0.08 - group.current.rotation.x) * 0.025;
    group.current.rotation.z += (state.pointer.x * -0.07 - group.current.rotation.z) * 0.025;
  });

  return (
    <group ref={group} rotation={[0.16, -0.45, 0.02]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#80f5bc" transparent opacity={0.22} />
      </lineSegments>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#b8ffe0" size={0.07} sizeAttenuation transparent opacity={0.9} />
      </points>

      <mesh>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshStandardMaterial color="#74efb2" emissive="#1cc878" emissiveIntensity={0.85} roughness={0.25} metalness={0.45} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0.15, 0.42]}>
        <torusGeometry args={[1.12, 0.012, 8, 120]} />
        <meshBasicMaterial color="#78e8f2" transparent opacity={0.72} />
      </mesh>
      <mesh rotation={[Math.PI / 2.1, 0.55, -0.38]}>
        <torusGeometry args={[1.48, 0.009, 8, 120]} />
        <meshBasicMaterial color="#e7b875" transparent opacity={0.46} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches || document.documentElement.classList.contains("reduced-effects"));
    };
    const handlePreference = () => update();
    update();
    media.addEventListener("change", update);
    window.addEventListener("portfolio:motion", handlePreference);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("portfolio:motion", handlePreference);
    };
  }, []);

  if (!mounted) {
    return <div className="hero-scene-fallback" aria-hidden="true" />;
  }

  return (
    <div className="hero-scene-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 48 }}
        dpr={[1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[3, 4, 5]} color="#9affcc" intensity={18} distance={12} />
        <pointLight position={[-4, -2, 3]} color="#77ddec" intensity={13} distance={10} />
        <Network reduced={reduced} />
      </Canvas>
    </div>
  );
}

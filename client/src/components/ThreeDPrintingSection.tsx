import React, { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, PresentationControls, Stars, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { CheckCircle2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const Particles = ({ count = 100 }) => {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 10;
            p[i * 3 + 1] = (Math.random() - 0.5) * 10;
            p[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, [count]);

    const pointsRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
            pointsRef.current.rotation.x += 0.0005;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length / 3}
                    array={points}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#3B82F6" transparent opacity={0.6} sizeAttenuation={true} />
        </points>
    );
};

const PuzzleBox = () => {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Holographic auto-rotation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;

            // Interactive tilt
            if (hovered) {
                meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, (state.mouse.y * Math.PI) / 10, 0.1);
                meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, (-state.mouse.x * Math.PI) / 10, 0.1);
            } else {
                meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.05);
                meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.05);
            }
        }
    });

    return (
        <Float speed={3} rotationIntensity={0.5} floatIntensity={1.5}>
            <group
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                scale={1.4}
            >
                {/* Holographic Glass Body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[2, 2, 2]} />
                    <meshPhysicalMaterial
                        color="#3B82F6"
                        transmission={0.9}
                        thickness={1}
                        roughness={0}
                        envMapIntensity={2}
                        clearcoat={1}
                        transparent
                        opacity={0.2}
                    />
                </mesh>

                {/* Neon Glow Edges */}
                <mesh>
                    <boxGeometry args={[2.01, 2.01, 2.01]} />
                    <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.4} />
                </mesh>

                {/* Floating Internal Data Core */}
                <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                    <boxGeometry args={[0.8, 0.8, 0.8]} />
                    <MeshDistortMaterial
                        color="#22D3EE"
                        speed={2}
                        distort={0.4}
                        emissive="#22D3EE"
                        emissiveIntensity={1.5}
                    />
                </mesh>

                {/* Cyber Rings */}
                {[1.2, 1.5].map((radius, i) => (
                    <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[radius, 0.01, 16, 100]} />
                        <meshBasicMaterial color="#3B82F6" transparent opacity={0.3} />
                    </mesh>
                ))}

                <pointLight color="#3B82F6" intensity={5} distance={5} />
            </group>
        </Float>
    );
};

const ThreeDPrintingSection = () => {
    const sectionRef = useRef(null);
    const navigate = useNavigate();

    const bulletPoints = [
        "High precision FDM & Resin printing",
        "Custom holographic designs",
        "Rapid prototyping & development",
        "Performance-grade cyber materials"
    ];

    return (
        <section
            ref={sectionRef}
            className="relative py-28 overflow-hidden bg-white dark:bg-gray-950"
            id="3d-printing"
        >
            {/* Subtle Grid Pattern overlay for light background */}
            <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />

            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="z-10"
                    >
                        <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold tracking-widest uppercase text-xs mb-4">
                            <Zap size={14} className="animate-pulse" />
                            <span>Next-Gen 3D Printing</span>
                        </div>
                        <h3 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
                            Precision 3D Printing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Redefined</span>
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
                            Experience advanced 3D printing solutions designed for innovation,
                            durability, and performance. We push the boundaries of what's possible.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {bulletPoints.map((point, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium group"
                                >
                                    <div className="bg-blue-100 dark:bg-blue-500/20 p-1.5 rounded-sm border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    {point}
                                </motion.li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap gap-4 mb-10">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 25px rgba(59, 130, 246, 0.6)", "0 0 0px rgba(59, 130, 246, 0)"],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-fit rounded-lg"
                            >
                                <Button
                                    onClick={() => navigate("/contact")}
                                    className="px-10 py-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-lg tracking-wide uppercase transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                >
                                    Contact Us
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-fit rounded-lg"
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/shop")}
                                    className="px-10 py-7 rounded-lg border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black text-lg tracking-wide uppercase transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                >
                                    Explore Products
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Side: Cyber 3D Scene */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 60 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="relative h-[500px] lg:h-[700px] w-full"
                    >
                        {/* Glowing Aura */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />

                        <Canvas shadows className="w-full h-full bg-transparent">
                            <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
                            <ambientLight intensity={0.2} />
                            <pointLight position={[10, 10, 10]} intensity={2} color="#3B82F6" />
                            <pointLight position={[-10, -10, -10]} intensity={1} color="#22D3EE" />

                            <PresentationControls
                                global
                                config={{ mass: 2, tension: 500 }}
                                snap={{ mass: 4, tension: 1500 }}
                                rotation={[0, 0.3, 0]}
                                polar={[-Math.PI / 4, Math.PI / 4]}
                                azimuth={[-Math.PI / 2, Math.PI / 2]}
                            >
                                <PuzzleBox />
                            </PresentationControls>

                            <Particles count={150} />
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                            <OrbitControls enableZoom={false} enablePan={false} />
                        </Canvas>

                        {/* Hint for interactivity */}
                        <div className="absolute bottom-4 right-4 text-xs text-blue-400 font-mono italic flex items-center gap-2 opacity-60">
                            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                            <span>Holographic Interface Active</span>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Background Glitch Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-sm" />
            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm" />
        </section>
    );
};

export default ThreeDPrintingSection;

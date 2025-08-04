import { useEffect, useState } from "react";

interface Particle {
  id: string;
  top: number;
  width: number;
  color: string;
  delay: number;
  duration: number;
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ["#00f0ff", "#ff0055", "#00ff9d", "#0066ff", "#ff00ff"];
    const newParticles: Particle[] = Array.from({ length: 30 }).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      top: Math.random() * 100,
      width: Math.random() * 50 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
      duration: Math.random() * 5 + 5, // Faster movement
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute h-1.5 rounded-lg opacity-70 animate-move-left"
          style={{
            top: `${particle.top}%`,
            right: `-60px`, // Start just outside the right edge
            width: `${particle.width}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes move-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-120vw); /* Move completely to the left */
          }
        }
        .animate-move-left {
          animation-name: move-left;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldAlert, Layers, Zap, Database } from "lucide-react";

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ value, duration = 2, prefix = "", suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalSteps = 60 * duration;
      const stepValue = end / totalSteps;
      
      const counter = setInterval(() => {
        start += stepValue;
        if (start > end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);

      return () => clearInterval(counter);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

const stats = [
  {
    value: 50,
    suffix: "+",
    label: "Scam Signals",
    icon: <ShieldAlert className="w-5 h-5 text-blue-400" />,
    gradient: "from-blue-500/20 to-transparent",
    border: "border-blue-500/30",
  },
  {
    value: 3,
    suffix: "",
    label: "Detection Layers",
    icon: <Layers className="w-5 h-5 text-purple-400" />,
    gradient: "from-purple-500/20 to-transparent",
    border: "border-purple-500/30",
  },
  {
    value: 3,
    prefix: "<",
    suffix: "s",
    label: "Analysis Time",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    gradient: "from-cyan-500/20 to-transparent",
    border: "border-cyan-500/30",
  },
  {
    value: 100,
    suffix: "+",
    label: "Test Samples",
    icon: <Database className="w-5 h-5 text-emerald-400" />,
    gradient: "from-emerald-500/20 to-transparent",
    border: "border-emerald-500/30",
  },
];

export function StatsSection() {
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-slate-900/50 backdrop-blur-xl p-6 group`}
            >
              {/* Background gradient */}
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${stat.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

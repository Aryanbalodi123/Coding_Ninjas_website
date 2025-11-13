"use client";

import { missionStatement, coreValues } from "@/data/club";
import { SectionTitle } from "../ui/SectionTitle";
import { Card } from "../ui/Card";
import { motion } from "framer-motion";
import { Rocket, GraduationCap, Code, Lightbulb } from "lucide-react";

export const MissionSection = () => {
  const pathway = [
    {
      title: "INSPIRE",
      description:
        "We aim to ignite curiosity and enthusiasm among students by fostering a culture of creativity and motivation.",
      icon: <Rocket className="w-10 h-10 text-orange-500" />,
    },
    {
      title: "LEARN",
      description:
        "We believe in continuous learning — building strong foundations through collaboration, mentorship, and practice.",
      icon: <GraduationCap className="w-10 h-10 text-orange-500" />,
    },
    {
      title: "SOLVE",
      description:
        "We encourage solving real-world problems using technology, logic, and teamwork — turning knowledge into impact.",
      icon: <Code className="w-10 h-10 text-orange-500" />,
    },
    {
      title: "INNOVATE",
      description:
        "We inspire innovation by transforming ideas into actionable solutions that redefine boundaries and create value.",
      icon: <Lightbulb className="w-10 h-10 text-orange-500" />,
    },
  ];

  return (
    <section className="container-grid mt-24 space-y-12">
      <SectionTitle
        eyebrow="Mission"
        title={missionStatement.title}
        description={missionStatement.description}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {missionStatement.pillars.map((pillar) => (
          <Card key={pillar.title} className="bg-surface/70">
            <h3 className="text-xl font-heading text-foreground">
              {pillar.title}
            </h3>
            <p className="mt-3 text-sm text-foreground/70">
              {pillar.description}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 rounded-3xl border border-border/60 bg-surface/60 p-8 md:grid-cols-3">
        {coreValues.map((value) => (
          <div key={value.title} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
              Value
            </p>
            <h3 className="text-lg font-heading text-foreground">
              {value.title}
            </h3>
            <p className="text-sm text-foreground/70">{value.description}</p>
          </div>
        ))}
      </div>

      {/* ✅ OUR FUNDAMENTAL PATHWAY SECTION */}
      <div className="space-y-8">
        <h2 className="text-3xl font-heading font-bold text-center text-foreground">
          OUR FUNDAMENTAL PATHWAY
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pathway.map((step) => (
            <motion.div
              key={step.title}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative group h-56 rounded-2xl border border-border/50 bg-surface/60 cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:border-orange-500"
            >
              {/* Icon */}
              <div className="mb-3 transition-all duration-500 group-hover:opacity-0">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground transition-all duration-500 group-hover:opacity-0">
                {step.title}
              </h3>

              {/* Hover Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 bg-surface/90"
              >
                <p className="text-sm text-foreground/80">{step.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

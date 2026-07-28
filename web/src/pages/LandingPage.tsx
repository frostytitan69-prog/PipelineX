import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Shield,
  Cpu,
  ArrowRight,
  Cloud,
  Activity,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-[#27272A] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">PipelineX</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-all">Features</a>
          <a href="#architecture" className="hover:text-white transition-all">Architecture</a>
          <a href="#stack" className="hover:text-white transition-all">Tech Stack</a>
        </div>
        <div className="flex items-center gap-3">
          <NavLink to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </NavLink>
          <NavLink to="/dashboard">
            <Button variant="primary" size="sm">
              Launch Console <ArrowRight className="w-4 h-4" />
            </Button>
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
        <div className="relative max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6"
          >
            <Activity className="w-3.5 h-3.5" /> PipelineX V1 High Performance Engine
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight"
          >
            Asynchronous File Processing at Enterprise Scale
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Ingest, parse, resize, and extract data asynchronously with BullMQ queues, Cloudflare R2 object storage, Sharp image processing, and real-time observability.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <NavLink to="/dashboard">
              <Button variant="primary" size="lg">
                Explore Live Demo <ArrowRight className="w-5 h-5" />
              </Button>
            </NavLink>
            <NavLink to="/register">
              <Button variant="outline" size="lg">
                Create Account
              </Button>
            </NavLink>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto border-t border-[#27272A]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">Core Architecture & Capabilities</h2>
          <p className="text-zinc-400 mt-2">Built for sub-millisecond response times and resilient distributed job processing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg w-fit mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">BullMQ & Redis Workers</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Non-blocking job queues with 3x exponential backoff retries, dead-letter job inspection, and concurrency control.
            </p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg w-fit mb-4">
              <Cloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cloudflare R2 Storage</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              S3-compatible object storage for original uploads and generated 300x300 JPEG thumbnails with temporary presigned download URLs.
            </p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg w-fit mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Observability & Admin Console</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Role-Based Access Control (RBAC), live queue statistics, system health checks, and Winston structured JSON file logging.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section id="architecture" className="py-16 px-6 max-w-5xl mx-auto border-t border-[#27272A] text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Pipeline Execution Lifecycle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-10">
          {[
            { step: '01', title: 'Upload File', desc: 'Multer validation & storage in Cloudflare R2' },
            { step: '02', title: 'Enqueue Job', desc: 'Immediate 201 response with BullMQ Job ID' },
            { step: '03', title: 'Process Pipeline', desc: 'Sharp thumbnailing, pdf-parse text extraction' },
            { step: '04', title: 'Retrieve Result', desc: 'Prisma result model + presigned download link' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-[#18181B] border border-[#27272A] rounded-xl text-left">
              <span className="text-2xl font-black text-blue-500 mb-2 block">{item.step}</span>
              <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section id="stack" className="py-16 px-6 border-t border-[#27272A] text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-6">Powered by Modern Enterprise Technologies</p>
        <div className="flex flex-wrap justify-center items-center gap-3 max-w-3xl mx-auto">
          {['Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL 16', 'Redis 7', 'BullMQ', 'Cloudflare R2', 'Sharp', 'pdf-parse', 'React 19', 'Tailwind CSS v4', 'Zod', 'Winston'].map((tech, idx) => (
            <span key={idx} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#18181B] border border-[#27272A] text-zinc-300">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272A] py-8 px-6 text-center text-xs text-zinc-500">
        <p>© 2026 PipelineX V1. All rights reserved. Built with precision for scalable file engineering.</p>
      </footer>
    </div>
  );
};

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumFeatureCard } from '@/components/ui/PremiumFeatureCard';
import {
  Activity, Users, ArrowRight, HeartPulse,
  Brain, MessageSquare, Calendar,
  FileText, Video, Sparkles, Heart, Github, Linkedin, Twitter
} from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ModeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-blue-500/30 font-sans tracking-tight bg-background">

      {/* Advanced Dynamic Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Light mode gradients */}
        <div className="dark:hidden absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-[120px]" />
        <div className="dark:hidden absolute top-[30%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-bl from-teal-300/10 to-cyan-300/10 blur-[130px]" />
        <div className="dark:hidden absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-400/5 blur-[100px]" />

        {/* Dark mode gradients */}
        <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-600/15 to-purple-600/15 blur-[120px] animate-pulse-slow" />
        <div className="hidden dark:block absolute top-[30%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-bl from-teal-500/10 to-cyan-500/10 blur-[130px]" />
        <div className="hidden dark:block absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-600/8 blur-[100px]" />

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30 dark:opacity-10" />
      </div>

      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 w-full z-50 border-b transition-all duration-300",
        "bg-white/80 border-white/20 backdrop-blur-xl",
        "dark:bg-[#0B0F14]/80 dark:border-white/[0.05]"
      )}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
              HealthAssist
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#ai" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sarvam AI</a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Team</a>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 rounded-full px-6 transition-all duration-300 font-medium">
                Log In
              </Button>
            </Link>
            <Link href="/login?mode=signup">
              <Button className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 rounded-full px-6 transition-all hover:scale-105 hover:shadow-2xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-visible z-10">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md shadow-sm ring-1",
              "bg-white/40 border-white/60 ring-white/50",
              "dark:bg-white/[0.05] dark:border-white/[0.1] dark:ring-white/10"
            )}>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Powered by Sarvam AI</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              The Future of <br />
              <span className="text-gradient-primary">
                Connected Care.
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-medium">
              Seamlessly connect patients and doctors on one unified platform. Experience real-time vitals monitoring, instant AI diagnostics, and secure global consultation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-lg shadow-xl shadow-blue-500/25 group transition-all hover:-translate-y-1 duration-300">
                  Patient Portal
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login?role=doctor" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className={cn(
                  "w-full h-14 rounded-2xl text-lg backdrop-blur-md shadow-sm transition-all hover:-translate-y-1 hover:shadow-md duration-300",
                  "bg-white/60 hover:bg-white border-white/60 text-slate-700",
                  "dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:border-white/[0.1] dark:text-white"
                )}>
                  Doctor Login
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Interactive 3D Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
            style={{ perspective: 1000 }}
            className="relative lg:h-[650px] flex items-center justify-center md:justify-end lg:pr-10"
          >
            <div className="relative w-full max-w-lg aspect-[4/5] transform-style-3d">
              {/* Background Glows */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/10 to-teal-500/20 rounded-[40px] blur-3xl animate-pulse-slow z-0" />

              {/* Main Dashboard Panel Layer */}
              <GlassCard className={cn(
                "absolute inset-0 z-10 rounded-[32px] overflow-hidden flex flex-col transform transition-transform duration-500 hover:scale-[1.02]",
                "!bg-white/50 dark:!bg-white/[0.03]"
              )} hover={false}>

                {/* Simulated Header */}
                <div className="h-16 border-b border-white/20 dark:border-white/[0.05] flex items-center justify-between px-6 bg-white/10 dark:bg-white/[0.02]">
                  <div className="w-1/3 h-2.5 rounded-full bg-slate-200/50 dark:bg-white/10"></div>
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                  </div>
                </div>

                {/* Dashboard Grid Content */}
                <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                  {/* Main Vitals Chart Area */}
                  <div className={cn(
                    "col-span-2 h-48 rounded-2xl border p-5 relative overflow-hidden group",
                    "bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-white/40",
                    "dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-indigo-500/10 dark:border-white/[0.05]"
                  )}>
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Activity className="text-blue-500 h-6 w-6" />
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Live Vitals</div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">Normal</div>
                    <div className="mt-8 flex items-end gap-1 h-20 w-full">
                      {[40, 65, 50, 80, 55, 90, 70, 60, 85, 45, 60, 75].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: i * 0.05, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-sm opacity-80"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sub Card 1 */}
                  <div className={cn(
                    "h-32 rounded-2xl border p-4 relative",
                    "bg-white/40 border-white/40",
                    "dark:bg-white/[0.03] dark:border-white/[0.05]"
                  )}>
                    <div className="h-8 w-8 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 flex items-center justify-center mb-3">
                      <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">98 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">bpm</span></div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">▲ Stable</div>
                  </div>

                  {/* Sub Card 2 */}
                  <div className={cn(
                    "h-32 rounded-2xl border p-4 relative",
                    "bg-white/40 border-white/40",
                    "dark:bg-white/[0.03] dark:border-white/[0.05]"
                  )}>
                    <div className="h-8 w-8 rounded-full bg-purple-100/80 dark:bg-purple-500/20 flex items-center justify-center mb-3">
                      <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">AI Report Ready</div>
                    <button className="mt-2 text-xs bg-purple-600 text-white px-2 py-1 rounded-md">View</button>
                  </div>
                </div>
              </GlassCard>

              {/* Floating 3D Widgets (Parallax) */}
              {/* Widget 1: Health Score (Top Right) */}
              <motion.div
                animate={{ y: [0, -15, 0], rotateZ: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-8 z-30"
              >
                <GlassCard className="w-36 p-4 flex flex-col items-center gap-2 !bg-white/90 dark:!bg-[#111827]/90 rounded-3xl" hover={false}>
                  <div className="relative h-16 w-16">
                    <svg className="h-full w-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-100 dark:text-white/10" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-blue-500" strokeDasharray="175" strokeDashoffset="25" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-800 dark:text-white">92</div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Score</span>
                </GlassCard>
              </motion.div>

              {/* Widget 2: Appointment (Bottom Left) */}
              <motion.div
                animate={{ y: [0, 20, 0], x: [0, 5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-12 z-30"
              >
                <GlassCard className="p-4 flex items-center gap-4 !bg-white/95 dark:!bg-[#111827]/95 rounded-3xl min-w-[240px]" hover={false}>
                  <div className="relative">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Dr" className="h-12 w-12 rounded-full border-2 border-white dark:border-white/20 shadow-md bg-slate-100 dark:bg-slate-800" />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-[#111827]"></span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Upcoming</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. Sarah Jen</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Video Consultation • 10:00 AM</p>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Widget 3: BP (Mid Right) */}
              <motion.div
                animate={{ x: [0, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 -right-16 z-20"
              >
                <GlassCard className="p-3 flex items-center gap-3 !bg-white/80 dark:!bg-[#111827]/80 rounded-2xl" hover={false}>
                  <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">BP</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">120/80</p>
                  </div>
                </GlassCard>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent opacity-30"></div>
        <div className={cn(
          "absolute inset-0 skew-y-1 transform origin-top-left -z-10",
          "bg-slate-50/50 dark:bg-transparent"
        )}></div>
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20 space-y-4"
          >
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border",
              "bg-indigo-50 text-indigo-600 border-indigo-100",
              "dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
            )}>
              Platform Features
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              Complete Care <span className="text-gradient-primary">Coordination</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
              Powerful tools for patients and providers, unified in one elegant interface.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                title: "Unified ecosystem",
                desc: "A seamless bridge connecting patients and specialized doctors."
              },
              {
                icon: <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
                title: "Digital Records",
                desc: "Securely upload and maintain all your medical history in one place."
              },
              {
                icon: <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
                title: "Video Consultations",
                desc: "Connect with doctors instantly through HD secure video calls."
              },
              {
                icon: <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
                title: "Smart Appointments",
                desc: "Hassle-free booking system with automated reminders."
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
                title: "Direct Messaging",
                desc: "Secure, encrypted chat channel for quick follow-ups."
              },
              {
                icon: <Brain className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
                title: "Health Insights",
                desc: "Deep analytics on your vitals and long-term health trends."
              }
            ].map((feature, i) => (
              <PremiumFeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sarvam AI Section */}
      <section id="ai" className="py-32 relative overflow-hidden">
        {/* Background blobs for this section */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-indigo-500/5 to-transparent z-0"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-gradient-to-t from-orange-500/5 to-transparent z-0"></div>

        <div className="container mx-auto px-6 relative z-10">
          <GlassCard className={cn(
            "overflow-hidden p-0 rounded-[40px]",
            "!bg-gradient-to-br !from-white/90 !to-white/50",
            "dark:!from-[#111827]/90 dark:!to-[#0B0F14]/80"
          )} hover={false}>
            <div className="grid lg:grid-cols-2">
              <div className="p-12 lg:p-20 flex flex-col justify-center space-y-10">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Powered by Sarvam AI</span>
                </div>

                <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  Your Personal <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">
                    Multilingual Assistant
                  </span>
                </h2>

                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Experience healthcare without language barriers. Our AI understands your medical reports and answers your queries in <span className="font-bold text-slate-900 dark:text-white">English + 10 Indian Languages</span>.
                </p>

                <ul className="space-y-4">
                  {[
                    "Analysis based on your real medical records",
                    "Context-aware answers tailored to your history",
                    "Support for Hindi, Tamil, Telugu, and more"
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      </div>
                      {item}
                    </motion.li>
                  ))}
                </ul>

                <Link href="/login">
                  <Button size="lg" className="mr-auto h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full px-10 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
                    Try AI Assistant
                    <Brain className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Right Side Visual */}
              <div className="bg-slate-900 relative min-h-[500px] lg:min-h-auto p-12 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.07]"></div>
                <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-indigo-500/30 blur-[120px] rounded-full animate-pulse-slow"></div>

                {/* Chat Interface Mockup */}
                <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl space-y-6 relative z-10">
                  <div className="flex items-center gap-4 border-b border-slate-700/50 pb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-slate-200 font-bold">Sarvam Health Bot</div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-slate-400">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm font-medium">
                    <div className="bg-slate-700/50 text-slate-300 p-4 rounded-2xl rounded-tl-none self-start max-w-[90%] border border-slate-600/50">
                      <p>नमस्ते! Based on your blood report uploaded yesterday, your Vitamin D levels are slightly low (18 ng/ml).</p>
                    </div>
                    <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none self-end ml-auto max-w-[90%] shadow-lg shadow-blue-500/20">
                      <p>What should I eat to improve this?</p>
                    </div>
                    <div className="bg-slate-700/50 text-slate-300 p-4 rounded-2xl rounded-tl-none self-start max-w-[90%] border border-slate-600/50">
                      <p>You should include foods like mushrooms, egg yolks, and fortified milk. Would you like a detailed diet chart in Hindi?</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="h-12 w-full bg-slate-700/30 rounded-full border border-slate-600/30 flex items-center px-4 text-slate-500 text-sm">
                      Type your message...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className={cn(
        "py-32 px-6 relative z-10",
        "bg-gradient-to-b from-white to-blue-50/50",
        "dark:from-transparent dark:to-transparent"
      )}>
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border",
              "bg-blue-50 text-blue-600 border-blue-100",
              "dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
            )}>
              Our Team
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
              Built by Innovators at <span className="text-gradient-primary">BITS Pilani</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              A dedicated team of developers passionate about transforming healthcare technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                name: "Vedant Sanghi",
                image: "/avatars/vedant.png",
                github: "https://github.com/vedantsanghi7",
                linkedin: "https://www.linkedin.com/in/vedant-sanghi-47a6b1229/"
              },
              {
                name: "Aadi Shravan",
                image: "/avatars/aadi.png",
                linkedin: "https://www.linkedin.com/in/aadi-shravan-3a1199280"
              },
              {
                name: "Chitransh Tiwari",
                image: "/avatars/chitransh.png",
                github: "https://github.com/chitransh1512-dotcom",
                linkedin: "https://www.linkedin.com/in/chitransh-tiwari-442434372"
              },
              {
                name: "Pushkar Kumar",
                image: "/avatars/pushkar.png",
                github: "https://github.com/PushOueOUe",
                linkedin: "https://www.linkedin.com/in/pushkar-kumar-0773b3378"
              },
              {
                name: "Parth Gupta",
                image: "/avatars/parth.png",
                github: "https://github.com/guptaparth-tech/",
                linkedin: "https://www.linkedin.com/in/parth-gupta-62b863367"
              }
            ].map((dev, i) => (
              <GlassCard key={i} className="flex flex-col items-center p-6 text-center">
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-white/20 shadow-lg mb-4 bg-slate-100 dark:bg-slate-800">
                  <img src={dev.image} alt={dev.name} className="h-full w-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{dev.name}</h3>

                <div className="mt-4 flex gap-3 text-slate-400">
                  {dev.github && (
                    <a href={dev.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors" />
                    </a>
                  )}
                  {dev.linkedin && (
                    <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors" />
                    </a>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn(
        "py-16 border-t relative z-10",
        "bg-white/40 border-white/20 backdrop-blur-lg",
        "dark:bg-[#0B0F14]/80 dark:border-white/[0.05]"
      )}>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <HeartPulse className="h-4 w-4 text-white dark:text-slate-900" />
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">HealthAssist</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Empowering healthcare through intelligence. Connect with doctors, manage records, and get AI insights in real-time.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">Platform</h4>
              <ul className="space-y-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Patient Portal</li>
                <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Doctor Dashboard</li>
                <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">AI Analysis</li>
                <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Pricing</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">HIPAA Compliance</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-white/[0.05] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <div>
              © 2026 HealthAssist Inc. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Twitter className="h-4 w-4 hover:text-blue-400 cursor-pointer transition-colors" />
              <Github className="h-4 w-4 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="h-4 w-4 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

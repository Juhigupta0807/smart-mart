"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { HeroStat } from "@/types/store";
import { HERO_STATS } from "@/data/mockStoreData";

interface HeroSectionProps {
  stats?: HeroStat[];
  onShopNowClick?: () => void;
}

export function HeroSection({
  stats = HERO_STATS,
  onShopNowClick,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle background ambient glow / organic curves */}
      <div className="absolute top-12 right-0 w-[550px] h-[550px] bg-[#EAF2E7]/80 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3" />
      <div className="absolute top-1/2 left-0 w-[350px] h-[350px] bg-[#FDF1E8]/50 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column (Copy & Actions) */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest uppercase text-stone-500">
                Fresher Choices, Happier Days
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-stone-900 leading-[1.12]">
              Your Everyday Shopping,{" "}
              <span className="relative inline-block text-[#215E3F]">
                Smarter.
                {/* Playful Orange Accent Rays above Smarter */}
                <svg
                  className="absolute -top-5 sm:-top-6 right-0 w-8 h-8 sm:w-10 sm:h-10 text-[#F97316] pointer-events-none"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 26L4 20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 22L16 8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M27 24L36 17"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl font-normal leading-relaxed">
              Fresh groceries, daily essentials and more — all in one place. Quality products,
              real-time availability and a seamless shopping experience, just for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="#products"
                onClick={onShopNowClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold text-white bg-[#1E4D38] hover:bg-[#163C2B] shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="#categories"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-base font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-all duration-200"
              >
                Explore Products
              </Link>
            </div>

            {/* Statistics Row */}
            <div className="pt-6 border-t border-stone-200/60">
              <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-md">
                {stats.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-stone-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Hero Visual Composition) */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            
            {/* Background Organic Sage Shape */}
            <div className="absolute inset-0 bg-[#E0EDE0]/70 rounded-[2.5rem] lg:rounded-[3rem] -rotate-1 scale-95 transition-transform" />
            
            {/* Decorative Botanical Elements & Sparkles */}
            <div className="absolute -top-6 -left-4 w-12 h-12 text-[#3D7858]/30 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 C60 30 70 40 100 50 C70 60 60 70 50 100 C40 70 30 60 0 50 C30 40 40 30 50 0 Z" />
              </svg>
            </div>

            {/* Top Right Handwritten Tag: "Good Food, Brighter Days ♡" */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-6 z-20 pointer-events-none select-none">
              <div className="flex flex-col items-center rotate-6 text-stone-700">
                <span className="font-handwriting text-xl sm:text-2xl font-bold tracking-wide text-stone-800 flex items-center gap-1">
                  ‹Good›
                </span>
                <span className="font-handwriting text-lg sm:text-xl font-bold text-stone-700">
                  Food
                </span>
                <span className="font-handwriting text-base sm:text-lg font-bold text-stone-600">
                  Brighter Days ♡
                </span>
                <div className="flex gap-1 text-[#2B6E48] mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Main Visual Image Card */}
            <div className="relative z-10 w-full max-w-[500px] aspect-square rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-card border border-stone-100 bg-white group">
              <Image
                src="/images/hero-groceries.jpg"
                alt="SmartMart reusable bag filled with fresh vegetables, bread, and fruits"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-103"
              />

              {/* Floating Badge: "Fresh Essentials Delivered to You" */}
              <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-[#FAF6EE]/95 backdrop-blur-md border border-[#E9E1D2] rounded-2xl px-4 py-3 shadow-card max-w-[170px] text-left transform hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-1 text-xs font-semibold text-[#1E4D38] mb-0.5">
                  <Leaf className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>SmartMart</span>
                </div>
                <div className="text-[13px] font-bold text-stone-800 leading-tight">
                  Fresh Essentials
                </div>
                <div className="text-[11px] text-stone-500 font-medium leading-tight">
                  Delivered to You
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

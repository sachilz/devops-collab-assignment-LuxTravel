'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Users, Phone, Mail, Instagram, Facebook, Twitter, 
  Menu, X, ArrowRight, Star, Globe, Clock, CheckCircle, Search, 
  Play, ChevronLeft, ChevronRight, Heart, Linkedin,
  ArrowLeft, ShieldCheck, Award, Loader2, AlertCircle, User
} from 'lucide-react';
import ProfileModal from './components/ProfileModal';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";


// --- Types & Interfaces ---
interface Tour {
  id: number;
  title: string;
  location: string;
  price: number;
  days: number;
  image: string;
  category: string;
  rating: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface Destination {
  id: number;
  name: string;
  count: string;
  image: string;
}

interface DestinationImage {
  src: string;
  title: string;
  location: string;
}

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  image: string;
}

// --- Mock Data ---
const TOURS: Tour[] = [
  { id: 1, title: "Swiss Alps Adventure", location: "Switzerland", price: 1200, days: 5, image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800", category: "Adventure", rating: 4.9 },
  { id: 2, title: "Kyoto Cherry Blossoms", location: "Japan", price: 2400, days: 10, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800", category: "Cultural", rating: 5.0 },
  { id: 3, title: "Santorini Sunset", location: "Greece", price: 1800, days: 7, image: "images/santorini sunset.jpg", category: "Relaxation", rating: 4.8 },
  { id: 4, title: "Bali Tropical Escape", location: "Indonesia", price: 950, days: 6, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800", category: "Relaxation", rating: 4.7 },
  { id: 5, title: "Safari Expedition", location: "Kenya", price: 3200, days: 12, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800", category: "Adventure", rating: 4.9 },
  { id: 6, title: "Amalfi Coast Tour", location: "Italy", price: 2100, days: 8, image: "images/amalfi coast tour.webp", category: "Cultural", rating: 4.8 },
];



const DESTINATIONS: Destination[] = [
  { id: 1, name: "Europe", count: "40+ Tours", image: "https://images.unsplash.com/photo-1471306224500-6d0d218be372?auto=format&fit=crop&q=80&w=600" },
  { id: 2, name: "Asia", count: "35+ Tours", image: "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?auto=format&fit=crop&q=80&w=600" },
  { id: 3, name: "Africa", count: "20+ Tours", image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=600" },
  { id: 4, name: "South America", count: "15+ Tours", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=600" },
];

const DESTINATION_GALLERY: Record<string, DestinationImage[]> = {
  "Asia": [
    { src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800", title: "Arashiyama Bamboo Grove", location: "Kyoto, Japan" },
    { src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800", title: "Nusa Penida", location: "Bali, Indonesia" },
    { src: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=800", title: "Great Wall", location: "Beijing, China" },
    { src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800", title: "Taj Mahal", location: "Agra, India" },
    { src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=800", title: "Phi Phi Islands", location: "Thailand" },
    { src: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800", title: "Tokyo Tower", location: "Tokyo, Japan" },
    { src: "images/overwater bunglows.jpg", title: "Overwater Bungalows", location: "Maldives" },
    { src: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800", title: "Gardens by the Bay", location: "Singapore" },
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800", title: "Ha Long Bay", location: "Vietnam" },
    { src: "images/pertra.webp", title: "Petra", location: "Jordan" },
    { src: "images/sigiriya.jpg", title: "Sigiriya", location: "Sri Lanka" },
    { src: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800", title: "City Lights", location: "Tokyo, Japan" },
  ],
  "Europe": [
    { src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800", title: "Eiffel Tower", location: "Paris, France" },
    { src: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=800", title: "Cinque Terre", location: "Italy" },
    { src: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800", title: "Matterhorn", location: "Switzerland" },
    { src: "images/oia.jpg", title: "Oia", location: "Santorini, Greece" },
    { src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800", title: "Big Ben", location: "London, UK" },
    { src: "images/canales.avif", title: "Canals", location: "Amsterdam" },
    { src: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=800", title: "Sagrada Familia", location: "Barcelona, Spain" },
    { src: "images/charles bridge.jpg", title: "Charles Bridge", location: "Prague" },
    { src: "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&q=80&w=800", title: "Grand Canal", location: "Venice, Italy" },
    { src: "images/Old-Town.webp", title: "Old Town", location: "Dubrovnik, Croatia" },
    { src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=800", title: "Neuschwanstein", location: "Germany" },
    { src: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800", title: "Highlands", location: "Iceland" },
  ],
  "Africa": [
    { src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800", title: "Maasai Mara", location: "Kenya" },
    { src: "https://images.unsplash.com/photo-1503756234508-e32369269deb?auto=format&fit=crop&q=80&w=800", title: "Pyramids of Giza", location: "Egypt" },
    { src: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=800", title: "Table Mountain", location: "Cape Town" },
    { src: "images/victoria falls.jpg", title: "Victoria Falls", location: "Zambia/Zimbabwe" },
    { src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800", title: "Sahara Desert", location: "Morocco" },
    { src: "images/stone-town.jpg", title: "Stone Town", location: "Zanzibar" },
    { src: "https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&q=80&w=800", title: "Le Morne", location: "Mauritius" },
    { src: "images/la digue.webp", title: "La Digue", location: "Seychelles" },
    { src: "images/avenue of baobabs.jpg", title: "Avenue of Baobabs", location: "Madagascar" },
    { src: "images/medina.jpg", title: "Medina", location: "Marrakesh" },
    { src: "images/wild giraffe.jpg", title: "Wild Giraffe", location: "Kenya" },
    { src: "images/serengeti plains.jpg", title: "Serengeti Plains", location: "Tanzania" },
  ],
  "South America": [
    { src: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800", title: "Machu Picchu", location: "Peru" },
    { src: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800", title: "Christ the Redeemer", location: "Rio, Brazil" },
    { src: "images/torres del plaine.jpg", title: "Torres del Paine", location: "Patagonia" },
    { src: "images/iguazu falls.jpg", title: "Iguazu Falls", location: "Brazil/Argentina" },
    { src: "images/salar  de uyuni.avif", title: "Salar de Uyuni", location: "Bolivia" },
    { src: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&q=80&w=800", title: "Cartagena", location: "Colombia" },
    { src: "images/la boca.jpg", title: "La Boca", location: "Buenos Aires" },
    { src: "images/moai statues.webp", title: "Moai Statues", location: "Easter Island" },
    { src: "images/galapagos.jpg", title: "Galapagos", location: "Ecuador" },
    { src: "images/atacama desert.avif", title: "Atacama Desert", location: "Chile" },
    { src: "images/amazon river.jpg", title: "Amazon River", location: "Brazil" },
    { src: "https://images.unsplash.com/photo-1550850839-8dc894ed385a?auto=format&fit=crop&q=80&w=800", title: "Rainbow Mountain", location: "Peru" },
  ]
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Savindu Wijesingha",
    location: "Colombo, Sri Lanka",
    text: "Luxe Travel made my dream vacation a reality. Every detail was perfectly planned and executed. Highly recommended!",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    name: "Sithmini Sandamali",
    location: "Kandy, Sri Lanka",
    text: "The best travel experience I've ever had. From the flights to the accommodations, everything was world-class.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    name: "Thilina Dilshan",
    location: "Galle, Sri Lanka",
    text: "Outstanding service and attention to detail. Luxe Travel truly delivered a luxury experience beyond expectations.",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    name: "Dintih Sasanga",
    location: "Negombo, Sri Lanka",
    text: "An unforgettable journey through breathtaking destinations. Worth every penny. Thank you Luxe Travel!",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    name: "Dhanuka Neranjan",
    location: "Matara, Sri Lanka",
    text: "Exceeded all my expectations. The local insights and curated experiences were absolutely fantastic.",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 6,
    name: "Chmath Maduka",
    location: "Jaffna, Sri Lanka",
    text: "Professional team, seamless coordination, and memories that will last a lifetime. Five stars!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 7,
    name: "Tharushi Salwathura",
    location: "Kurunegala, Sri Lanka",
    text: "Absolutely wonderful experience! The team took care of everything so we could just relax and enjoy.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 8,
    name: "Shalini Kaushlaya",
    location: "Anuradhapura, Sri Lanka",
    text: "I was amazed by the personalized itinerary. It felt like the trip was made just for me.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 9,
    name: "Sajini Sawindya",
    location: "Badulla, Sri Lanka",
    text: "Great value for money and exceptional service. I will definitely be booking with them again.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 10,
    name: "Buddhika Janadari",
    location: "Ratnapura, Sri Lanka",
    text: "A magical trip from start to finish. Highly professional and friendly staff.",
    image: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?auto=format&fit=crop&q=80&w=400"
  },
];

// --- Animation Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// Specific Hero Animation Variants
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } 
  },
};

// --- Helper Components ---

const LiveBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      {/* Modern Gradient Ambient Light */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          x: [0, 100, 0], 
          y: [0, 50, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1], 
          x: [0, -50, 0], 
          y: [0, -50, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[140px]"
      />
      <motion.div 
        animate={{ 
            scale: [1, 1.1, 1],
            y: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
         className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] bg-teal-400/5 rounded-full blur-[100px]"
      />
    </div>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="text-center mb-16">
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold tracking-wider uppercase text-xs mb-4"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-4xl md:text-6xl font-bold text-white tracking-tight"
    >
      {title}
    </motion.h2>
  </div>
);

// --- Pages & Sections ---

// 1. Hero Section (Home)
const Hero = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const [index, setIndex] = useState(0);
  const images = [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2400",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2400",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2400"
  ];

  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div 
             key={index}
             initial={{ opacity: 0, scale: 1.1 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1.5, ease: "easeInOut" }}
             className="absolute inset-0 w-full h-full"
          >
            <img 
              src={images[index]} 
              alt="Travel Hero"
              className="w-full h-full object-cover opacity-90"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gray-950/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950 z-10" />
      </div>

       {/* Slider Navigation */}
       <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 z-30 flex justify-between px-4 md:px-12 pointer-events-none">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all pointer-events-auto group"
        >
          <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all pointer-events-auto group"
        >
          <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-12 right-12 z-30 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-16 h-1 rounded-full transition-all duration-300 ${
              index === i ? "bg-emerald-400 w-24" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-20 text-center text-white">
        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={heroItemVariants} className="mb-6 flex justify-center">
            <span className="inline-block py-2 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold tracking-wide uppercase shadow-lg">
              ✨ Explore the World with Us
            </span>
          </motion.div>
          
          <motion.h1 variants={heroItemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 tracking-tight drop-shadow-2xl">
            Discover Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 bg-300% animate-gradient">
              Great Adventure
            </span>
          </motion.h1>
          
          <motion.p variants={heroItemVariants} className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Experience premium travel curated by experts. From the Swiss Alps to the beaches of Bali, we make your dream vacation a reality.
          </motion.p>
          
          <motion.div variants={heroItemVariants} className="flex flex-col md:flex-row gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('tours')}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group border border-emerald-400/50"
            >
              Explore Tours <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-bold transition-all shadow-lg"
            >
              Plan Custom Trip
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// 2. Features Grid (Home - Remade with Numeric Watermark)
const Features = () => (
  <section className="py-24 relative overflow-hidden">
    {/* Decorative background elements for this section */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/0 via-emerald-900/5 to-gray-900/0 pointer-events-none" />

    <div className="container mx-auto px-6 relative z-10">
      <SectionTitle title="Why Choose Us" subtitle="The LuxeTravel Standard" />
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Globe, title: "Global Access", desc: "Unlock exclusive access to private estates, closed museums, and VIP events worldwide.", delay: 0 },
          { icon: Users, title: "Local Legends", desc: "Our guides aren't just experts; they are storytellers, historians, and local friends.", delay: 0.1 },
          { icon: Heart, title: "Hyper-Personal", desc: "Every itinerary is a bespoke masterpiece, tailored specifically to your tastes and dreams.", delay: 0.2 },
          { icon: ShieldCheck, title: "Total Peace", desc: "From 24/7 concierge support to comprehensive insurance, we handle the worry.", delay: 0.3 }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, borderColor: 'rgba(16, 185, 129, 0.4)' }}
            transition={{ delay: feature.delay, duration: 0.4 }}
            className="group relative bg-gray-900/40 border border-white/5 p-8 rounded-3xl hover:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm overflow-hidden cursor-default shadow-lg hover:shadow-emerald-500/10"
          >
            {/* Hover Gradient Bloom */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Number Watermark */}
            <div className="absolute -right-4 -top-4 text-9xl font-bold text-white/5 select-none group-hover:text-emerald-500/10 transition-colors duration-500 font-serif">
              0{idx + 1}
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 shadow-lg group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:text-emerald-300 transition-all duration-300">
                <feature.icon size={32} strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors">
                {feature.desc}
              </p>
            </div>
            
            {/* Bottom highlight line */}
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-emerald-500 group-hover:w-full transition-all duration-700 ease-out" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// 3. Destinations Page (Expanded with Sub-Gallery & Dense Grid)
const Destinations = () => {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<DestinationImage | null>(null);

  // Helper for bento grid pattern
  const getGridClass = (index: number) => {
    const patterns = [
      "md:col-span-2 md:row-span-2", 
      "md:col-span-1 md:row-span-1", 
      "md:col-span-1 md:row-span-2", 
      "md:col-span-2 md:row-span-1", 
      "md:col-span-1 md:row-span-1", 
      "md:col-span-1 md:row-span-1", 
      "md:col-span-1 md:row-span-2", 
      "md:col-span-2 md:row-span-1", 
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        
        {/* Main View: List of Continents */}
        <AnimatePresence mode="wait">
          {!selectedContinent ? (
            <motion.div 
              key="continents"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SectionTitle title="Popular Destinations" subtitle="Where do you want to go?" />
              <div className="grid md:grid-cols-2 gap-8">
                {DESTINATIONS.map((dest) => (
                  <motion.div 
                    key={dest.id}
                    layoutId={`continent-${dest.name}`}
                    onClick={() => setSelectedContinent(dest.name)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative h-80 rounded-3xl overflow-hidden cursor-pointer group shadow-lg border border-gray-800"
                  >
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-8">
                      <h3 className="text-4xl font-bold text-white mb-2">{dest.name}</h3>
                      <p className="text-emerald-400 font-medium flex items-center gap-2">
                        <MapPin size={16} /> {dest.count}
                      </p>
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 text-gray-300 text-sm">
                        Click to explore amazing places in {dest.name} <ArrowRight size={14} className="inline ml-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Detailed View: Continent Gallery */
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setSelectedContinent(null)}
                  className="p-2 bg-gray-800 rounded-full hover:bg-emerald-600 hover:text-white text-gray-400 transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                   <h2 className="text-3xl font-bold text-white">Exploring {selectedContinent}</h2>
                   <p className="text-emerald-400 text-sm">Top rated locations selected for you</p>
                </div>
              </div>

              {/* Added grid-flow-dense to fill gaps */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 grid-flow-dense">
                {DESTINATION_GALLERY[selectedContinent]?.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`relative rounded-xl overflow-hidden cursor-pointer group ${getGridClass(idx)}`}
                    onClick={() => setSelectedImage(item)}
                  >
                    <img 
                      src={item.src} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                      <p className="text-white font-bold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</p>
                      <p className="text-emerald-300 text-xs flex items-center gap-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                         <MapPin size={10} /> {item.location}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox for Destination Images */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <button className="absolute top-8 right-8 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={32} />
              </button>
              <div className="max-w-4xl w-full">
                <motion.img 
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  src={selectedImage.src} 
                  className="w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-gray-700 mb-4" 
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">{selectedImage.title}</h3>
                  <p className="text-emerald-400 flex items-center justify-center gap-2 mt-2">
                    <MapPin size={16} /> {selectedImage.location}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 4. Tours Page
const Tours = ({ onBook }: { onBook: (tour: Tour) => void }) => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Adventure', 'Relaxation', 'Cultural'];

  const filteredTours = filter === 'All' ? TOURS : TOURS.filter(t => t.category === filter);

  return (
    <div className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <SectionTitle title="Exclusive Packages" subtitle="Curated for Perfection" />

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredTours.map((tour) => (
              <motion.div
                layout
                key={tour.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 border border-gray-700/50 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" /> {tour.rating}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{tour.title}</h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1"><MapPin size={14} /> {tour.location}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock size={16} className="text-emerald-500" /> {tour.days} Days
                    </div>
                    <div className="text-xl font-bold text-emerald-400">${tour.price}</div>
                  </div>
                  <button 
                    onClick={() => onBook(tour)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg shadow-emerald-500/25"
                  >
                    Book Now <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};



// 6. About Page (Remade Card Section as requested)
const About = () => {
  // We use a key to force re-render/re-animation of the stats container
  const [statsKey, setStatsKey] = useState(0);

  const handleImageClick = () => {
    setStatsKey(prev => prev + 1);
  };

  const STATS = [
    { num: "10k+", label: "Happy Travelers", icon: Users },
    { num: "50+", label: "Destinations", icon: MapPin },
    { num: "150+", label: "Partners", icon: Globe },
    { num: "15+", label: "Awards Won", icon: Award },
    { num: "98%", label: "Satisfaction Rate", icon: Heart },
    { num: "24/7", label: "Expert Support", icon: Phone },
    { num: "100%", label: "Tailor Made", icon: CheckCircle },
    { num: "0", label: "Hidden Fees", icon: ShieldCheck },
  ];

  return (
    <div className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        
        {/* Editorial Layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-4 block">Our Story</span>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Crafting Journeys, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  Not Just Trips.
                </span>
              </h2>
              <div className="space-y-6 text-lg text-gray-400 leading-relaxed font-light">
                <p>
                  Since 2015, LuxeTravel has redefined the art of exploration. We believe that true luxury lies in the exclusivity of experience and the seamlessness of service.
                </p>
                <p>
                  From private island retreats to charted expeditions in Antarctica, our dedicated team of global experts ensures that every moment of your journey is curated to perfection.
                </p>
              </div>

              {/* Glass Stats Cards (Updated Grid & Hover Animation) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                {STATS.map((stat, idx) => (
                  <motion.div 
                    key={`${statsKey}-${idx}`} // Re-animate when key changes
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: { delay: idx * 0.1, type: "spring", stiffness: 100 }
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      boxShadow: "0px 10px 30px -10px rgba(16, 185, 129, 0.3)",
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      borderColor: "rgba(16, 185, 129, 0.5)",
                      transition: { duration: 0.05, ease: "easeOut" } // Instant hover
                    }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/5 p-4 rounded-2xl backdrop-blur-md cursor-pointer transition-colors group flex flex-col items-center text-center justify-center h-32"
                  >
                    <div className="mb-2 p-2 rounded-full bg-white/5 group-hover:bg-emerald-500/20 transition-colors">
                      <stat.icon size={20} className="text-emerald-500 group-hover:text-emerald-300" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{stat.num}</h4>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wide group-hover:text-white transition-colors">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Image Collage (Clickable) */}
          <div className="order-1 lg:order-2 relative h-[600px] perspective-1000">
            
            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0, y: 50, rotateY: 5 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-0 right-0 w-4/5 h-[85%] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 z-10"
            >
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800" 
                alt="Travel" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent pointer-events-none" />
            </motion.div>

            {/* Floating Secondary Image (The Trigger) */}
            <motion.div 
              initial={{ opacity: 0, y: 100, x: -50 }}
              whileInView={{ opacity: 1, y: 60, x: 0 }}
              whileHover={{ scale: 1.05, zIndex: 30 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImageClick}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute bottom-0 left-0 w-3/5 h-[50%] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-950 z-20 cursor-pointer group"
            >
              <img 
                src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=800" 
                alt="Adventure" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Click Indication */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform mb-2">
                  <Play className="text-white ml-1" fill="white" size={24} />
                </div>
                <span className="text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  Click to Animate
                </span>
              </div>
            </motion.div>

            {/* Decorative Circle */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-40 z-0" />
          </div>

        </div>
      </div>
    </div>
  );
};

// 7. Testimonials (Marquee)
const Testimonials = () => (
  <section className="py-24 relative overflow-hidden bg-gray-900/20 backdrop-blur-sm">
    <div className="container mx-auto px-6 mb-12 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">The Trip of a Lifetime</h2>
      <p className="text-gray-400">Hear from our community of happy travelers</p>
    </div>

    {/* Marquee Track */}
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-950 to-transparent z-10" />
      
      <motion.div 
        className="flex gap-6 w-max"
        animate={{ x: ["0%", "-50%"] }} // Changed to move Right to Left
        transition={{ 
          duration: 40, 
          ease: "linear", 
          repeat: Infinity 
        }}
      >
        {/* Duplicating the array to ensure seamless looping */}
        {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, idx) => (
          <div 
            key={`${testimonial.id}-${idx}`}
            className="w-[300px] md:w-[350px] bg-gray-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-shrink-0 shadow-lg hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            
            <p className="text-gray-300 text-sm italic mb-6 leading-relaxed">
              "{testimonial.text}"
            </p>
            
            <div className="flex items-center gap-3">
              <img 
                src={testimonial.image} 
                alt={testimonial.name} 
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/50" 
              />
              <div>
                <h4 className="text-white font-bold text-sm">{testimonial.name}</h4>
                <p className="text-emerald-400 text-xs">{testimonial.location}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// 8. Contact Page
const Contact = () => {
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email || !contactForm.message) {
        alert("Please fill in all fields");
        return;
    }

    setStatus('sending');
    try {
      await addDoc(collection(db, "contacts"), {
        ...contactForm,
        createdAt: serverTimestamp(),
        read: false
      });
      setStatus('success');
      setContactForm({ firstName: '', lastName: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
  <div className="py-24 relative z-10">
    <div className="container mx-auto px-6">
      <SectionTitle title="Get in Touch" subtitle="Start Your Journey" />
      
      <div className="grid lg:grid-cols-2 gap-12 bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-700">
        <div className="p-10 bg-emerald-600/90 text-white">
          <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
          <p className="text-emerald-100 mb-8">Ready to book your dream vacation? Our team is available 24/7 to answer your questions.</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-emerald-200 text-sm">Our Location</p>
                <p className="font-semibold">123 Travel Avenue, Colombo, Sri Lanka</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-emerald-200 text-sm">Email Address</p>
                <p className="font-semibold">hello@luxetravel.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-emerald-200 text-sm">Phone Number</p>
                <p className="font-semibold">+94 77 123 4567</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-transparent">
          <form className="space-y-6" onSubmit={handleContactSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                <input 
                  type="text" 
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                  placeholder="John" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                <input 
                  type="text" 
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                  placeholder="Doe" 
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input 
                type="email" 
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                placeholder="john@example.com" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea 
                rows={4} 
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                placeholder="Tell us about your dream trip..."
                required
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              className={`w-full py-4 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                status === 'success' 
                  ? 'bg-green-500 text-white cursor-default'
                  : status === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
              }`}
            >
              {status === 'sending' ? (
                <Loader2 className="animate-spin" />
              ) : status === 'success' ? (
                <>
                  <CheckCircle size={20} /> Message Sent Successfully!
                </>
              ) : status === 'error' ? (
                <>
                  <AlertCircle size={20} /> Failed to Send
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
};

// 9. NEW Booking Page
const BookingPage = ({ tour, onBack }: { tour: Tour | null, onBack: () => void }) => {
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: ''
  });

  if (!tour) return null;

  const total = tour.price * guests;
  const handleConfirmBooking = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.date || !formData.phone) {
        alert("Please fill in all fields");
        return;
      }

      setStatus('sending');
      await addDoc(collection(db, "bookings"), {
        tourName: tour.title,
        location: tour.location,
        pricePerPerson: tour.price,
        guests: guests,
        totalAmount: total,
        status: "pending",
        createdAt: serverTimestamp(),
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        date: formData.date
      });

      setStatus('success');
      setTimeout(() => {
        onBack();
      }, 2000); 
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };


  return (
    <motion.div 
      variants={pageVariants} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="pt-24 pb-20 min-h-screen relative z-10 bg-gray-950"
    >
      <div className="container mx-auto px-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Tours
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Tour Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-800 shadow-xl">
              <img src={tour.image} alt={tour.title} className="w-full h-48 object-cover rounded-xl mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">{tour.title}</h2>
              <div className="flex items-center gap-2 text-emerald-400 mb-4">
                <MapPin size={18} /> {tour.location}
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-800 text-gray-300">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-white">{tour.days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span className="font-semibold text-white">${tour.price}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-gray-800 text-emerald-400 font-bold">
                  <span>Total ({guests} guests):</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-4 backdrop-blur-sm">
              <ShieldCheck className="text-emerald-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="text-white font-bold text-sm">Secure Booking</h4>
                <p className="text-emerald-100/70 text-xs mt-1">Your booking is secure. We offer a 100% money-back guarantee for cancellations up to 48 hours before.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-6">Confirm Your Reservation</h2>
              
              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm">1</span>
                    Personal Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 pl-10">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-4 pt-6 border-t border-gray-800">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm">2</span>
                    Trip Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 pl-10">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Travel Date</label>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Number of Guests</label>
                      <div className="flex items-center gap-4 bg-gray-950 border border-gray-700 rounded-lg p-2">
                        <button 
                          type="button"
                          className="w-10 h-10 rounded-md bg-gray-800 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-white font-bold">{guests}</span>
                        <button 
                          type="button"
                          className="w-10 h-10 rounded-md bg-gray-800 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center"
                          onClick={() => setGuests(guests + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>



                <div className="pt-6">
                  <button
  type="button"
  disabled={status === 'sending' || status === 'success'}
  onClick={handleConfirmBooking}
  className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
    status === 'success' 
      ? 'bg-green-500 text-white cursor-default'
      : status === 'error'
      ? 'bg-red-500 text-white'
      : 'bg-emerald-600 text-white hover:bg-emerald-700'
  }`}
      >
        {status === 'sending' ? (
          <Loader2 className="animate-spin" />
        ) : status === 'success' ? (
          <>
            <CheckCircle size={24} /> Booking Confirmed!
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle size={24} /> Booking Failed
          </>
        ) : (
          "Confirm Booking"
        )}
      </button>

                  <p className="text-center text-gray-500 text-sm mt-4">By booking, you agree to our Terms & Conditions.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Layout Components ---

const Navbar = ({ 
  currentRoute, 
  onNavigate,
  onOpenProfile,
  userProfile
}: { 
  currentRoute: string, 
  onNavigate: (page: string) => void,
  onOpenProfile: () => void,
  userProfile: any
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Tours', id: 'tours' },
    { name: 'Destinations', id: 'destinations' },
    { name: 'Contact', id: 'contact' },
  ];


  if (currentRoute === 'booking') return null; // Hide Navbar on booking page for immersion

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-800 py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="text-2xl font-bold flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Globe size={24} />
          </div>
          <span className="text-white">LuxeTravel</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`text-sm font-medium transition-colors ${
                currentRoute === link.id 
                  ? 'text-emerald-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.name}
            </button>
          ))}
          
          <button
             onClick={onOpenProfile}
             className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all border border-gray-700 hover:border-emerald-500/50 overflow-hidden"
          >
             {userProfile?.profileImage ? (
               <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <User size={20} />
             )}
          </button>

          <button 
            onClick={() => onNavigate('tours')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              scrolled 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-white text-emerald-600 hover:bg-gray-100'
            }`}
          >
            Book Now
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gray-900 border-t border-gray-800 overflow-hidden absolute top-full left-0 w-full"
          >
            <div className="flex flex-col p-6 gap-6 h-full bg-gray-900">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => { 
                    setIsOpen(false);
                    // Small delay to allow menu to close visually before navigating
                    setTimeout(() => onNavigate(link.id), 100);
                  }}
                  className={`text-left text-xl font-bold py-2 border-b border-gray-800 ${currentRoute === link.id ? 'text-emerald-400' : 'text-gray-300'}`}
                >
                  {link.name}
                </button>
              ))}

              <button 
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile();
                }}
                 className="text-left text-xl font-bold py-2 border-b border-gray-800 text-gray-300 flex items-center gap-3 hover:text-emerald-400"
               >
                 {userProfile?.profileImage ? (
                   <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600">
                     <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                   </div>
                 ) : (
                    <User size={20} /> 
                 )}
                 My Profile
               </button>

               <button 
                onClick={() => { 
                  setIsOpen(false);
                  onNavigate('tours');
                }}
                className="w-full py-4 mt-4 bg-emerald-500 text-white font-bold rounded-xl"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = ({ onNavigate, visible }: { onNavigate: (page: string) => void, visible: boolean }) => {
  if (!visible) return null;
  return (
    <footer className="bg-gray-900/80 backdrop-blur-sm text-white pt-20 pb-10 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
                <Globe size={18} />
              </div>
              <span className="text-xl font-bold">LuxeTravel</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Curating premium travel experiences for the modern explorer. Adventure awaits.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer"><Facebook size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer"><Instagram size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer"><Twitter size={18} /></div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => onNavigate('about')}>About Us</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => onNavigate('tours')}>Tours & Packages</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => onNavigate('destinations')}>Destinations</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors" onClick={() => onNavigate('contact')}>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-emerald-500 cursor-pointer transition-colors">Customer Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to get the latest offers and travel tips.</p>
            <div className="relative">
              <input type="text" placeholder="Your email" className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 text-white" />
              <button className="absolute right-2 top-2 bg-emerald-500 p-1.5 rounded-md hover:bg-emerald-600 transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} LuxeTravel Agency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Main App Component ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [bookingTour, setBookingTour] = useState<Tour | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('luxe_user_profile');
    if (stored) {
      setUserProfile(JSON.parse(stored));
    }
  }, []);

  // Add scroll spy to update active state
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'about', 'destinations', 'tours', 'testimonials', 'contact'];
      // Offset logic: we want to trigger the active state when the section is near the middle/top
      const scrollPosition = window.scrollY + 150; 

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < top + height) {
            setCurrentPage(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // If we are currently in booking mode, we need to exit it first
    if (bookingTour) {
      setBookingTour(null);
    }
    
    // Use setTimeout to allow state updates (like menu closing) to process
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        // Calculate offset to account for fixed header
        // Header is roughly 80px-90px
        const headerOffset = 90;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
  
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 150);
  };

  const handleBook = (tour: Tour) => {
    setBookingTour(tour);
  };

  return (
    <div className="min-h-screen font-sans text-gray-100 selection:bg-emerald-500 selection:text-white relative">
      <LiveBackground />
      
      {/* Conditionally hide Navbar on booking page to maintain focus */}
      {!bookingTour && (
        <Navbar 
          onNavigate={scrollToSection} 
          currentRoute={currentPage} 
          onOpenProfile={() => setIsProfileOpen(true)}
          userProfile={userProfile}
        />
      )}
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onUpdate={setUserProfile}
        userProfile={userProfile}
        onLogout={() => {
          localStorage.removeItem('luxe_user_profile');
          setUserProfile(null);
          setIsProfileOpen(false);
        }}
      />

      <AnimatePresence mode="wait">
        {bookingTour ? (
          <BookingPage 
            key="booking" 
            tour={bookingTour} 
            onBack={() => scrollToSection('tours')} 
          />
        ) : (
          <motion.main 
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            {/* We are simulating a one-page feel but keeping component separation */}
            <div id="home"><Hero onNavigate={scrollToSection} /></div>
            <div id="features"><Features /></div>
            <div id="about"><About /></div>
            <div id="destinations"><Destinations /></div>
            <div id="tours"><Tours onBook={handleBook} /></div>
            <div id="testimonials"><Testimonials /></div>
            <div id="contact"><Contact /></div>
          </motion.main>
        )}
      </AnimatePresence>

      {!bookingTour && <Footer onNavigate={scrollToSection} visible={true} />}
    </div>
  );
}
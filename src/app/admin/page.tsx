'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Sparkles, LayoutDashboard, Settings, LogOut, Map, Calendar, Users, Briefcase, MapPin, Lock, MessageSquare, CheckCircle, XCircle, Search, X, Image as ImageIcon, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  
  // Data State
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('select');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  
  // New Profile Fields
  const [occupation, setOccupation] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('luxe_user_profile');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserProfile(parsed);
      setName(parsed.name || '');
      setEmail(parsed.email || '');
      setAddress(parsed.address || '');
      setGender(parsed.gender || 'select');
      setPassword(parsed.password || '');
      setProfileImage(parsed.profileImage || '');
      setCoverPhoto(parsed.coverPhoto || '');
      setOccupation(parsed.occupation || '');
      setDob(parsed.dob || '');
      setBio(parsed.bio || '');
    }
    
    // Check if previously logged in
    const isLoggedIn = localStorage.getItem('luxe_admin_auth');
    if (isLoggedIn === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
        if (activeTab === 'bookings' || activeTab === 'dashboard') {
            const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const bookingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(bookingsData);
        }
        
        if (activeTab === 'messages' || activeTab === 'dashboard') {
            const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const contactsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setContacts(contactsData);
        }

        if (activeTab === 'users' || activeTab === 'dashboard') {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
    setIsDataLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'admin@gmail.com' && loginPassword === 'admin@123') {
        setIsAuthenticated(true);
        localStorage.setItem('luxe_admin_auth', 'true');
        setLoginError('');
    } else {
        setLoginError('Invalid credentials');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedProfile = { 
        ...(userProfile || {}), 
        name, 
        email,
        address,
        gender,
        password,
        profileImage,
        coverPhoto,
        occupation,
        dob,
        bio
    };

    try {
        localStorage.setItem('luxe_user_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        alert('Profile saved successfully!');
        setIsEditingProfile(false);
    } catch (error) {
        console.error("Storage error:", error);
        alert('Failed to save profile. Storage quota might be exceeded (image too large?).');
    }
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        alert("Image file is too large. Please choose an image smaller than 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
            setProfileImage(reader.result as string);
        } else {
            setCoverPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if(confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('luxe_user_profile');
        localStorage.removeItem('luxe_admin_auth');
        setIsAuthenticated(false);
        // window.location.href = '/'; // Stay on admin page to show login
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {activeTab === id && (
        <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
      )}
    </button>
  );

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Sparkles size={24} className="text-white" />
                    </div>
                    <span className="font-bold text-2xl text-white tracking-tight">Luxe<span className="text-emerald-400">Admin</span></span>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type="email" 
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 pl-10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="admin@gmail.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 pl-10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="admin@123"
                                required
                            />
                        </div>
                    </div>

                    {loginError && (
                        <p className="text-red-400 text-sm text-center">{loginError}</p>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 p-6 flex flex-col gap-6 fixed h-full bg-gray-950 z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Luxe<span className="text-emerald-400">Admin</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="users" icon={Users} label="Users" />
          <SidebarItem id="bookings" icon={Calendar} label="Bookings" />
          <SidebarItem id="messages" icon={MessageSquare} label="Messages" />
          <SidebarItem id="tours" icon={Map} label="Tours" />
          <div className="my-4 h-px bg-gray-800" />
          <SidebarItem id="profile" icon={Settings} label="Settings" />
        </nav>

        <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence>
            {viewingImage && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setViewingImage(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
                >
                    {viewingImage === profileImage ? (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="h-48 md:h-60 bg-gray-800 relative">
                                {coverPhoto ? (
                                    <img src={coverPhoto} className="w-full h-full object-cover" alt="Cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700" />
                                )}
                                <button 
                                    onClick={() => setViewingImage(null)} 
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                >
                                    <X size={20}/>
                                </button>
                            </div>
                            <div className="px-8 pb-8 relative">
                                <div className="-mt-16 mb-4 inline-block relative">
                                    <div className="p-1.5 bg-gray-900 rounded-full">
                                        <img src={profileImage} className="w-32 h-32 rounded-full object-cover" alt="Profile" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-white">{name || 'Admin User'}</h2>
                                <p className="text-gray-400 mt-1">{email}</p>
                                <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                                    <MapPin size={14} /> {address || 'No location set'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
                        >
                             <img src={viewingImage} alt="Full Screen" className="max-w-full max-h-[90vh] object-contain" />
                             <button 
                                onClick={(e) => { e.stopPropagation(); setViewingImage(null); }}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                             >
                                <X size={24} />
                             </button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {activeTab === 'profile' ? 'Account Settings' : 
               activeTab === 'dashboard' ? 'Overview' : 
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-gray-400 mt-1">Manage your {activeTab === 'profile' ? 'personal details' : 'platform data'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
               {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={20} />
                  </div>
               )}
            </div>
          </div>
        </header>

        {activeTab === 'profile' ? (
          <div className="max-w-5xl mx-auto space-y-6">
             {/* Facebook Style Header */}
             <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Cover Photo */}
                <div className="h-64 md:h-80 bg-gray-800 relative group w-full">
                    {coverPhoto ? (
                        <img 
                            src={coverPhoto} 
                            alt="Cover" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setViewingImage(coverPhoto)} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-700">
                           <span className="text-gray-500 font-medium flex items-center gap-2">
                             <ImageIcon size={20} /> Add Cover Photo
                           </span>
                        </div>
                    )}
                    {isEditingProfile && (
                        <label className="absolute bottom-4 right-4 bg-white/10 hover:bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-all border border-white/20">
                            <Camera size={18} />
                            <span className="text-sm font-medium">Edit Cover Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
                        </label>
                    )}
                </div>

                {/* Profile Bar */}
                <div className="px-8 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6 -mt-12 md:-mt-16 mb-4">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div 
                                onClick={() => profileImage && setViewingImage(profileImage)}
                                className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-900 overflow-hidden bg-gray-800 ring-2 ring-gray-700 ${profileImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                            >
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                            {isEditingProfile && (
                                <label className="absolute bottom-2 right-2 bg-gray-900 text-white p-2 rounded-full cursor-pointer shadow-lg border border-gray-700 hover:bg-emerald-500 transition-colors">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                                </label>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 mt-4 md:mt-12 md:mb-2">
                            <h2 className="text-3xl font-bold text-white mb-1">{name || 'Admin User'}</h2>
                            <p className="text-gray-400 font-medium">{address || 'Location not set'} • {email || 'No email'}</p>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 md:mt-12 md:mb-2 flex gap-3">
                            <button 
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                    isEditingProfile 
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                }`}
                            >
                                <Edit3 size={18} />
                                {isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
             
             {isEditingProfile && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="w-full max-w-[400px] bg-white rounded-[32px] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-y-auto">
                     
                     {/* Header Background (Dark/Cover) */}
                     <div className="h-32 bg-gray-900 relative">
                        <div className="absolute top-6 left-6 flex items-center justify-between w-[calc(100%-3rem)] z-10">
                            <h3 className="text-xl font-bold text-white">Edit profile</h3>
                            <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        {coverPhoto && <img src={coverPhoto} className="w-full h-full object-cover opacity-60" />}
                     </div>
                     
                     {/* Content Container - pulling up to overlap */}
                     <div className="px-6 pb-8 -mt-14 relative z-10">
                        {/* Avatar */}
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full border-[4px] border-white shadow-xl overflow-hidden bg-white">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-gray-700 text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-gray-800 transition-colors border border-white">
                                    <Edit3 size={12} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                                </label>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                             
                             <div className="space-y-1.5">
                               <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide ml-1">Full name</label>
                               <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-300 font-medium text-sm"
                                    placeholder="Laura Smith"
                               />
                             </div>

                             <div className="space-y-1.5">
                               <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide ml-1">Date of birth</label>
                               <div className="relative">
                                   <input 
                                        type="date" 
                                        value={dob} 
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-300 font-medium text-sm pr-10"
                                   />
                                   <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                               </div>
                             </div>

                             <div className="space-y-1.5">
                               <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide ml-1">Occupation</label>
                               <input 
                                    type="text" 
                                    value={occupation} 
                                    onChange={(e) => setOccupation(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-300 font-medium text-sm"
                                    placeholder="Graphic designer"
                               />
                             </div>
                             
                             {/* Gender - Side by side cards */}
                             <div className="space-y-1.5">
                                <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide ml-1">Gender</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button" 
                                        onClick={() => setGender('female')}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${gender === 'female' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200 text-gray-500 bg-white'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gender === 'female' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                            {gender === 'female' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <span className="font-medium text-sm">Female</span>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => setGender('male')}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${gender === 'male' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200 text-gray-500 bg-white'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gender === 'male' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                                            {gender === 'male' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <span className="font-medium text-sm">Male</span>
                                    </button>
                                </div>
                             </div>

                             <div className="space-y-1.5">
                               <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide ml-1">Bio</label>
                               <textarea 
                                    value={bio} 
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-300 font-medium text-sm resize-none"
                                    placeholder="Hi, I'm..."
                                />
                             </div>

                             <div className="pt-2 space-y-3">
                                <button
                                  type="submit"
                                  disabled={isLoading}
                                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 text-sm"
                                >
                                  {isLoading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  className="w-full py-3.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98] text-sm"
                                >
                                  Change password
                                </button>
                             </div>
                        </form>
                     </div>
                  </div>
                </div>
             )}
          </div>
        ) : activeTab === 'users' ? (
             <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="text-emerald-400" size={24} />
                        Registered Users
                    </h2>
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                        {users.length} Users
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {isDataLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.name || 'Unnamed User'}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{user.gender || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-300">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-gray-300">
                                               <MapPin size={14} className="text-gray-500" />
                                               {user.address || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                        </td>
                                        <td className="p-4">
                                            <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                                <Settings size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        ) : activeTab === 'bookings' ? (
             <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Tour</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Guests</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {isDataLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading bookings...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No bookings found.</td></tr>
                            ) : (
                                bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{booking.customerName}</div>
                                            <div className="text-sm text-gray-500">{booking.email}</div>
                                        </td>
                                        <td className="p-4 text-emerald-400 font-medium">{booking.tourName}</td>
                                        <td className="p-4 text-gray-300">{booking.date}</td>
                                        <td className="p-4 text-gray-300">{booking.guests}</td>
                                        <td className="p-4 text-white font-bold">${booking.totalAmount}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        ) : activeTab === 'messages' ? (
             <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                             {isDataLoading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading messages...</td></tr>
                            ) : contacts.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No messages found.</td></tr>
                            ) : (
                                contacts.map(contact => (
                                    <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{contact.firstName} {contact.lastName}</td>
                                        <td className="p-4 text-gray-400">{contact.email}</td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {contact.createdAt?.seconds ? new Date(contact.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-300 max-w-xs">{contact.message}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        ) : activeTab === 'dashboard' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                             <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                                <Users size={24} />
                             </div>
                             <div>
                                <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
                                <h3 className="text-2xl font-bold text-white">{bookings.length}</h3>
                             </div>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                           <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                             <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                                <Briefcase size={24} />
                             </div>
                             <div>
                                <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                                <h3 className="text-2xl font-bold text-white">
                                    ${bookings.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0).toLocaleString()}
                                </h3>
                             </div>
                        </div>
                         <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                           <div className="bg-blue-500 h-1 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                             <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
                                <MessageSquare size={24} />
                             </div>
                             <div>
                                <p className="text-gray-400 text-sm font-medium">Messages</p>
                                <h3 className="text-2xl font-bold text-white">{contacts.length}</h3>
                             </div>
                        </div>
                         <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                           <div className="bg-purple-500 h-1 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                             <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl">
                                <Sparkles size={24} />
                             </div>
                             <div>
                                <p className="text-gray-400 text-sm font-medium">Pending</p>
                                <h3 className="text-2xl font-bold text-white">
                                    {bookings.filter(b => b.status === 'pending').length}
                                </h3>
                             </div>
                        </div>
                         <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                           <div className="bg-orange-500 h-1 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Bookings */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Recent Bookings</h3>
                            <button onClick={() => setActiveTab('bookings')} className="text-emerald-400 text-sm hover:underline">View All</button>
                        </div>
                        <div className="space-y-4 flex-1">
                            {bookings.slice(0, 3).map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                                            {booking.customerName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{booking.customerName}</p>
                                            <p className="text-xs text-gray-500">{booking.tourName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold">${booking.totalAmount}</p>
                                        <p className="text-xs text-gray-500">{booking.date}</p>
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && <p className="text-gray-500 text-center py-4">No recent bookings</p>}
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Recent Inquiries</h3>
                            <button onClick={() => setActiveTab('messages')} className="text-emerald-400 text-sm hover:underline">View All</button>
                        </div>
                        <div className="space-y-4 flex-1">
                            {contacts.slice(0, 3).map((contact) => (
                                <div key={contact.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-white">{contact.firstName} {contact.lastName}</h4>
                                        <span className="text-xs text-gray-500">
                                            {contact.createdAt?.seconds ? new Date(contact.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2">{contact.message}</p>
                                </div>
                            ))}
                             {contacts.length === 0 && <p className="text-gray-500 text-center py-4">No recent messages</p>}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-gray-900/30 rounded-3xl border border-gray-800 border-dashed">
             <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
               {activeTab === 'dashboard' && <LayoutDashboard size={32} />}
               {activeTab === 'tours' && <Map size={32} />}
               {activeTab === 'users' && <Users size={32} />}
             </div>
             <p className="text-lg font-medium">Coming Soon</p>
             <p className="text-sm">This section is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}

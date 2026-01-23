'use client';

import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  CalendarCheck, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Loader2,
  Database,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Mail,
  Users
} from 'lucide-react';

// --- Types ---
interface Tour {
  id?: string;
  title: string;
  location: string;
  price: number;
  days: number;
  image: string;
  category: string;
  rating: number;
}

interface Booking {
  id?: string;
  tourName: string;
  customerName: string;
  email: string;
  phone: string;
  date: any; // Firestore timestamp
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface ContactMessage {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: any;
  read: boolean;
}

// --- Hardcoded Data for Seeding (From your original page.tsx) ---
const INITIAL_TOURS = [
  { id: 1, title: "Santorini Sunset Retreat", location: "Santorini, Greece", price: 2499, days: 7, image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2938&auto=format&fit=crop", category: "Relaxation", rating: 4.9 },
  { id: 2, title: "Kyoto Cherry Blossom", location: "Kyoto, Japan", price: 3299, days: 10, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2940&auto=format&fit=crop", category: "Cultural", rating: 5.0 },
  { id: 3, title: "Machu Picchu Explorer", location: "Cusco, Peru", price: 1899, days: 6, image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2946&auto=format&fit=crop", category: "Adventure", rating: 4.8 },
  { id: 4, title: "Safari in Serengeti", location: "Serengeti, Tanzania", price: 4199, days: 8, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2936&auto=format&fit=crop", category: "Wildlife", rating: 4.9 },
  { id: 5, title: "Amalfi Coast Yacht", location: "Amalfi, Italy", price: 5499, days: 5, image: "https://images.unsplash.com/photo-1633321088355-d0f8c1eaad4b?q=80&w=2940&auto=format&fit=crop", category: "Luxury", rating: 5.0 },
  { id: 6, title: "Iceland Northern Lights", location: "Reykjavik, Iceland", price: 2199, days: 6, image: "https://images.unsplash.com/photo-1521330784804-4e0193bb2229?q=80&w=2940&auto=format&fit=crop", category: "Adventure", rating: 4.7 }
];

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tours' | 'bookings' | 'messages' | 'profiles'>('dashboard');
  
  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-950 text-white"><Loader2 className="animate-spin w-10 h-10" /></div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 text-white p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-10 flex items-center gap-2">
          <span className="text-orange-500">Luxe</span>Admin
        </h1>
        <nav className="space-y-4">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Map size={20} />} label="Manage Tours" active={activeTab === 'tours'} onClick={() => setActiveTab('tours')} />
          <SidebarItem icon={<CalendarCheck size={20} />} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
          <SidebarItem icon={<Users size={20} />} label="Profiles" active={activeTab === 'profiles'} onClick={() => setActiveTab('profiles')} />
          <SidebarItem icon={<MessageSquare size={20} />} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />        </nav>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-3 text-gray-400 hover:text-white mt-auto absolute bottom-8 w-full transition-colors"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 md:hidden">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
          <button onClick={() => signOut(auth)} className="text-red-500"><LogOut size={20} /></button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
          {activeTab === 'tours' && <ToursManager key="tours" />}
          {activeTab === 'bookings' && <BookingsManager key="bookings" />}
          {activeTab === 'profiles' && <ProfilesManager key="profiles" />}
          {activeTab === 'messages' && <MessagesManager key="messages" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Components ---

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  profileImage?: string;
  createdAt: any;
}

function ProfilesManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  useEffect(() => {
    const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Profile[];
      setProfiles(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">User Profiles</h2>
      
      <div className="grid gap-6">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xl">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{profile.email}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'N/A'}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Phone:</span> {profile.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Address:</span> {profile.address || 'N/A'}
              </div>
            </div>
            
            {profile.bio && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 italic">"{profile.bio}"</p>
              </div>
            )}
            
            <button 
              onClick={() => deleteDoc(doc(db, "profiles", profile.id))}
              className="mt-4 text-red-500 text-sm hover:underline flex items-center gap-1"
            >
              <Trash2 size={14} /> Delete Profile
            </button>
          </div>
        ))}

        {profiles.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500">No profiles found yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // List of authorized admin emails
  const ADMIN_EMAILS = [
    'admin@luxetravel.com',
    'sachinthakodagoda@gmail.com',
    'admin@gmail.com',
    // Add more admin emails here as needed
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if email is authorized
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setError('Unauthorized email. Admin access denied.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8">Sign in to manage LuxeTravel</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="admin@luxetravel.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const seedData = async () => {
    if (!confirm("This will add default tours to your database. Continue?")) return;
    setSeeding(true);
    try {
      const toursRef = collection(db, 'tours');
      // Using Promise.all to add all tours in parallel
      await Promise.all(INITIAL_TOURS.map(tour => {
        // Remove ID to let Firestore generate one, or use setDoc with specific ID
        const { id, ...tourData } = tour; 
        return addDoc(toursRef, tourData);
      }));
      setSeeded(true);
      setTimeout(() => setSeeded(false), 3000);
    } catch (error) {
      console.error("Error seeding:", error);
      alert("Error seeding data check console");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Tours" value="6" icon={<Map className="text-blue-500" />} />
        <StatCard title="Active Bookings" value="12" icon={<CalendarCheck className="text-green-500" />} />
        <StatCard title="Revenue" value="$42,500" icon={<span className="text-2xl text-orange-500 font-bold">$</span>} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 mt-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button 
            onClick={seedData}
            disabled={seeding}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg transition-colors"
          >
            {seeding ? <Loader2 className="animate-spin" /> : <Database size={18} />}
            {seeded ? "Data Added!" : "Seed Initial Data to Firebase"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Use "Seed Initial Data" if your Firestore is empty to upload the hardcoded tours from your website.
        </p>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

function ToursManager() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // Fetch Tours
  useEffect(() => {
    const fetchTours = async () => {
      const querySnapshot = await getDocs(collection(db, "tours"));
      const toursList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
      setTours(toursList);
    };
    fetchTours();
  }, [isFormOpen]); // Refresh when form closes

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteDoc(doc(db, "tours", id));
    setTours(tours.filter(t => t.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Tours</h2>
        <button 
          onClick={() => { setEditingTour(null); setIsFormOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Tour
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500">
            <tr>
              <th className="p-4">Tour Name</th>
              <th className="p-4">Location</th>
              <th className="p-4">Price</th>
              <th className="p-4">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tours.map(tour => (
              <tr key={tour.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 font-medium text-gray-800 dark:text-white">{tour.title}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">{tour.location}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">${tour.price}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <span className="text-yellow-500">★</span> {tour.rating}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingTour(tour); setIsFormOpen(true); }}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => tour.id && handleDelete(tour.id)}
                      className="p-2 hover:bg-red-100 text-red-500 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tours.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No tours found. Go to Dashboard to seed data or add one manually.
          </div>
        )}
      </div>

      {isFormOpen && (
        <TourForm 
          tour={editingTour} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </motion.div>
  );
}

function TourForm({ tour, onClose }: { tour: Tour | null, onClose: () => void }) {
  const [formData, setFormData] = useState<Partial<Tour>>(
    tour || { title: '', location: '', price: 0, days: 1, image: '', category: 'Adventure', rating: 5.0 }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tour?.id) {
        await updateDoc(doc(db, "tours", tour.id), formData);
      } else {
        await addDoc(collection(db, "tours"), formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving tour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {tour ? 'Edit Tour' : 'New Tour'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
            placeholder="Tour Title"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Location"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              required
            />
            <input 
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Category"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input 
              type="number"
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Price"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              required
            />
            <input 
              type="number"
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Days"
              value={formData.days}
              onChange={e => setFormData({...formData, days: Number(e.target.value)})}
              required
            />
             <input 
              type="number"
              step="0.1"
              max="5"
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Rating"
              value={formData.rating}
              onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
              required
            />
          </div>
          <input 
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
            placeholder="Image URL"
            value={formData.image}
            onChange={e => setFormData({...formData, image: e.target.value})}
          />
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Tour</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Real-time listener for bookings
    const q = query(collection(db, "bookings"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    await updateDoc(doc(db, "bookings", id), { status });
  };

  const clearAllBookings = async () => {
    if (!confirm("Are you sure you want to delete ALL bookings? This cannot be undone.")) return;
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      await Promise.all(querySnapshot.docs.map(d => deleteDoc(d.ref)));
      alert("Successfully deleted all records");
    } catch (error) {
      console.error("Error clearing bookings:", error);
      alert("Failed to clear bookings.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Bookings</h2>
        {bookings.length > 0 && (
          <button 
            onClick={clearAllBookings}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 size={18} /> Clear All
          </button>
        )}
      </div>
      
      <div className="grid gap-4">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{booking.tourName}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">{booking.customerName} • {booking.guests} Guests</p>
              <p className="text-gray-400 text-xs mt-1">{booking.email} • {booking.phone}</p>
            </div>
            
            <div className="flex gap-2">
              {booking.status === 'pending' && (
                <>
                  <button 
                    onClick={() => booking.id && updateStatus(booking.id, 'confirmed')}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    title="Confirm"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button 
                    onClick={() => booking.id && updateStatus(booking.id, 'cancelled')}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <button 
                  onClick={() => booking.id && updateStatus(booking.id, 'cancelled')}
                  className="text-red-500 text-sm underline"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        ))}
        
        {bookings.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No bookings yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    // Real-time listener for messages
    const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage)));
    });
    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "contacts", id), { read: !currentStatus });
  };
  
  const deleteMessage = async (id: string) => {
    if(!confirm("Are you sure you want to delete this message?")) return;
    await deleteDoc(doc(db, "contacts", id));
  }

  const clearAllMessages = async () => {
    if (!confirm("Are you sure you want to delete ALL messages? This cannot be undone.")) return;
    try {
      const querySnapshot = await getDocs(collection(db, "contacts"));
      await Promise.all(querySnapshot.docs.map(d => deleteDoc(d.ref)));
      alert("Successfully deleted all records");
    } catch (error) {
      console.error("Error clearing messages:", error);
      alert("Failed to clear messages.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Messages</h2>
        {messages.length > 0 && (
          <button 
            onClick={clearAllMessages}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 size={18} /> Clear All
          </button>
        )}
      </div>
      
      <div className="grid gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`bg-white dark:bg-gray-800 p-6 rounded-xl border ${msg.read ? 'border-gray-200 dark:border-gray-700 opacity-70' : 'border-emerald-500/50 shadow-sm'} flex flex-col gap-4 relative`}>
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.read ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{msg.firstName} {msg.lastName}</h3>
                    <p className="text-gray-500 text-sm">{msg.email}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => msg.id && markAsRead(msg.id, msg.read)}
                   className={`text-xs px-3 py-1 rounded-full border ${msg.read ? 'border-gray-300 text-gray-400' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-50'}`}
                 >
                   {msg.read ? 'Mark Unread' : 'Mark Read'}
                 </button>
                 <button
                   onClick={() => msg.id && deleteMessage(msg.id)}
                   className="text-gray-400 hover:text-red-500 p-1"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
              {msg.message}
            </div>
            
            <p className="text-xs text-gray-400 text-right">
              {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
            </p>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">No messages yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
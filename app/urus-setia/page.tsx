'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserX, Trash2, Search, Download, 
  ChevronLeft, Lock, LogIn, RefreshCcw, Filter, FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

interface RSVP {
  id: number;
  name: string;
  attendance: string;
  phone?: string;
  notes: string;
  guests: number;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Hadir' | 'Tidak Hadir'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const SECRET_PASSCODE = 'MUQRI2026';

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchRSVPs();
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === SECRET_PASSCODE) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      fetchRSVPs();
    } else {
      setError('Passcode salah. Sila cuba lagi.');
      setPasscode('');
    }
  };

  const fetchRSVPs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rsvp');
      if (res.ok) {
        const data = await res.json();
        setRsvps(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Adakah anda pasti mahu memadam data ini?')) return;
    
    try {
      const res = await fetch(`/api/rsvp?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRsvps(rsvps.filter(item => item.id !== id));
      } else {
        const errData = await res.json();
        alert('Gagal memadam: ' + (errData.message || 'Sila pastikan SQL Policy sudah dimasukkan di Supabase.'));
      }
    } catch (err) {
      alert('Gagal memadam data.');
    }
  };

  const filteredRSVPs = rsvps.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.phone && item.phone.includes(searchTerm));
    const matchesFilter = filter === 'All' || item.attendance === filter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredRSVPs.length / itemsPerPage);
  const paginatedRSVPs = filteredRSVPs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attendance === 'Hadir').reduce((acc, curr) => acc + (curr.guests || 1), 0),
    notAttending: rsvps.filter(r => r.attendance === 'Tidak Hadir').length,
    groups: rsvps.filter(r => r.attendance === 'Hadir').length
  };

  const exportToCSV = () => {
    const headers = ['Nama', 'Kehadiran', 'Telefon', 'Bil. Tetamu', 'Nota', 'Tarikh'];
    const rows = filteredRSVPs.map(r => [
      r.name,
      r.attendance,
      r.phone || '-',
      r.guests,
      r.notes.replace(/\n/g, ' '),
      new Date(r.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "senarai_tetamu_muqri_syamimi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-[#E8E2D8] text-center"
        >
          <div className="w-20 h-20 bg-[#F5F1E9] rounded-full flex items-center justify-center mx-auto mb-8 text-[#8C7355]">
            <Lock size={32} />
          </div>
          <h1 className="font-serif text-3xl mb-2 text-[#1A1A1A]">Admin Access</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-10">Urus Setia Muqri & Syamimi</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan Passcode"
                className="w-full px-6 py-5 bg-[#F9F7F4] border border-[#E8E2D8] rounded-2xl text-center font-bold tracking-[0.5em] focus:outline-none focus:border-[#D4AF37] transition-all"
              />
              {error && <p className="text-red-500 text-[10px] font-black uppercase mt-4 tracking-widest">{error}</p>}
            </div>
            <button type="submit" className="w-full py-5 bg-[#1A1A1A] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-[#8C7355] transition-all duration-500 shadow-xl">
              <LogIn size={18} /> Log Masuk
            </button>
          </form>
          
          <Link href="/" className="inline-flex items-center gap-2 mt-10 text-[10px] font-black uppercase tracking-widest text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">
            <ChevronLeft size={14} /> Kembali ke Jemputan
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] pb-20">
      <header className="bg-white border-b border-[#E8E2D8] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F5F1E9] rounded-full flex items-center justify-center text-[#8C7355]"><Users size={24} /></div>
            <div>
              <h2 className="font-serif text-xl text-[#1A1A1A]">Urus Setia</h2>
              <p className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]">Muqri & Syamimi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchRSVPs} className="p-3 text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors"><RefreshCcw size={20} /></button>
            <button 
              onClick={() => {
                localStorage.removeItem('admin_auth');
                setIsAuthenticated(false);
              }} 
              className="px-6 py-3 bg-[#F5F1E9] text-[#8C7355] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#E8E2D8] transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A] mb-2">Total RSVP</p>
            <p className="text-4xl font-serif text-[#1A1A1A]">{stats.total}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A] mb-2">Jumlah Tetamu</p>
            <p className="text-4xl font-serif text-[#D4AF37]">{stats.attending}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A] mb-2">Hadir (Kumpulan)</p>
            <p className="text-4xl font-serif text-[#8C7355]">{stats.groups}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A] mb-2">Tidak Hadir</p>
            <p className="text-4xl font-serif text-red-400">{stats.notAttending}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#7A7A7A]" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau telefon..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border border-[#E8E2D8] rounded-2xl focus:outline-none focus:border-[#D4AF37] shadow-sm"
            />
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <div className="flex bg-[#F5F1E9] p-1.5 rounded-xl border border-[#E8E2D8]">
              {(['All', 'Hadir', 'Tidak Hadir'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-[#D4AF37] shadow-sm' : 'text-[#7A7A7A]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={exportToCSV} className="flex-shrink-0 w-14 h-14 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center hover:bg-[#8C7355] transition-all shadow-lg">
              <FileSpreadsheet size={22} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-[3rem] border border-[#E8E2D8] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F5F1E9] bg-[#F9F7F4]/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8C7355]">Nama</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8C7355]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8C7355]">Telefon</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8C7355]">Tetamu</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8C7355]">Ucapan / Nota</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8C7355] text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F1E9]">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center text-[#7A7A7A] font-serif italic">Memuatkan data...</td></tr>
                ) : paginatedRSVPs.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center text-[#7A7A7A] font-serif italic">Tiada data dijumpai.</td></tr>
                ) : (
                  paginatedRSVPs.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F9F7F4]/30 transition-colors group">
                      <td className="px-8 py-6 font-serif text-[#1A1A1A]">{r.name}</td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.attendance === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.attendance === 'Hadir' ? <UserCheck size={12} /> : <UserX size={12} />} {r.attendance}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-[11px] font-mono text-[#7A7A7A]">{r.phone || '-'}</td>
                      <td className="px-8 py-6 text-sm font-bold text-[#8C7355]">{r.guests}</td>
                      <td className="px-8 py-6">
                        <p className="text-xs text-[#7A7A7A] italic font-serif max-w-xs truncate">{r.notes || '-'}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(r.id)}
                          className="p-3 text-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-8 py-6 bg-[#F9F7F4]/30 border-t border-[#F5F1E9] flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A]">
                Halaman {currentPage} daripada {totalPages} ({filteredRSVPs.length} tetamu)
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 rounded-lg border border-[#E8E2D8] text-[#8C7355] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-[10px] font-black transition-all ${currentPage === page ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-[#7A7A7A] hover:bg-white'}`}
                  >
                    {page}
                  </button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 rounded-lg border border-[#E8E2D8] text-[#8C7355] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all"
                >
                  <ChevronLeft size={18} className="rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { laporanAPI } from '../services/api';
import { Download, TrendingUp, FileSpreadsheet, Car } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Laporan() {
  const [stats, setStats] = useState(null);
  const [laporanBulanan, setLaporanBulanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bulananRes] = await Promise.all([laporanAPI.getDashboard(), laporanAPI.getBulanan({ tahun, bulan })]);
      setStats(statsRes.data); setLaporanBulanan(bulananRes.data);
    } catch (error) { toast.error('Gagal memuat data laporan'); }
    finally { setLoading(false); }
  };

  const fetchBulanan = async () => {
    try { const { data } = await laporanAPI.getBulanan({ tahun, bulan }); setLaporanBulanan(data); }
    catch (error) { toast.error('Gagal memuat laporan bulanan'); }
  };

  const exportCSV = () => {
    if (!laporanBulanan?.detailHarian) return;
    let csv = '\uFEFFTanggal,Total Kendaraan\n';
    laporanBulanan.detailHarian.forEach((d) => { csv += `${d.tanggal},${d.total}\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `laporan-parkir-${bulan}-${tahun}.csv`; a.click();
    window.URL.revokeObjectURL(url); toast.success('Laporan CSV diunduh');
  };

  const printReport = () => {
    if (!laporanBulanan) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Laporan Parkir UMSU</title>
      <style>body{font-family:sans-serif;padding:20px}h1,h2{text-align:center}
      table{width:100%;border-collapse:collapse;margin-top:15px}th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f0f0f0}.summary{display:flex;gap:15px;margin:15px 0;flex-wrap:wrap}
      .summary-item{background:#f8f8f8;padding:10px 20px;border-radius:8px;text-align:center;min-width:120px}
      .summary-item h3{margin:0;font-size:24px}.summary-item p{margin:5px 0 0;color:#666}</style>
      </head><body>
      <h1>LAPORAN PARKIR UMSU</h1><h2>Periode: ${laporanBulanan.periode}</h2>
      <div class="summary"><div class="summary-item"><h3>${laporanBulanan.totalTransaksi}</h3><p>Total Transaksi</p></div>
      <div class="summary-item"><h3>${laporanBulanan.motor}</h3><p>Motor</p></div>
      <div class="summary-item"><h3>${laporanBulanan.mobil}</h3><p>Mobil</p></div></div>
      <table><thead><tr><th>Tanggal</th><th>Total</th></tr></thead>
      <tbody>${laporanBulanan.detailHarian.map(d => `<tr><td>${new Date(d.tanggal).toLocaleDateString('id-ID')}</td><td>${d.total}</td></tr>`).join('')}</tbody></table>
      </body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => w.print(), 500);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Laporan</h1>
            <p className="page-subtitle">Rekap data parkir UMSU</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="btn-secondary btn-sm"><FileSpreadsheet className="h-4 w-4" /> Export CSV</button>
            <button onClick={printReport} className="btn-secondary btn-sm"><Download className="h-4 w-4" /> Cetak PDF</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">{stats?.totalKendaraan || 0}</p>
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm"><Car className="h-5 w-5 text-white" /></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Total Kendaraan</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">{stats?.parkirAktif || 0}</p>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm"><TrendingUp className="h-5 w-5 text-white" /></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Parkir Aktif</p>
        </div>

      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="font-semibold text-gray-900">Laporan Bulanan</h2>
          <div className="flex gap-2">
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="input-field w-32">
              {Array.from({ length: 12 }, (_, i) => (<option key={i+1} value={i+1}>{new Date(2024, i).toLocaleString('id', { month: 'long' })}</option>))}
            </select>
            <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="input-field w-24">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={fetchBulanan} className="btn-primary btn-sm">Tampilkan</button>
          </div>
        </div>

        {laporanBulanan && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl text-center"><p className="text-xl font-bold text-blue-700">{laporanBulanan.totalTransaksi}</p><p className="text-xs text-blue-400">Total Transaksi</p></div>
              <div className="p-3 bg-green-50 rounded-xl text-center"><p className="text-xl font-bold text-green-700">{laporanBulanan.selesai}</p><p className="text-xs text-green-400">Selesai</p></div>
              <div className="p-3 bg-purple-50 rounded-xl text-center"><p className="text-xl font-bold text-purple-700">{laporanBulanan.motor}</p><p className="text-xs text-purple-400">Motor</p></div>
              <div className="p-3 bg-orange-50 rounded-xl text-center"><p className="text-xl font-bold text-orange-700">{laporanBulanan.mobil}</p><p className="text-xs text-orange-400">Mobil</p></div>

            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="table-header">Tanggal</th>
                    <th className="table-header">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanBulanan.detailHarian?.map((d) => (
                    <tr key={d.tanggal} className="table-row">
                      <td className="table-cell">{new Date(d.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className="table-cell font-medium">{d.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

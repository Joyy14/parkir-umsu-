import { useState, useEffect } from 'react';
import { laporanAPI } from '../services/api';
import { FileText, Download, TrendingUp, Calendar, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Laporan() {
  const [stats, setStats] = useState(null);
  const [laporanBulanan, setLaporanBulanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bulananRes] = await Promise.all([
        laporanAPI.getDashboard(),
        laporanAPI.getBulanan({ tahun, bulan }),
      ]);
      setStats(statsRes.data);
      setLaporanBulanan(bulananRes.data);
    } catch (error) {
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulanan = async () => {
    try {
      const { data } = await laporanAPI.getBulanan({ tahun, bulan });
      setLaporanBulanan(data);
    } catch (error) {
      toast.error('Gagal memuat laporan bulanan');
    }
  };

  const exportCSV = () => {
    if (!laporanBulanan?.detailHarian) return;
    let csv = '\uFEFFTanggal,Total Kendaraan,Pendapatan\n';
    laporanBulanan.detailHarian.forEach((d) => {
      csv += `${d.tanggal},${d.total},${d.pendapatan}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-parkir-${bulan}-${tahun}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Laporan CSV diunduh');
  };

  const printReport = () => {
    if (!laporanBulanan) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head><title>Laporan Parkir UMSU</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h1, h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .summary { display: flex; gap: 15px; margin: 15px 0; }
        .summary-item { background: #f8f8f8; padding: 10px 20px; border-radius: 8px; text-align: center; }
        .summary-item h3 { margin: 0; font-size: 24px; }
        .summary-item p { margin: 5px 0 0; color: #666; }
      </style>
      </head>
      <body>
        <h1>LAPORAN PARKIR UMSU</h1>
        <h2>Periode: ${laporanBulanan.periode}</h2>
        <div class="summary">
          <div class="summary-item"><h3>${laporanBulanan.totalTransaksi}</h3><p>Total Transaksi</p></div>
          <div class="summary-item"><h3>Rp ${(laporanBulanan.totalPendapatan || 0).toLocaleString()}</h3><p>Total Pendapatan</p></div>
          <div class="summary-item"><h3>${laporanBulanan.motor}</h3><p>Motor</p></div>
          <div class="summary-item"><h3>${laporanBulanan.mobil}</h3><p>Mobil</p></div>
        </div>
        <table>
          <thead><tr><th>Tanggal</th><th>Total</th><th>Pendapatan</th></tr></thead>
          <tbody>
            ${laporanBulanan.detailHarian.map(d => `<tr><td>${new Date(d.tanggal).toLocaleDateString('id-ID')}</td><td>${d.total}</td><td>Rp ${d.pendapatan.toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 mt-1">Rekap data parkir</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button onClick={printReport} className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Kendaraan', value: stats?.totalKendaraan || 0, icon: FileText },
          { label: 'Parkir Aktif', value: stats?.parkirAktif || 0, icon: TrendingUp },
          { label: 'Pendapatan Hari Ini', value: `Rp ${(stats?.pendapatanHariIni || 0).toLocaleString()}`, icon: Calendar },
          { label: 'Pendapatan Bulan Ini', value: `Rp ${(stats?.pendapatanBulanIni || 0).toLocaleString()}`, icon: TrendingUp },
        ].map((item) => (
          <div key={item.label} className="card">
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Laporan Bulanan</h2>
          <div className="flex space-x-2">
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="input-field w-32">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('id', { month: 'long' })}</option>
              ))}
            </select>
            <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="input-field w-24">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={fetchBulanan} className="btn-primary">Tampilkan</button>
          </div>
        </div>

        {laporanBulanan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-700">{laporanBulanan.totalTransaksi}</p>
                <p className="text-xs text-blue-500">Total Transaksi</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xl font-bold text-green-700">{laporanBulanan.selesai}</p>
                <p className="text-xs text-green-500">Selesai</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-xl font-bold text-purple-700">{laporanBulanan.motor}</p>
                <p className="text-xs text-purple-500">Motor</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-xl font-bold text-orange-700">{laporanBulanan.mobil}</p>
                <p className="text-xs text-orange-500">Mobil</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-xl font-bold text-emerald-700">Rp {(laporanBulanan.totalPendapatan || 0).toLocaleString()}</p>
                <p className="text-xs text-emerald-500">Pendapatan</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-600">Tanggal</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-600">Total</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-600">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanBulanan.detailHarian?.map((d) => (
                    <tr key={d.tanggal} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900">{new Date(d.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{d.total}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">Rp {d.pendapatan.toLocaleString()}</td>
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

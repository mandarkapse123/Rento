"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Building, IndianRupee, Receipt, Wallet, ChartLine, Trash2, Plus, Image as ImageIcon, Download, X } from 'lucide-react'
import { addRent, addExpense, deleteRent, deleteExpense, clearAllData, addReceipt, deleteReceipt } from './actions'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

// Initialize Supabase Client for Storage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RentDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState({ rents: [], expenses: [], receipts: [] })
  const [isUploading, setIsUploading] = useState(false)
  const [modalImg, setModalImg] = useState<string | null>(null)

  // Form States
  const [rentForm, setRentForm] = useState({ date: '', amount: '', mode: 'Bank Transfer', notes: '' })
  const [expenseForm, setExpenseForm] = useState({ date: '', desc: '', amount: '', cat: 'Plumbing', paidBy: 'Self' })

  // Fetch data periodically (simulate real-time public ledger)
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/data')
      if (res.ok) setData(await res.json())
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculations
  const totalRent = data.rents.reduce((sum, r: any) => sum + r.amount, 0)
  const totalExpense = data.expenses.reduce((sum, e: any) => sum + e.amount, 0)
  const net = totalRent - totalExpense

  // Formatters
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
  const getMonthStr = (d: string) => new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

  // Handlers
  const handleAddRent = async () => {
    if (!rentForm.date || !rentForm.amount) return alert('Fill required fields')
    await addRent({ ...rentForm, amount: Number(rentForm.amount), period: getMonthStr(rentForm.date) })
    setRentForm({ date: '', amount: '', mode: 'Bank Transfer', notes: '' })
  }

  const handleAddExpense = async () => {
    if (!expenseForm.date || !expenseForm.amount || !expenseForm.desc) return alert('Fill required fields')
    await addExpense({ ...expenseForm, amount: Number(expenseForm.amount) })
    setExpenseForm({ date: '', desc: '', amount: '', cat: 'Plumbing', paidBy: 'Self' })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsUploading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file)
    
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName)
      await addReceipt({ name: file.name, url: publicUrl, size: file.size, date: new Date().toISOString().slice(0,10) })
    }
    setIsUploading(false)
  }

  return (
    <div className="min-h-screen text-ink font-sans pb-20">
      {/* Navigation */}
      <nav className="bg-canvas border-b border-hairline px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-extrabold text-xl flex items-center gap-2">
          <Building className="text-brand-pink" /> Rent<span className="text-brand-pink">Portal</span>
        </div>
        <div className="flex my-6 p-4 bg-white/50 rounded-lg border border-gray-200 w-fit">
  <a 
    href="/api/download" 
    className="px-4 py-2 bg-[#1a3a3a] text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
  >
    Download Backup (Excel/CSV)
  </a>
</div>
        <div className="flex gap-4">
          <button onClick={() => clearAllData()} className="text-sm font-semibold border border-hairline rounded-md px-4 py-2 hover:bg-surface-card text-brand-teal transition">
            Clear Database
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Claymation-Style Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-brand-lavender rounded-xl p-8 text-ink">
            <div className="flex justify-between items-start mb-4">
              <div className="uppercase tracking-widest text-xs font-semibold opacity-80">Rent Received</div>
              <IndianRupee className="opacity-50" />
            </div>
            <div className="text-4xl font-bold tracking-tight">{fmt(totalRent)}</div>
          </div>
          <div className="bg-brand-pink rounded-xl p-8 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="uppercase tracking-widest text-xs font-semibold opacity-80">Total Expenses</div>
              <Receipt className="opacity-50" />
            </div>
            <div className="text-4xl font-bold tracking-tight">{fmt(totalExpense)}</div>
          </div>
          <div className="bg-brand-teal rounded-xl p-8 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="uppercase tracking-widest text-xs font-semibold opacity-80">Net Earnings</div>
              <Wallet className="opacity-50" />
            </div>
            <div className="text-4xl font-bold tracking-tight">{fmt(net)}</div>
          </div>
          <div className="bg-brand-ochre rounded-xl p-8 text-ink">
            <div className="flex justify-between items-start mb-4">
              <div className="uppercase tracking-widest text-xs font-semibold opacity-80">Receipts Uploaded</div>
              <ChartLine className="opacity-50" />
            </div>
            <div className="text-4xl font-bold tracking-tight">{data.receipts.length}</div>
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="flex gap-2 bg-surface-card p-1 rounded-full w-fit mb-8 border border-hairline">
          {['overview', 'rent', 'expenses', 'receipts'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-white shadow-sm' : 'text-muted hover:text-ink'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="bg-white border border-hairline rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Overview Chart</h2>
            <div className="h-72">
              <Bar 
                data={{
                  labels: [...new Set([...data.rents.map((r:any) => r.period), ...data.expenses.map((e:any) => getMonthStr(e.date))])],
                  datasets: [
                    { label: 'Rent', data: data.rents.map((r:any) => r.amount), backgroundColor: '#b8a4ed', borderRadius: 8 },
                    { label: 'Expenses', data: data.expenses.map((e:any) => e.amount), backgroundColor: '#ff4d8b', borderRadius: 8 }
                  ]
                }} 
                options={{ responsive: true, maintainAspectRatio: false }} 
              />
            </div>
          </div>
        )}

        {activeTab === 'rent' && (
          <div className="bg-white border border-hairline rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Rent Ledger</h2>
            
            {/* Input Form */}
            <div className="bg-surface-card p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Date</label><input type="date" value={rentForm.date} onChange={e => setRentForm({...rentForm, date: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm" /></div>
              <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Amount</label><input type="number" placeholder="24500" value={rentForm.amount} onChange={e => setRentForm({...rentForm, amount: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm" /></div>
              <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Mode</label><select value={rentForm.mode} onChange={e => setRentForm({...rentForm, mode: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm"><option>Bank Transfer</option><option>UPI</option><option>Cash</option></select></div>
              <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Notes</label><input type="text" placeholder="Optional" value={rentForm.notes} onChange={e => setRentForm({...rentForm, notes: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm" /></div>
              <button onClick={handleAddRent} className="bg-ink text-white font-semibold rounded-md py-3 px-4 hover:bg-gray-800 transition">Add Rent</button>
            </div>

            {/* Table */}
            <table className="w-full text-left border-collapse">
              <thead><tr className="border-b border-hairline text-xs uppercase text-muted tracking-wider"><th className="pb-3">Date</th><th className="pb-3">Period</th><th className="pb-3">Amount</th><th className="pb-3">Mode</th><th className="pb-3 text-right">Action</th></tr></thead>
              <tbody>
                {data.rents.map((r: any) => (
                  <tr key={r.id} className="border-b border-hairline text-sm">
                    <td className="py-4">{r.date}</td><td className="py-4">{r.period}</td><td className="py-4 font-bold">₹{r.amount}</td><td className="py-4">{r.mode}</td>
                    <td className="py-4 text-right"><button onClick={() => deleteRent(r.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expenses Tab is essentially a clone of Rent Tab logic pointing to expense variables */}
        {activeTab === 'expenses' && (
           <div className="bg-white border border-hairline rounded-xl p-8">
           <h2 className="text-2xl font-bold mb-6 tracking-tight">Expense Log</h2>
           <div className="bg-surface-card p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
             <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Date</label><input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm" /></div>
             <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Description</label><input type="text" placeholder="Tap Repair" value={expenseForm.desc} onChange={e => setExpenseForm({...expenseForm, desc: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm" /></div>
             <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Amount</label><input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm" /></div>
             <div><label className="block text-xs uppercase font-semibold text-muted mb-2">Category</label><select value={expenseForm.cat} onChange={e => setExpenseForm({...expenseForm, cat: e.target.value})} className="w-full bg-white border border-hairline rounded-md p-3 text-sm"><option>Plumbing</option><option>Electrical</option><option>Painting</option><option>Other</option></select></div>
             <button onClick={handleAddExpense} className="bg-brand-pink text-white font-semibold rounded-md py-3 px-4 hover:opacity-90 transition">Add Expense</button>
           </div>
           <table className="w-full text-left border-collapse">
             <thead><tr className="border-b border-hairline text-xs uppercase text-muted tracking-wider"><th className="pb-3">Date</th><th className="pb-3">Description</th><th className="pb-3">Category</th><th className="pb-3">Amount</th><th className="pb-3 text-right">Action</th></tr></thead>
             <tbody>
               {data.expenses.map((e: any) => (
                 <tr key={e.id} className="border-b border-hairline text-sm">
                   <td className="py-4">{e.date}</td><td className="py-4 font-medium">{e.desc}</td><td className="py-4">{e.cat}</td><td className="py-4 font-bold text-brand-pink">₹{e.amount}</td>
                   <td className="py-4 text-right"><button onClick={() => deleteExpense(e.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 size={16}/></button></td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
        )}

        {activeTab === 'receipts' && (
          <div className="bg-white border border-hairline rounded-xl p-8">
             <h2 className="text-2xl font-bold mb-6 tracking-tight">Receipts & Proofs</h2>
             <label className="border-2 border-dashed border-hairline rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-card hover:border-brand-teal transition mb-8">
               <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} disabled={isUploading} />
               <Download className="text-muted mb-4" size={32} />
               <div className="font-semibold text-lg">{isUploading ? 'Uploading to cloud...' : 'Click or Drag to Upload'}</div>
               <div className="text-sm text-muted mt-2">PNG, JPG, PDF supported</div>
             </label>

             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {data.receipts.map((r: any) => (
                 <div key={r.id} className="bg-surface-card rounded-lg p-3 group relative">
                    <img src={r.url} onClick={() => setModalImg(r.url)} className="w-full h-32 object-cover rounded-md mb-2 cursor-pointer bg-white" alt="receipt" />
                    <div className="text-xs font-semibold truncate">{r.name}</div>
                    <button onClick={() => deleteReceipt(r.id)} className="absolute top-4 right-4 bg-white rounded-md p-1 shadow-sm opacity-0 group-hover:opacity-100 text-red-500 transition"><Trash2 size={14}/></button>
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {modalImg && (
        <div className="fixed inset-0 bg-ink/80 flex items-center justify-center z-50 p-4" onClick={() => setModalImg(null)}>
          <img src={modalImg} className="max-w-full max-h-full rounded-xl" alt="Preview" />
        </div>
      )}
    </div>
  )
}
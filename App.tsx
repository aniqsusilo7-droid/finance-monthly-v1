
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_ITEMS } from './constants';
import { DEFAULT_CATEGORIES, FinanceItem, MonthlyBudget, CategoryType, SalaryDetails, InvestmentDetails } from './types';
import SummaryCards from './components/SummaryCards';
import ExpenseTable from './components/ExpenseTable';
import FinancialCharts from './components/FinancialCharts';
import AlertBanner from './components/AlertBanner';
import YearlyView from './components/YearlyView';
import PWAInstaller from './components/PWAInstaller';
import Login from './components/Login'; 
import SalarySlip from './components/SalarySlip';
import InvestmentView from './components/InvestmentView';
import CloudSync from './components/CloudSync';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Calendar,
  ShieldCheck,
  LogOut,
  Calculator,
  Copy,
  History,
  TrendingUp
} from 'lucide-react';

const NewCategoryForm: React.FC<{
  onSave: (name: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Nama kategori tidak boleh kosong.');
      return;
    }
    onSave(name);
  };

  return (
    <div className="bg-slate-800/50 border-2 border-dashed border-indigo-500/50 rounded-3xl p-6 mt-6 animate-in fade-in duration-300 space-y-4">
        <input
          type="text"
          placeholder="Nama Kategori Baru"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-400 rounded-lg hover:bg-slate-700">Batal</button>
          <button onClick={handleSave} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500">Simpan Kategori</button>
        </div>
    </div>
  );
};

const DEFAULT_SALARY_DETAILS: SalaryDetails = {
  basicSalary: 0,
  shiftAllowance: 0,
  housingAllowance: 0,
  otHoursStr: "0",
  taxRateStr: "10",
  otherDeductions: 0,
  bonusMultiplierStr: "0"
};

const DEFAULT_INVESTMENT_DETAILS: InvestmentDetails = {
  educationFund: 0,
  retirementFund: 0,
  generalSavings: 0,
  educationTarget: 0,
  retirementTarget: 0,
  savingsTarget: 0
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const getCurrentMonthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return localStorage.getItem('arthaku_selected_month') || getCurrentMonthKey();
  });
  
  const [allMonthsData, setAllMonthsData] = useState<Record<string, MonthlyBudget>>(() => {
    const saved = localStorage.getItem('arthaku_master_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Gagal parse data master", e);
        return {};
      }
    }
    return {};
  });

  const [activeTab, setActiveTab] = useState<'salary' | 'dashboard' | 'charts' | 'yearly' | 'investment'>('dashboard');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [addingItemToCategory, setAddingItemToCategory] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const currentData = useMemo(() => {
    return allMonthsData[selectedMonth] || null;
  }, [selectedMonth, allMonthsData]);

  const alerts = useMemo(() => {
    if (!currentData) return [];
    
    return currentData.categories
      .map(category => {
        const catItems = currentData.items.filter(i => i.category === category);
        const totalBudget = catItems.reduce((sum, i) => sum + i.budget, 0);
        const totalActual = catItems.reduce((sum, i) => sum + i.actual, 0);
        const ratio = totalBudget > 0 ? totalActual / totalBudget : 0;

        if (totalActual > totalBudget && totalBudget > 0 && !dismissedAlerts.has(category)) {
          return {
            category,
            ratio,
            type: ratio > 1.2 ? 'critical' : 'warning' as 'warning' | 'critical'
          };
        }
        return null;
      })
      .filter((a): a is any => a !== null);
  }, [currentData, dismissedAlerts]);

  const selectedYear = useMemo(() => selectedMonth.split('-')[0], [selectedMonth]);
  const formatInput = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const parseInput = (str: string) => Number(str.replace(/[^0-9]/g, ''));

  useEffect(() => {
    localStorage.setItem('arthaku_master_data', JSON.stringify(allMonthsData));
  }, [allMonthsData]);

  useEffect(() => {
    localStorage.setItem('arthaku_selected_month', selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    const remembered = localStorage.getItem('is-auth-aniq-finance');
    const loggedIn = sessionStorage.getItem('is-auth-aniq-finance');
    if (remembered === 'true' || loggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (remember: boolean) => {
    if (remember) localStorage.setItem('is-auth-aniq-finance', 'true');
    else sessionStorage.setItem('is-auth-aniq-finance', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is-auth-aniq-finance');
    localStorage.removeItem('is-auth-aniq-finance');
    setIsAuthenticated(false);
  };

  const initNewMonth = (copyFromMonth: string | null) => {
    const [y] = selectedMonth.split('-');
    let newData: MonthlyBudget;

    if (copyFromMonth && allMonthsData[copyFromMonth]) {
      const sourceData = allMonthsData[copyFromMonth];
      newData = {
        income: sourceData.income,
        categories: [...sourceData.categories],
        items: sourceData.items.map(item => ({ ...item, actual: 0 })), 
        year: y,
        salarySlip: sourceData.salarySlip ? { ...sourceData.salarySlip } : DEFAULT_SALARY_DETAILS,
        investments: sourceData.investments ? { ...sourceData.investments } : DEFAULT_INVESTMENT_DETAILS
      };
    } else {
      newData = {
        income: 0,
        items: INITIAL_ITEMS.map(item => ({ ...item })), 
        categories: DEFAULT_CATEGORIES,
        year: y,
        salarySlip: DEFAULT_SALARY_DETAILS,
        investments: DEFAULT_INVESTMENT_DETAILS
      };
    }

    setAllMonthsData(prev => ({ ...prev, [selectedMonth]: newData }));
    setDismissedAlerts(new Set());
  };

  const findPreviousAvailableMonth = () => {
    const prevMonths = Object.keys(allMonthsData).filter(m => m < selectedMonth).sort().reverse();
    return prevMonths[0] || null;
  };
  
  const updateCurrentMonthData = (newData: Partial<MonthlyBudget>) => {
    setAllMonthsData(prev => {
      const current = prev[selectedMonth];
      if (!current) return prev;
      return { 
        ...prev, 
        [selectedMonth]: { ...current, ...newData } 
      };
    });
  };

  const handleUpdateItem = (id: string, field: 'budget' | 'actual' | 'name', value: number | string) => {
    if (!currentData) return;
    const newItems = currentData.items.map(item => {
      if (item.id === id) return { ...item, [field]: value };
      return item;
    });
    updateCurrentMonthData({ items: newItems });
  };

  const handleRemoveItem = (id: string) => {
    if (!currentData) return;
    const newItems = currentData.items.filter(item => item.id !== id);
    updateCurrentMonthData({ items: newItems });
  };

  const handleSaveNewItem = (itemData: { name: string; category: string; budget: number; actual: number; }) => {
    if (!currentData) return;
    const newItem: FinanceItem = { id: `item-${Date.now()}`, ...itemData };
    updateCurrentMonthData({ items: [...currentData.items, newItem] });
    setAddingItemToCategory(null);
  };

  const handleSaveNewCategory = (categoryName: string) => {
    if (!currentData) return;
    if (categoryName && !currentData.categories.includes(categoryName)) {
      updateCurrentMonthData({ categories: [...currentData.categories, categoryName] });
    }
    setIsAddingCategory(false);
  };
  
  const handleRemoveCategory = (categoryName: string) => {
    if (!currentData) return;
    const newCategories = currentData.categories.filter(c => c !== categoryName);
    const newItems = currentData.items.filter(item => item.category !== categoryName);
    updateCurrentMonthData({ categories: newCategories, items: newItems });
  };

  const handleUpdateSalarySlip = (details: SalaryDetails) => {
    updateCurrentMonthData({ salarySlip: details });
  };

  const handleUpdateInvestments = (details: InvestmentDetails) => {
    updateCurrentMonthData({ investments: details });
  };

  const navigateMonth = (direction: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newKey);
    setDismissedAlerts(new Set());
  };

  const totalBudget = currentData?.items.reduce((sum, item) => sum + item.budget, 0) || 0;
  const totalActual = currentData?.items.reduce((sum, item) => sum + item.actual, 0) || 0;

  const displayMonthName = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const prevMonthKey = findPreviousAvailableMonth();

  if (!isAuthenticated) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div className="flex flex-col leading-none">
             <div className="flex items-center gap-1.5">
               <h1 className="text-sm font-black tracking-tight text-white uppercase">ANIQ SUSILO</h1>
             </div>
             <span className="text-[9px] font-bold text-indigo-400 tracking-[0.2em] mt-0.5">(FINANCE)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <CloudSync data={allMonthsData} onDataLoaded={setAllMonthsData} />

          <div className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-700">
            <button onClick={() => navigateMonth(-1)} className="p-1.5 text-slate-400"><ChevronLeft size={18} /></button>
            <span className="text-xs font-bold px-2 text-slate-200">{displayMonthName}</span>
            <button onClick={() => navigateMonth(1)} className="p-1.5 text-slate-400"><ChevronRight size={18} /></button>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 rounded-full">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {!currentData ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
             <div className="p-8 bg-slate-800/40 rounded-[48px] border border-slate-700/50 mb-8 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl"></div>
                <Calendar size={64} className="text-indigo-500 mb-6 mx-auto" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Data {displayMonthName} Belum Ada</h2>
                <p className="text-sm text-slate-400 mt-3 font-medium max-w-[300px] mx-auto leading-relaxed">Pilih cara untuk memulai pengaturan keuangan Anda bulan ini.</p>
             </div>
             
             <div className="grid grid-cols-1 gap-4 w-full max-sm:w-full">
                {prevMonthKey && (
                  <button onClick={() => initNewMonth(prevMonthKey)} className="flex items-center justify-between gap-4 p-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/20 rounded-xl"><Copy size={18} /></div>
                      <div className="text-left leading-tight">
                        <p>Salin Dari Bulan Lalu</p>
                        <span className="text-[10px] text-indigo-200 opacity-60 font-bold lowercase italic">({prevMonthKey})</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="opacity-40" />
                  </button>
                )}
                <button onClick={() => initNewMonth(null)} className="flex items-center justify-between gap-4 p-5 bg-slate-800 text-slate-300 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-700 border border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-700 rounded-xl"><History size={18} /></div>
                    <p>Mulai Dari Nol (Default)</p>
                  </div>
                  <ChevronRight size={18} className="opacity-40" />
                </button>
             </div>
          </div>
        ) : (
          <>
            <AlertBanner 
              alerts={alerts} 
              onDismiss={(cat) => setDismissedAlerts(prev => new Set([...prev, cat]))} 
            />

            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Penghasilan Bersih (THP)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 font-bold">Rp</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={formatInput(currentData.income)}
                      onChange={(e) => updateCurrentMonthData({ income: parseInput(e.target.value) })}
                      className="text-2xl font-black text-white bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>

                <SummaryCards income={currentData.income} totalBudget={totalBudget} totalActual={totalActual} />
                
                <div className="flex items-center justify-between pt-4">
                  <h2 className="text-lg font-black text-white tracking-tight uppercase">Daftar Anggaran</h2>
                  <button onClick={() => setIsAddingCategory(true)} className="p-2 bg-indigo-600 rounded-full text-white">
                    <Plus size={20} />
                  </button>
                </div>
                
                {isAddingCategory && <NewCategoryForm onSave={handleSaveNewCategory} onCancel={() => setIsAddingCategory(false)} />}

                <ExpenseTable 
                  items={currentData.items} 
                  categories={currentData.categories}
                  onUpdate={handleUpdateItem} 
                  onRemoveItem={handleRemoveItem}
                  onRemoveCategory={handleRemoveCategory}
                  addingItemToCategory={addingItemToCategory}
                  onAddItemClick={setAddingItemToCategory}
                  onSaveNewItem={handleSaveNewItem}
                  onCancelAddItem={() => setAddingItemToCategory(null)}
                />
              </div>
            )}

            {activeTab === 'salary' && (
              <SalarySlip 
                data={currentData.salarySlip || DEFAULT_SALARY_DETAILS}
                onUpdateData={handleUpdateSalarySlip}
                onUpdateTHP={(amount) => updateCurrentMonthData({ income: amount })} 
              />
            )}

            {activeTab === 'charts' && <FinancialCharts items={currentData.items} categories={currentData.categories} />}
            {activeTab === 'yearly' && <YearlyView year={selectedYear} allData={allMonthsData} />}
            {activeTab === 'investment' && (
               <InvestmentView 
                 data={currentData.investments || DEFAULT_INVESTMENT_DETAILS} 
                 onUpdate={handleUpdateInvestments} 
               />
            )}
          </>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 safe-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {[
            { id: 'salary', icon: <Calculator size={24} />, label: 'Slip Gaji' },
            { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Anggaran' },
            { id: 'charts', icon: <BarChart3 size={24} />, label: 'Grafik' },
            { id: 'investment', icon: <TrendingUp size={24} />, label: 'Investasi' },
            { id: 'yearly', icon: <Calendar size={24} />, label: 'Tahunan' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`}
            >
              <div className={`p-1.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-500/10' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <PWAInstaller />
    </div>
  );
};

export default App;

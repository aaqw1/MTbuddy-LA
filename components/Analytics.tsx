import React from 'react';
import { MOCK_PERMITS } from '../data/knowledgeBase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search } from 'lucide-react';

const Analytics: React.FC = () => {
  // Process mock data for chart
  const data = MOCK_PERMITS.map(p => ({
    name: p.address.split(' ')[1], // simple label
    valuation: p.valuation
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Similar Permits in Your Area</h2>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="Search by Zip Code (e.g. 90026)" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <select className="border border-slate-300 rounded-lg px-4 py-2">
            <option>Last 12 Months</option>
            <option>Last 3 Years</option>
          </select>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any) => [value ? `$${Number(value).toLocaleString()}` : '$0', 'Valuation']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="valuation" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          *Data sourced from LADBS Open Data Portal. Valuations are estimates declared at permit issuance.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Work Description</th>
              <th className="px-6 py-4">Valuation</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PERMITS.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{p.address}</td>
                <td className="px-6 py-4 truncate max-w-xs">{p.workDescription}</td>
                <td className="px-6 py-4">${p.valuation.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;

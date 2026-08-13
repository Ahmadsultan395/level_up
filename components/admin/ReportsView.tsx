'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardBody } from '@/components/ui/Card';
import { ErrorState } from '@/components/shared/States';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ReportData {
  range: { from: string; to: string };
  revenueByDay: { date: string; total: number }[];
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  appointmentsCount: number;
  completedCount: number;
  cancelledCount: number;
  newCustomersCount: number;
  topServices: { name: string; count: number }[];
  topBarbers: { name: string; revenue: number; count: number }[];
  newsletterGrowth: number;
}

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
];

export function ReportsView() {
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadReport() {
    setIsLoading(true);
    setError(null);
    fetch(`/api/admin/reports?from=${from}&to=${to}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Failed to load report');
        setData(body);
      })
      .catch((err) => setError(err.message || 'Failed to load report'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  function applyPreset(days: number) {
    setFrom(new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setTo(new Date().toISOString().slice(0, 10));
  }

  function exportPdf() {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Business Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`${formatDate(data.range.from)} — ${formatDate(data.range.to)}`, 14, 26);

    autoTable(doc, {
      startY: 34,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', formatCurrency(data.totalRevenue)],
        ['Total Expenses', formatCurrency(data.totalExpenses)],
        ['Profit', formatCurrency(data.profit)],
        ['Appointments', String(data.appointmentsCount)],
        ['Completed', String(data.completedCount)],
        ['Cancelled', String(data.cancelledCount)],
        ['New Customers', String(data.newCustomersCount)],
        ['Newsletter Signups', String(data.newsletterGrowth)],
      ],
    });

    doc.save(`report_${from}_to_${to}.pdf`);
  }

  function exportExcel() {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet([
      { Metric: 'Total Revenue', Value: data.totalRevenue },
      { Metric: 'Total Expenses', Value: data.totalExpenses },
      { Metric: 'Profit', Value: data.profit },
      { Metric: 'Appointments', Value: data.appointmentsCount },
      { Metric: 'Completed', Value: data.completedCount },
      { Metric: 'Cancelled', Value: data.cancelledCount },
      { Metric: 'New Customers', Value: data.newCustomersCount },
      { Metric: 'Newsletter Signups', Value: data.newsletterGrowth },
    ]);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    const revenueSheet = XLSX.utils.json_to_sheet(data.revenueByDay.map((d) => ({ Date: d.date, Revenue: d.total })));
    XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue by Day');

    const servicesSheet = XLSX.utils.json_to_sheet(data.topServices.map((s) => ({ Service: s.name, Bookings: s.count })));
    XLSX.utils.book_append_sheet(wb, servicesSheet, 'Top Services');

    XLSX.writeFile(wb, `report_${from}_to_${to}.xlsx`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs text-text-muted">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-text-muted">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary"
          />
        </div>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-gold hover:text-gold"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" onClick={exportPdf} disabled={!data}>
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={exportExcel} disabled={!data}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24 text-text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error || !data ? (
        <ErrorState description={error || 'Could not load report data.'} onRetry={loadReport} />
      ) : (
        <div className="mt-8 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Revenue', value: formatCurrency(data.totalRevenue) },
              { label: 'Expenses', value: formatCurrency(data.totalExpenses) },
              { label: 'Profit', value: formatCurrency(data.profit) },
              { label: 'New Customers', value: data.newCustomersCount },
            ].map((c) => (
              <Card key={c.label}>
                <CardBody>
                  <p className="text-xs uppercase tracking-wide text-text-muted">{c.label}</p>
                  <p className="mt-1 font-display text-2xl text-text-primary">{c.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card>
            <CardBody>
              <h2 className="font-display text-lg text-text-primary">Revenue Trend</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="total" stroke="var(--color-gold)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardBody>
                <h2 className="font-display text-lg text-text-primary">Top Services</h2>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topServices} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: 12 }} />
                      <Bar dataKey="count" fill="var(--color-gold)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h2 className="font-display text-lg text-text-primary">Top Barbers by Revenue</h2>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topBarbers} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: 12 }} />
                      <Bar dataKey="revenue" fill="var(--color-gold)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-xs uppercase tracking-wide text-text-muted">Appointments</p>
                <p className="mt-1 font-display text-2xl text-text-primary">{data.appointmentsCount}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs uppercase tracking-wide text-text-muted">Completed</p>
                <p className="mt-1 font-display text-2xl text-text-primary">{data.completedCount}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs uppercase tracking-wide text-text-muted">Newsletter Signups</p>
                <p className="mt-1 font-display text-2xl text-text-primary">{data.newsletterGrowth}</p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

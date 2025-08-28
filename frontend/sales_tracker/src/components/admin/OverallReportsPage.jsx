import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { format } from 'date-fns';

const OverallReportsPage = () => {
  const token = useAuthStore((state) => state.token);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [reportType, setReportType] = useState('daily'); 
  const [selectedSalespersonId, setSelectedSalespersonId] = useState(''); 
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
  const [year, setYear] = useState(String(new Date().getFullYear())); 
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0')); 

  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  // --- Fetch Salespersons for the Filter Dropdown ---
  const fetchSalespersons = async () => {
    try {
      if (!token || !isAdmin) return;

      const response = await fetch('http://localhost:8000/api/v1/users/?role=salesperson', {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OverallReportsPage: Backend Error Data (Salespersons Fetch):', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || 'Failed to fetch salespersons for filter.');
        } catch (jsonError) {
          throw new Error(`Failed to fetch salespersons: ${errorText.substring(0, 200)}... (Response was not JSON)`);
        }
      }
      const data = await response.json();
      setSalespersons(data.results || data); // Handle pagination if present
      console.log('OverallReportsPage: Fetched salespersons for filter:', data.results || data);
    } catch (err) {
      console.error('OverallReportsPage: Error fetching salespersons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchSalespersons();
    }
  }, [isAdmin, token]);

  // --- Handle Report Generation and Download ---
  const handleGenerateReport = async () => {
    setError(null);
    setReportMessage('');
    setIsGeneratingReport(true);

    let apiUrl = 'http://localhost:8000/api/v1/reports/sales/';
    const params = new URLSearchParams();

    // Add salesperson filter if selected
    if (selectedSalespersonId) {
      params.append('salesperson_id', selectedSalespersonId);
    }

    // Append date parameters based on report type
    switch (reportType) {
      case 'daily':
        apiUrl += 'daily/';
        params.append('date', date);
        break;
      case 'weekly':
        apiUrl += 'weekly/';
        params.append('start_date', startDate);
        params.append('end_date', endDate);
        break;
      case 'monthly':
        apiUrl += 'monthly/';
        params.append('year', year);
        params.append('month', month);
        break;
      case 'yearly':
        apiUrl += 'yearly/';
        params.append('year', year);
        break;
      default:
        setError('Invalid report type selected.');
        setIsGeneratingReport(false);
        return;
    }

    const fullUrl = `${apiUrl}?${params.toString()}`;
    console.log('Attempting to fetch report from:', fullUrl);

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OverallReportsPage: Backend Error Data (Report Generation):', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || `Failed to generate ${reportType} report.`);
        } catch (jsonError) {
          throw new Error(`Failed to generate ${reportType} report: ${errorText.substring(0, 200)}... (Response was not JSON)`);
        }
      }

      // Assumes the backend returns a CSV file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${reportType}_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setReportMessage('Report generated and downloaded successfully!');
    } catch (err) {
      console.error('OverallReportsPage: Error generating report:', err);
      setError(err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // --- Helper to render dynamic date inputs ---
  const renderDateInputs = () => {
    switch (reportType) {
      case 'daily':
        return (
          <Input
            label="Date"
            id="reportDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mb-4"
          />
        );
      case 'weekly':
        return (
          <div className="flex space-x-4 mb-4">
            <Input
              label="Start Date"
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        );
      case 'monthly':
        return (
          <div className="flex space-x-4 mb-4">
            <Input
              label="Year"
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2000"
              max={String(new Date().getFullYear())}
              required
            />
            <Select
              label="Month"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              options={[
                { value: '01', label: 'January' }, { value: '02', label: 'February' },
                { value: '03', label: 'March' }, { value: '04', label: 'April' },
                { value: '05', label: 'May' }, { value: '06', label: 'June' },
                { value: '07', label: 'July' }, { value: '08', label: 'August' },
                { value: '09', label: 'September' }, { value: '10', label: 'October' },
                { value: '11', label: 'November' }, { value: '12', label: 'December' },
              ]}
              required
            />
          </div>
        );
      case 'yearly':
        return (
          <Input
            label="Year"
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2000"
            max={String(new Date().getFullYear())}
            required
            className="mb-4"
          />
        );
      default:
        return null;
    }
  };

  // --- Conditional Rendering ---
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-full text-red-600 text-lg p-4 bg-red-100 rounded-md">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600 text-lg">Loading salespersons for filters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-md">
        Error: {error}
        <Button onClick={() => window.location.reload()} className="ml-4 bg-red-500 hover:bg-red-700">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Overall Sales Reports</h2>

      <div className="mb-6 space-y-4">
        {/* Report Type Selection */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => setReportType('daily')}
            className={`${reportType === 'daily' ? 'bg-blue-600' : 'bg-gray-400'} hover:bg-blue-700`}
            disabled={isGeneratingReport}
          >
            Daily Report
          </Button>
          <Button
            onClick={() => setReportType('weekly')}
            className={`${reportType === 'weekly' ? 'bg-blue-600' : 'bg-gray-400'} hover:bg-blue-700`}
            disabled={isGeneratingReport}
          >
            Weekly Report
          </Button>
          <Button
            onClick={() => setReportType('monthly')}
            className={`${reportType === 'monthly' ? 'bg-blue-600' : 'bg-gray-400'} hover:bg-blue-700`}
            disabled={isGeneratingReport}
          >
            Monthly Report
          </Button>
          <Button
            onClick={() => setReportType('yearly')}
            className={`${reportType === 'yearly' ? 'bg-blue-600' : 'bg-gray-400'} hover:bg-blue-700`}
            disabled={isGeneratingReport}
          >
            Yearly Report
          </Button>
        </div>

        {/* Salesperson Filter */}
        <Select
          label="Filter by Salesperson (Optional)"
          id="salespersonFilter"
          value={selectedSalespersonId}
          onChange={(e) => setSelectedSalespersonId(e.target.value)}
          options={[
            { value: '', label: 'All Salespersons' },
            ...salespersons.map(sp => ({ value: sp.user.id, label: sp.user.username }))
          ]}
          className="w-full mt-4"
          disabled={isGeneratingReport}
        />

        {/* Dynamic Date Inputs */}
        {renderDateInputs()}

        {reportMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p className="font-bold">Success</p>
            <p>{reportMessage}</p>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Button
            onClick={handleGenerateReport}
            className="bg-green-600 hover:bg-green-700"
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? 'Generating...' : 'Generate & Download Report'}
          </Button>
        </div>
      </div>

      {/* Report Preview (Optional - could add a summary table here if desired) */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md text-gray-700 text-center">
        <p className="text-lg font-semibold">Report will download as a CSV file.</p>
        <p className="text-sm text-gray-500">A preview table could be implemented here if the backend returns summary data.</p>
      </div>
    </div>
  );
};

export default OverallReportsPage;
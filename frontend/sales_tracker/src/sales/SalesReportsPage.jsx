import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input'; 
import { format } from 'date-fns'; 

const SalesReportsPage = () => {
  const token = useAuthStore((state) => state.token);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [reportType, setReportType] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly'
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd')); // For weekly/monthly range
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd')); // For weekly/monthly range
  const [year, setYear] = useState(new Date().getFullYear().toString()); // For monthly/yearly
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0')); // For monthly

  const [salespersonFilterId, setSalespersonFilterId] = useState(''); // Admin can filter by salesperson
  const [salespersons, setSalespersons] = useState([]); // List of salespersons for the filter dropdown

  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch Salespersons for Admin Filter ---
  useEffect(() => {
    const fetchSalespersons = async () => {
      if (!isAdmin || !token) return;

      try {
        const response = await fetch('http://localhost:8000/api/v1/users/?role=salesperson', {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch salespersons.');
        }
        const data = await response.json();
        setSalespersons(data);
      } catch (err) {
        console.error('SalesReportsPage: Error fetching salespersons:', err);
        setError(err.message);
      }
    };
    fetchSalespersons();
  }, [isAdmin, token]);

  // --- Fetch Reports ---
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setReportsData([]); // Clear previous data

    let url = '';
    let queryParams = new URLSearchParams();

    // Base URL for reports
    const baseUrl = 'http://localhost:8000/api/v1/reports/sales/';

    // Add salesperson filter for admin
    if (isAdmin && salespersonFilterId) {
      queryParams.append('salesperson_id', salespersonFilterId);
    }

    switch (reportType) {
      case 'daily':
        url = `${baseUrl}daily/`;
        queryParams.append('date', currentDate);
        break;
      case 'weekly':
        url = `${baseUrl}weekly/`;
        queryParams.append('start_date', startDate);
        queryParams.append('end_date', endDate);
        break;
      case 'monthly':
        url = `${baseUrl}monthly/`;
        queryParams.append('year', year);
        queryParams.append('month', month);
        break;
      case 'yearly':
        url = `${baseUrl}yearly/`;
        queryParams.append('year', year);
        break;
      default:
        setError('Invalid report type selected.');
        setLoading(false);
        return;
    }

    const fullUrl = `${url}?${queryParams.toString()}`;

    try {
      const response = await fetch(fullUrl, {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) {
        // Read as text first to see the kind of error it is.
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText); // Attempt to parse as JSON
          throw new Error(errorData.detail || errorData.non_field_errors?.[0] || 'Failed to fetch report.');
        } catch (jsonError) {
          throw new Error(`Failed to fetch report: ${errorText.substring(0, 100)}... (Not JSON)`);
        }
      }

      // Since these are CSV endpoints, we expect text/csv, not JSON
      const csvText = await response.text();
      parseCsvData(csvText); // Parse CSV text and set to state
    } catch (err) {
      console.error('SalesReportsPage: Error fetching report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse CSV data
  const parseCsvData = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) {
      setReportsData([]);
      return;
    }

    const header = lines[0].split(',');
    const data = lines.slice(1).map(line => line.split(','));

    // Map data to objects for easier rendering
    const parsedData = data.map(row => {
      const rowObject = {};
      header.forEach((key, i) => {
        rowObject[key.trim()] = row[i]?.trim(); // Trim key and value
      });
      return rowObject;
    });
    setReportsData(parsedData);
  };


  const handleGenerateReport = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleDownloadCSV = async () => {
    setLoading(true);
    setError(null);

    let url = '';
    let queryParams = new URLSearchParams();

    
    const baseUrl = 'http://localhost:8000/api/v1/reports/sales/';

    if (isAdmin && salespersonFilterId) {
      queryParams.append('salesperson_id', salespersonFilterId);
    }

    switch (reportType) {
      case 'daily':
        url = `${baseUrl}daily/`;
        queryParams.append('date', currentDate);
        break;
      case 'weekly':
        url = `${baseUrl}weekly/`;
        queryParams.append('start_date', startDate);
        queryParams.append('end_date', endDate);
        break;
      case 'monthly':
        url = `${baseUrl}monthly/`;
        queryParams.append('year', year);
        queryParams.append('month', month);
        break;
      case 'yearly':
        url = `${baseUrl}yearly/`;
        queryParams.append('year', year);
        break;
      default:
        setError('Invalid report type selected.');
        setLoading(false);
        return;
    }

    const fullUrl = `${url}?${queryParams.toString()}`;

    try {
      const response = await fetch(fullUrl, {
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText); // Attempt to parse as JSON
          throw new Error(errorData.detail || errorData.non_field_errors?.[0] || 'Failed to download report.');
        } catch (jsonError) {
          throw new Error(`Failed to download report: ${errorText.substring(0, 100)}... (Not JSON)`);
        }
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${reportType}_sales_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('SalesReportsPage: Error downloading report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helps in generating month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(0, i).toLocaleString('en-US', { month: 'long' });
    return { value: monthNum, label: monthName };
  });

  // Helps in generating recent years options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString()); // Last 5 years


  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sales Reports</h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleGenerateReport} className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Report Type:</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="reportType"
                value="daily"
                checked={reportType === 'daily'}
                onChange={(e) => setReportType(e.target.value)}
              />
              <span className="ml-2 text-gray-700">Daily</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="reportType"
                value="weekly"
                checked={reportType === 'weekly'}
                onChange={(e) => setReportType(e.target.value)}
              />
              <span className="ml-2 text-gray-700">Weekly</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="reportType"
                value="monthly"
                checked={reportType === 'monthly'}
                onChange={(e) => setReportType(e.target.value)}
              />
              <span className="ml-2 text-gray-700">Monthly</span>
            </label>
            {isAdmin && ( // Only admin can see yearly report
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="reportType"
                  value="yearly"
                  checked={reportType === 'yearly'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <span className="ml-2 text-gray-700">Yearly (Admin)</span>
              </label>
            )}
          </div>
        </div>

        {/* Date Filters based on Report Type */}
        <div className="flex flex-wrap gap-4 items-end">
          {reportType === 'daily' && (
            <div className="w-full md:w-auto flex-grow">
              <label htmlFor="currentDate" className="block text-gray-700 text-sm font-bold mb-2">Date:</label>
              <Input
                id="currentDate"
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {(reportType === 'weekly' || reportType === 'monthly') && (
            <>
              <div className="w-full md:w-1/2 lg:w-1/3 flex-grow">
                <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-1/2 lg:w-1/3 flex-grow">
                <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date:</label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}

          {(reportType === 'monthly' || reportType === 'yearly') && (
            <>
              <div className="w-full md:w-1/2 lg:w-1/4 flex-grow">
                <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Year:</label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              {reportType === 'monthly' && (
                <div className="w-full md:w-1/2 lg:w-1/4 flex-grow">
                  <label htmlFor="month" className="block text-gray-700 text-sm font-bold mb-2">Month:</label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
                  >
                    {monthOptions.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {isAdmin && (reportType !== 'yearly') && ( // Admin filter for salesperson
            <div className="w-full md:w-auto flex-grow">
              <label htmlFor="salespersonFilter" className="block text-gray-700 text-sm font-bold mb-2">Filter by Salesperson (Admin):</label>
              <select
                id="salespersonFilter"
                value={salespersonFilterId}
                onChange={(e) => setSalespersonFilterId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
              >
                <option value="">All Salespersons</option>
                {salespersons.map(sp => (
                  <option key={sp.user.id} value={sp.user.id}>{sp.user.username}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-start space-x-4 mt-6">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          <Button type="button" onClick={handleDownloadCSV} disabled={loading || reportsData.length === 0} className="bg-green-600 hover:bg-green-700">
            Download CSV
          </Button>
        </div>
      </form>

      {/* Report Preview */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-600 text-lg">Loading report data...</p>
        </div>
      )}

      {reportsData.length > 0 && !loading && (
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Report Preview:</h3>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                {Object.keys(reportsData[0]).map((key) => (
                  <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key.replace(/_/g, ' ')} {/* Basic key formatting */}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportsData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-gray-600 mt-4">Showing {reportsData.length} records.</p>
        </div>
      )}

      {reportsData.length === 0 && !loading && !error && (
        <div className="mt-8 p-4 text-center text-gray-600 bg-gray-50 rounded-md">
          No report data available for the selected criteria. Generate a report above.
        </div>
      )}
    </div>
  );
};

export default SalesReportsPage;

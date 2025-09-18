import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  UserIcon, 
  DocumentTextIcon, 
  CubeIcon,
  TagIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { formatDateTimeFull } from '../../utils/dateUtils';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userId: '',
    days: 30
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [logPurgeStatus, setLogPurgeStatus] = useState(null);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchStats();
    fetchLogPurgeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/activities?${params}`);
      // Handle both response structures for compatibility
      const activitiesData = response.data.data?.activities || response.data.activities || [];
      const paginationData = response.data.data?.pagination || response.data.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      };
      setActivities(activitiesData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/activities/stats?days=${filters.days}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        days: filters.days
      });
      
      const response = await api.get(`/activities/export/csv?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activities-export-${filters.days}days.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting activities:', error);
    }
  };

  const getActionIcon = (entityType) => {
    switch (entityType) {
      case 'product': return <CubeIcon className="w-5 h-5 text-blue-500" />;
      case 'user': return <UsersIcon className="w-5 h-5 text-green-500" />;
      case 'story': return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
      case 'brand': return <TagIcon className="w-5 h-5 text-orange-500" />;
      case 'category': return <TagIcon className="w-5 h-5 text-red-500" />;
      default: return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'text-green-600 bg-green-100';
      case 'update': return 'text-blue-600 bg-blue-100';
      case 'delete': return 'text-red-600 bg-red-100';
      case 'login': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // formatDateTimeFull is now imported from utils/dateUtils

  const fetchLogPurgeStatus = async () => {
    try {
      const response = await api.get('/log-purge/status');
      setLogPurgeStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching log purge status:', error);
    }
  };

  const handleLogPurge = async (daysOld = 30) => {
    if (!window.confirm(`Are you sure you want to delete all activity logs older than ${daysOld} days? This action cannot be undone.`)) {
      return;
    }

    try {
      setPurging(true);
      const response = await api.post('/log-purge/manual', { daysOld });
      
      if (response.data.success) {
        alert(`Successfully purged ${response.data.deletedCount} old log records.`);
        // Refresh data
        fetchActivities();
        fetchStats();
        fetchLogPurgeStatus();
      } else {
        alert('Failed to purge logs: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error purging logs:', error);
      alert('Failed to purge logs. Please try again.');
    } finally {
      setPurging(false);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Timeline</h1>
          <p className="text-gray-600 mt-2">Track all system activities and user actions</p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-primary flex items-center space-x-2"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.dailyStats?.reduce((sum, day) => sum + day.count, 0) || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.topUsers?.length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Period</p>
              <p className="text-2xl font-bold text-gray-900">
                {filters.days} days
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entity Types</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activityStats?.reduce((types, stat) => {
                  if (!types.includes(stat.entityType)) types.push(stat.entityType);
                  return types;
                }, []).length || 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type
            </label>
            <select
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="product">Product</option>
              <option value="user">User</option>
              <option value="story">Story</option>
              <option value="brand">Brand</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={filters.days}
              onChange={(e) => handleFilterChange('days', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  entityType: '',
                  action: '',
                  userId: '',
                  days: 30
                });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Log Purge Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <TrashIcon className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Log Purge Management</h3>
        </div>
        
        {logPurgeStatus && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Records</div>
                <div className="text-2xl font-bold text-gray-900">{logPurgeStatus.total.toLocaleString()}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Last 7 Days</div>
                <div className="text-2xl font-bold text-blue-900">{logPurgeStatus.ageRanges[0]?.count.toLocaleString() || 0}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Last 30 Days</div>
                <div className="text-2xl font-bold text-green-900">{logPurgeStatus.ageRanges[1]?.count.toLocaleString() || 0}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">Older than 90 Days</div>
                <div className="text-2xl font-bold text-red-900">{logPurgeStatus.ageRanges[3]?.count.toLocaleString() || 0}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <InformationCircleIcon className="w-4 h-4" />
                <span>Oldest: {logPurgeStatus.oldestRecord ? new Date(logPurgeStatus.oldestRecord).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <InformationCircleIcon className="w-4 h-4" />
                <span>Newest: {logPurgeStatus.newestRecord ? new Date(logPurgeStatus.newestRecord).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleLogPurge(30)}
            disabled={purging}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <TrashIcon className="w-4 h-4" />
            <span>{purging ? 'Purging...' : 'Purge Logs (30+ days)'}</span>
          </button>
          
          <button
            onClick={() => handleLogPurge(90)}
            disabled={purging}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <TrashIcon className="w-4 h-4" />
            <span>{purging ? 'Purging...' : 'Purge Logs (90+ days)'}</span>
          </button>
          
          <div className="text-sm text-gray-500">
            Auto-purge runs daily at 2 AM (30+ days)
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activities ({pagination.total} total)
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getActionIcon(activity.entityType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </span>
                    <span className="text-sm text-gray-500">
                      {activity.entityType}
                    </span>
                    {activity.entityId && (
                      <span className="text-sm text-gray-400">
                        #{activity.entityId}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-1">
                    {activity.details || `${activity.action} ${activity.entityType}`}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-3 h-3" />
                      <span>{activity.user}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{formatDateTimeFull(activity.createdAt)}</span>
                    </div>
                    {activity.ipAddress && (
                      <div className="flex items-center space-x-1">
                        <span>IP: {activity.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination(prev => ({ 
                        ...prev, 
                        limit: Number(e.target.value),
                        page: 1 
                      }));
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                <div className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.pages}</span> 
                  ({pagination.total} total activities)
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => {
                  // Show current page, first page, last page, and pages around current
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.page - 2 && page <= pagination.page + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          page === pagination.page
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.page - 3 ||
                    page === pagination.page + 3
                  ) {
                    return (
                      <span
                        key={page}
                        className="px-3 py-2 text-sm text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;

import { useEffect, useState } from 'react';
import { Table, Select, message } from 'antd';
import { qualityApi, QualityIssue } from '../../api/quality';

const IssueList = () => {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const response = await qualityApi.listIssues({ limit: 100 });
      setIssues(response.data);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await qualityApi.updateIssue(id, status);
      message.success('Status updated');
      loadIssues();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Inspection ID', dataIndex: 'inspection_id', key: 'inspection_id' },
    { title: 'Issue Type', dataIndex: 'issue_type', key: 'issue_type' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: QualityIssue) => (
        <Select
          value={status}
          style={{ width: 130 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quality Issues</h2>
      <Table columns={columns} dataSource={issues} loading={loading} rowKey="id" />
    </div>
  );
};

export default IssueList;

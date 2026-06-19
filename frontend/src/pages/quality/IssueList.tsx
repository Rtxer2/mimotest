import { useEffect, useState } from 'react';
import { Table, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { qualityApi, QualityIssue } from '../../api/quality';

const IssueList = () => {
  const { t } = useTranslation();
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
      message.success(t('quality.status_updated'));
      loadIssues();
    } catch (error) {
      message.error(t('quality.status_update_failed'));
    }
  };

  const columns = [
    { title: t('quality.id'), dataIndex: 'id', key: 'id' },
    { title: t('quality.inspection_id'), dataIndex: 'inspection_id', key: 'inspection_id' },
    { title: t('quality.issue_type'), dataIndex: 'issue_type', key: 'issue_type' },
    { title: t('quality.description'), dataIndex: 'description', key: 'description' },
    {
      title: t('quality.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: QualityIssue) => (
        <Select
          value={status}
          style={{ width: 130 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          options={[
            { value: 'open', label: t('quality.status_open') },
            { value: 'in_progress', label: t('quality.status_in_progress') },
            { value: 'resolved', label: t('quality.status_resolved') },
            { value: 'closed', label: t('quality.status_closed') },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('quality.issues_title')}</h2>
      <Table columns={columns} dataSource={issues} loading={loading} rowKey="id" />
    </div>
  );
};

export default IssueList;

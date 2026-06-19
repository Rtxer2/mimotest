import { useState } from 'react';
import { Card, Button, Space, message } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { reportApi } from '../../api/reports';

const ReportExport = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string, format: string) => {
    const key = `${type}-${format}`;
    setLoading(key);
    try {
      const res = await reportApi.export(type, format);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success(t('reports.export_success'));
    } catch {
      message.error(t('reports.export_failed'));
    } finally {
      setLoading(null);
    }
  };

  const modules = [
    { key: 'orders', label: t('reports.orders') },
    { key: 'production', label: t('reports.production') },
    { key: 'quality', label: t('reports.quality') },
    { key: 'inventory', label: t('reports.inventory') },
  ];

  return (
    <div>
      <h2>{t('reports.title')}</h2>
      {modules.map((mod) => (
        <Card key={mod.key} title={mod.label} style={{ marginBottom: 16 }}>
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              loading={loading === `${mod.key}-xlsx`}
              onClick={() => handleExport(mod.key, 'xlsx')}
            >
              {t('reports.export_excel')}
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              loading={loading === `${mod.key}-pdf`}
              onClick={() => handleExport(mod.key, 'pdf')}
            >
              {t('reports.export_pdf')}
            </Button>
          </Space>
        </Card>
      ))}
    </div>
  );
};

export default ReportExport;

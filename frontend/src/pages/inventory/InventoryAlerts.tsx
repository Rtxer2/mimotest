import { useEffect, useState } from 'react';
import { Table, Tag, Tabs } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { inventoryApi, Material, FinishedProduct } from '../../api/inventory';

const InventoryAlerts = () => {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const res = await inventoryApi.getAlerts();
        setMaterials(res.data.materials);
        setProducts(res.data.products);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const materialColumns = [
    { title: t('inventory.code'), dataIndex: 'code', key: 'code' },
    { title: t('inventory.name'), dataIndex: 'name', key: 'name' },
    { title: t('inventory.unit'), dataIndex: 'unit', key: 'unit' },
    {
      title: t('inventory.current_stock'),
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (val: number) => <Tag color="red">{val}</Tag>,
    },
    { title: t('inventory.safety_stock'), dataIndex: 'safety_stock', key: 'safety_stock' },
  ];

  const productColumns = [
    { title: t('inventory.sku'), dataIndex: 'sku', key: 'sku' },
    { title: t('inventory.product_name'), dataIndex: 'product_name', key: 'product_name' },
    {
      title: t('inventory.current_stock'),
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (val: number) => <Tag color="red">{val}</Tag>,
    },
    { title: t('inventory.safety_stock'), dataIndex: 'safety_stock', key: 'safety_stock' },
  ];

  return (
    <div>
      <h2><WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />{t('inventory.alerts_title')}</h2>
      <Tabs
        defaultActiveKey="materials"
        items={[
          {
            key: 'materials',
            label: `${t('inventory.materials_title')} (${materials.length})`,
            children: <Table columns={materialColumns} dataSource={materials} loading={loading} rowKey="id" pagination={false} />,
          },
          {
            key: 'products',
            label: `${t('inventory.products_title')} (${products.length})`,
            children: <Table columns={productColumns} dataSource={products} loading={loading} rowKey="id" pagination={false} />,
          },
        ]}
      />
    </div>
  );
};

export default InventoryAlerts;

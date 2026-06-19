import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { dictApi, DictType, DictEntry } from '../../api/dict';

const DictList = () => {
  const { t } = useTranslation();
  const [dictTypes, setDictTypes] = useState<DictType[]>([]);
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [selectedType, setSelectedType] = useState<DictType | null>(null);
  const [loading, setLoading] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<DictType | null>(null);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DictEntry | null>(null);
  const [typeForm] = Form.useForm();
  const [entryForm] = Form.useForm();

  const loadTypes = async () => {
    setLoading(true);
    try {
      const res = await dictApi.listTypes({ limit: 100 });
      setDictTypes(res.data);
    } catch (error) {
      message.error(t('system.load_dict_types_failed'));
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async (typeCode: string) => {
    setEntryLoading(true);
    try {
      const res = await dictApi.listEntries({ dict_type_code: typeCode, limit: 500 });
      setEntries(res.data);
    } catch (error) {
      message.error(t('system.load_entries_failed'));
    } finally {
      setEntryLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      loadEntries(selectedType.code);
    } else {
      setEntries([]);
    }
  }, [selectedType]);

  const handleSaveType = async (values: any) => {
    try {
      if (editingType) {
        await dictApi.updateType(editingType.id, values);
        message.success(t('system.dict_type_updated'));
      } else {
        await dictApi.createType(values);
        message.success(t('system.dict_type_created'));
      }
      setTypeModalOpen(false);
      typeForm.resetFields();
      setEditingType(null);
      loadTypes();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const handleDeleteType = async (id: number) => {
    try {
      await dictApi.deleteType(id);
      message.success(t('system.dict_type_deleted'));
      if (selectedType?.id === id) setSelectedType(null);
      loadTypes();
    } catch (error) {
      message.error(t('system.delete_dict_type_failed'));
    }
  };

  const openEditType = (type: DictType) => {
    setEditingType(type);
    typeForm.setFieldsValue({ name: type.name, code: type.code, description: type.description });
    setTypeModalOpen(true);
  };

  const handleSaveEntry = async (values: any) => {
    if (!selectedType) return;
    try {
      if (editingEntry) {
        await dictApi.updateEntry(editingEntry.id, values);
        message.success(t('system.entry_updated'));
      } else {
        await dictApi.createEntry({ ...values, dict_type_code: selectedType.code });
        message.success(t('system.entry_created'));
      }
      setEntryModalOpen(false);
      entryForm.resetFields();
      setEditingEntry(null);
      loadEntries(selectedType.code);
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await dictApi.deleteEntry(id);
      message.success(t('system.entry_deleted'));
      if (selectedType) loadEntries(selectedType.code);
    } catch (error) {
      message.error(t('system.delete_entry_failed'));
    }
  };

  const openEditEntry = (entry: DictEntry) => {
    setEditingEntry(entry);
    entryForm.setFieldsValue({
      label: entry.label,
      value: entry.value,
      sort_order: entry.sort_order,
      remark: entry.remark,
    });
    setEntryModalOpen(true);
  };

  const typeColumns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.code'), dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c}</Tag> },
    { title: t('common.description'), dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: t('common.action'),
      key: 'action',
      width: 100,
      render: (_: any, record: DictType) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditType(record)} />
          <Popconfirm title={t('system.delete_type_confirm')} onConfirm={() => handleDeleteType(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const entryColumns = [
    { title: t('common.label'), dataIndex: 'label', key: 'label' },
    { title: t('common.value'), dataIndex: 'value', key: 'value', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: t('common.sort_order'), dataIndex: 'sort_order', key: 'sort_order', width: 60 },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag>,
    },
    { title: t('common.remark'), dataIndex: 'remark', key: 'remark', ellipsis: true },
    {
      title: t('common.action'),
      key: 'action',
      width: 100,
      render: (_: any, record: DictEntry) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditEntry(record)} />
          <Popconfirm title={t('system.delete_entry_confirm')} onConfirm={() => handleDeleteEntry(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('system.dict_title')}</h2>
      <Row gutter={16}>
        <Col span={10}>
          <Card
            title={t('system.dict_types')}
            extra={
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditingType(null); typeForm.resetFields(); setTypeModalOpen(true); }}>
                {t('system.add_type')}
              </Button>
            }
          >
            <Table
              columns={typeColumns}
              dataSource={dictTypes}
              loading={loading}
              rowKey="id"
              pagination={false}
              size="small"
              onRow={(record) => ({
                onClick: () => setSelectedType(record),
                style: { cursor: 'pointer', background: selectedType?.id === record.id ? '#e6f7ff' : undefined },
              })}
            />
          </Card>
        </Col>
        <Col span={14}>
          <Card
            title={selectedType ? `${t('system.entries')}: ${selectedType.name}` : t('system.select_dict_type')}
            extra={
              selectedType && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditingEntry(null); entryForm.resetFields(); setEntryModalOpen(true); }}>
                  {t('system.add_entry')}
                </Button>
              )
            }
          >
            <Table
              columns={entryColumns}
              dataSource={entries}
              loading={entryLoading}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: selectedType ? t('system.no_entries') : t('system.click_to_view') }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingType ? t('system.edit_dict_type') : t('system.add_type')}
        open={typeModalOpen}
        onCancel={() => { setTypeModalOpen(false); setEditingType(null); }}
        onOk={() => typeForm.submit()}
      >
        <Form form={typeForm} layout="vertical" onFinish={handleSaveType}>
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t('common.code')} rules={[{ required: true }]}>
            <Input disabled={!!editingType} />
          </Form.Item>
          <Form.Item name="description" label={t('common.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingEntry ? t('system.edit_entry') : t('system.add_entry')}
        open={entryModalOpen}
        onCancel={() => { setEntryModalOpen(false); setEditingEntry(null); }}
        onOk={() => entryForm.submit()}
      >
        <Form form={entryForm} layout="vertical" onFinish={handleSaveEntry}>
          <Form.Item name="label" label={t('common.label')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label={t('common.value')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sort_order" label={t('common.sort_order')} initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label={t('common.remark')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DictList;

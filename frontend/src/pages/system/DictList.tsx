import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { dictApi, DictType, DictEntry } from '../../api/dict';

const DictList = () => {
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
      message.error('Failed to load dict types');
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
      message.error('Failed to load entries');
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
        message.success('Dict type updated');
      } else {
        await dictApi.createType(values);
        message.success('Dict type created');
      }
      setTypeModalOpen(false);
      typeForm.resetFields();
      setEditingType(null);
      loadTypes();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDeleteType = async (id: number) => {
    try {
      await dictApi.deleteType(id);
      message.success('Dict type deleted');
      if (selectedType?.id === id) setSelectedType(null);
      loadTypes();
    } catch (error) {
      message.error('Failed to delete dict type');
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
        message.success('Entry updated');
      } else {
        await dictApi.createEntry({ ...values, dict_type_code: selectedType.code });
        message.success('Entry created');
      }
      setEntryModalOpen(false);
      entryForm.resetFields();
      setEditingEntry(null);
      loadEntries(selectedType.code);
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await dictApi.deleteEntry(id);
      message.success('Entry deleted');
      if (selectedType) loadEntries(selectedType.code);
    } catch (error) {
      message.error('Failed to delete entry');
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code', render: (c: string) => <Tag>{c}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: DictType) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditType(record)} />
          <Popconfirm title="Delete this type and all its entries?" onConfirm={() => handleDeleteType(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const entryColumns = [
    { title: 'Label', dataIndex: 'label', key: 'label' },
    { title: 'Value', dataIndex: 'value', key: 'value', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Sort', dataIndex: 'sort_order', key: 'sort_order', width: 60 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s}</Tag>,
    },
    { title: 'Remark', dataIndex: 'remark', key: 'remark', ellipsis: true },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: DictEntry) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditEntry(record)} />
          <Popconfirm title="Delete this entry?" onConfirm={() => handleDeleteEntry(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Data Dictionary</h2>
      <Row gutter={16}>
        <Col span={10}>
          <Card
            title="Dict Types"
            extra={
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditingType(null); typeForm.resetFields(); setTypeModalOpen(true); }}>
                Add Type
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
            title={selectedType ? `Entries: ${selectedType.name}` : 'Select a dict type'}
            extra={
              selectedType && (
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setEditingEntry(null); entryForm.resetFields(); setEntryModalOpen(true); }}>
                  Add Entry
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
              locale={{ emptyText: selectedType ? 'No entries' : 'Click a dict type to view entries' }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingType ? 'Edit Dict Type' : 'Add Dict Type'}
        open={typeModalOpen}
        onCancel={() => { setTypeModalOpen(false); setEditingType(null); }}
        onOk={() => typeForm.submit()}
      >
        <Form form={typeForm} layout="vertical" onFinish={handleSaveType}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input disabled={!!editingType} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingEntry ? 'Edit Entry' : 'Add Entry'}
        open={entryModalOpen}
        onCancel={() => { setEntryModalOpen(false); setEditingEntry(null); }}
        onOk={() => entryForm.submit()}
      >
        <Form form={entryForm} layout="vertical" onFinish={handleSaveEntry}>
          <Form.Item name="label" label="Label" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="Value" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sort_order" label="Sort Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="Remark">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DictList;

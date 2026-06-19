import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Select, Table, InputNumber, Space, message, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { orderApi, OrderCreate } from '../../api/orders';
import { customerApi, Customer } from '../../api/customers';

const CreateOrder = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    customerApi.list({ limit: 100 }).then((res) => setCustomers(res.data));
  }, []);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const data: OrderCreate = {
        customer_id: values.customer_id,
        delivery_date: values.delivery_date?.format('YYYY-MM-DD') + 'T00:00:00',
        remarks: values.remarks,
        items: (values.items ?? []).map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          specs: item.specs,
        })),
      };
      await orderApi.create(data);
      message.success(t('orders.order_created'));
      navigate('/orders');
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        message.error(`${t('common.validation_error')}: ${detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join('; ')}`);
      } else {
        message.error(`${t('orders.create_failed')}: ${detail || error?.message || t('common.unknown_error')}`);
      }
      console.error('Order creation error:', error?.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>{t('orders.create_title')}</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="customer_id" label={t('orders.select_customer')} rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder={t('orders.select_customer')}
              optionFilterProp="label"
              options={customers.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="delivery_date" label={t('orders.delivery_date')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remarks" label={t('orders.remarks')}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Card title={t('orders.order_items')} style={{ marginBottom: 16 }}>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Table
                    dataSource={fields}
                    rowKey="key"
                    pagination={false}
                    columns={[
                      {
                        title: t('orders.product_name'),
                        dataIndex: 'product_name',
                        key: 'product_name',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'product_name']} rules={[{ required: true }]} noStyle>
                            <Input placeholder={t('orders.product_name')} />
                          </Form.Item>
                        ),
                      },
                      {
                        title: t('orders.quantity'),
                        dataIndex: 'quantity',
                        key: 'quantity',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'quantity']} rules={[{ required: true }]} noStyle>
                            <InputNumber min={1} placeholder={t('orders.quantity')} />
                          </Form.Item>
                        ),
                      },
                      {
                        title: t('orders.unit_price'),
                        dataIndex: 'unit_price',
                        key: 'unit_price',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'unit_price']} noStyle>
                            <InputNumber min={0} step={0.01} placeholder={t('orders.unit_price')} />
                          </Form.Item>
                        ),
                      },
                      {
                        title: t('orders.specs'),
                        dataIndex: 'specs',
                        key: 'specs',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'specs']} noStyle>
                            <Input placeholder={t('orders.specs')} />
                          </Form.Item>
                        ),
                      },
                      {
                        title: t('common.action'),
                        key: 'action',
                        render: (_: any, __: any, index: number) => (
                          <MinusCircleOutlined onClick={() => remove(index)} style={{ color: 'red' }} />
                        ),
                      },
                    ]}
                  />
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    {t('orders.add_item')}
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {t('orders.submit')}
              </Button>
              <Button onClick={() => navigate('/orders')}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateOrder;

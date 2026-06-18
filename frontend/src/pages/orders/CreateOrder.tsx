import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Select, Table, InputNumber, Space, message, Card } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { orderApi, OrderCreate } from '../../api/orders';
import { customerApi, Customer } from '../../api/customers';

const CreateOrder = () => {
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
        delivery_date: values.delivery_date?.format('YYYY-MM-DD'),
        remarks: values.remarks,
        items: (values.items ?? []).map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          specs: item.specs,
        })),
      };
      await orderApi.create(data);
      message.success('Order created');
      navigate('/orders');
    } catch (error) {
      message.error('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create Order</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="customer_id" label="Customer" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select customer"
              optionFilterProp="label"
              options={customers.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="delivery_date" label="Delivery Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Card title="Order Items" style={{ marginBottom: 16 }}>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Table
                    dataSource={fields}
                    rowKey="key"
                    pagination={false}
                    columns={[
                      {
                        title: 'Product Name',
                        dataIndex: 'product_name',
                        key: 'product_name',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'product_name']} rules={[{ required: true }]} noStyle>
                            <Input placeholder="Product name" />
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Quantity',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'quantity']} rules={[{ required: true }]} noStyle>
                            <InputNumber min={1} placeholder="Qty" />
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Unit Price',
                        dataIndex: 'unit_price',
                        key: 'unit_price',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'unit_price']} noStyle>
                            <InputNumber min={0} step={0.01} placeholder="Price" />
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Specs',
                        dataIndex: 'specs',
                        key: 'specs',
                        render: (_: any, __: any, index: number) => (
                          <Form.Item name={[index, 'specs']} noStyle>
                            <Input placeholder="Specs" />
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Action',
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
                    Add Item
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Submit
              </Button>
              <Button onClick={() => navigate('/orders')}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateOrder;

import client from './client';

export interface ApprovalFlow {
  id: number;
  name: string;
  business_type: string;
  trigger_condition: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface ApprovalNode {
  id: number;
  flow_id: number;
  node_order: number;
  node_name: string;
  approver_type: string;
  approver_value: string;
  action_on_reject: string;
}

export interface ApprovalInstance {
  id: number;
  flow_id: number;
  business_type: string;
  business_id: number;
  initiator_id: number;
  status: string;
  current_node_order: number;
  created_at: string;
}

export interface ApprovalRecord {
  id: number;
  instance_id: number;
  node_id: number;
  approver_id: number;
  action: string;
  comment: string;
  created_at: string;
}

export const approvalApi = {
  listFlows: (params?: { skip?: number; limit?: number; business_type?: string }) =>
    client.get<ApprovalFlow[]>('/approvals/flows', { params }),

  createFlow: (data: {
    name: string;
    business_type: string;
    trigger_condition?: Record<string, any>;
    nodes?: Array<{
      node_order: number;
      node_name: string;
      approver_type: string;
      approver_value: string;
      action_on_reject?: string;
    }>;
  }) => client.post<ApprovalFlow>('/approvals/flows', data),

  getFlow: (id: number) =>
    client.get<ApprovalFlow & { nodes: ApprovalNode[] }>(`/approvals/flows/${id}`),

  updateFlow: (id: number, data: { name?: string; business_type?: string; trigger_condition?: Record<string, any>; is_active?: boolean }) =>
    client.put<ApprovalFlow>(`/approvals/flows/${id}`, data),

  deleteFlow: (id: number) =>
    client.delete(`/approvals/flows/${id}`),

  addNode: (flowId: number, data: {
    node_order: number;
    node_name: string;
    approver_type: string;
    approver_value: string;
    action_on_reject?: string;
  }) => client.post<ApprovalNode>(`/approvals/flows/${flowId}/nodes`, data),

  updateNode: (flowId: number, nodeId: number, data: {
    node_order?: number;
    node_name?: string;
    approver_type?: string;
    approver_value?: string;
    action_on_reject?: string;
  }) => client.put<ApprovalNode>(`/approvals/flows/${flowId}/nodes/${nodeId}`, data),

  deleteNode: (flowId: number, nodeId: number) =>
    client.delete(`/approvals/flows/${flowId}/nodes/${nodeId}`),

  getPending: (params?: { skip?: number; limit?: number }) =>
    client.get<ApprovalInstance[]>('/approvals/pending', { params }),

  getInitiated: (params?: { skip?: number; limit?: number }) =>
    client.get<ApprovalInstance[]>('/approvals/initiated', { params }),

  getDetail: (instanceId: number) =>
    client.get<ApprovalInstance & { nodes: ApprovalNode[]; records: ApprovalRecord[] }>(`/approvals/${instanceId}`),

  approve: (instanceId: number, comment?: string) =>
    client.post<ApprovalInstance>(`/approvals/${instanceId}/approve`, { action: 'approve', comment: comment || '' }),

  reject: (instanceId: number, comment?: string) =>
    client.post<ApprovalInstance>(`/approvals/${instanceId}/reject`, { action: 'reject', comment: comment || '' }),

  cancel: (instanceId: number) =>
    client.post<ApprovalInstance>(`/approvals/${instanceId}/cancel`),
};

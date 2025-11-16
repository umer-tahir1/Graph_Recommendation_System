import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import { fetchAdminGraphExport } from '@/api'

vi.mock('@/api', () => ({
  fetchAdminGraphExport: vi.fn(),
  emitClientAuditLog: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@example.com' },
    isAdminUser: true,
    accessToken: 'token',
    signOut: vi.fn(),
  }),
}))

vi.mock('../components/RecommendationGraph', () => ({
  default: () => <div data-testid="graph-visual" />,
}))

describe('AdminAnalytics', () => {
  it('renders graph stats and nodes', async () => {
    fetchAdminGraphExport.mockResolvedValue({
      totals: { users: 2, products: 2, interactions: 3 },
      top_products: [
        { product_id: 1, product_name: 'Aether Wave Pro', category: 'Headphones', interactions: 3, weight_sum: 4.2 },
      ],
      nodes: [
        { id: 'user:1', label: 'User 1', group: 'user' },
        { id: 'product:1', label: 'Aether Wave Pro', group: 'product' },
      ],
      edges: [
        { id: 'edge:1', from: 'user:1', to: 'product:1', weight: 1, label: 'view' },
      ],
    })

    render(<AdminAnalytics />)

    await waitFor(() => expect(screen.getAllByText('Aether Wave Pro').length).toBeGreaterThan(0))

    expect(screen.getByText('Graph snapshot')).toBeInTheDocument()
    expect(screen.getByTestId('graph-visual')).toBeInTheDocument()
  })
})

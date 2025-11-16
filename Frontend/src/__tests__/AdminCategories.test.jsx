import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AdminCategories from '../components/admin/AdminCategories'
import { fetchCategories, adminReorderCategories } from '@/api'

vi.mock('@/api', () => ({
  fetchCategories: vi.fn(),
  adminCreateCategory: vi.fn(),
  adminDeleteCategory: vi.fn(),
  adminReorderCategories: vi.fn(),
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

describe('AdminCategories', () => {
  beforeEach(() => {
    const mockedFetchCategories = vi.mocked(fetchCategories)
    const mockedReorderCategories = vi.mocked(adminReorderCategories)
    mockedFetchCategories.mockResolvedValue([
      { id: 1, name: 'Headphones', position: 1 },
      { id: 2, name: 'Mobiles', position: 2 },
      { id: 3, name: 'Laptops', position: 3 },
    ])
    mockedReorderCategories.mockResolvedValue([])
  })

  it('sends reordered ids to API', async () => {
    await act(async () => {
      render(<AdminCategories />)
    })

    await waitFor(() => expect(screen.getByText('Headphones')).toBeInTheDocument())

    const moveDownButtons = screen.getAllByText('↓')
    await act(async () => {
      fireEvent.click(moveDownButtons[0])
    })

    const saveButton = screen.getByRole('button', { name: /save order/i })
    await act(async () => {
      fireEvent.click(saveButton)
    })

    expect(adminReorderCategories).toHaveBeenCalledWith([2, 1, 3])
  })
})

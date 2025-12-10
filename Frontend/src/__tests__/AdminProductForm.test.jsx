import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminProductForm from '../components/admin/AdminProductForm'

describe('AdminProductForm', () => {
  it('submits payload with required fields', () => {
    const handleSubmit = vi.fn()
    const handleCancel = vi.fn()

    render(
      <AdminProductForm
        categories={[{ id: 1, name: 'Headphones' }]}
        initialData={{}}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    )

    fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Sonic One' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Headphones' } })
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '199.99' } })

    fireEvent.click(screen.getByRole('button', { name: /add product/i }))

    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Sonic One',
      category: 'Headphones',
      price: 199.99,
    }))
  })
})

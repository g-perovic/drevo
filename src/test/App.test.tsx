import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '@/App'
import { useTreeStore } from '@/store/treeStore'
import { SAMPLE_FAMILY_TREE } from '@/data/sampleTree'
import '@/i18n'

describe('App with Family Tree', () => {
  beforeEach(() => {
    useTreeStore.getState().newProject()
  })

  it('renders sample tree persons when loaded', () => {
    useTreeStore.getState().loadProject(SAMPLE_FAMILY_TREE)
    render(<App />)

    // Check that people in the sample tree appear
    expect(screen.getByText('Jože Novak')).toBeInTheDocument()
    expect(screen.getByText('Marija Novak')).toBeInTheDocument()
    expect(screen.getByText('Janez Novak')).toBeInTheDocument()
    expect(screen.getByText('Ana Novak')).toBeInTheDocument()
  })

  it('clicking Add Person adds a person card to canvas', () => {
    render(<App />)

    // Click the "Add First Person" button in the empty state
    const addFirstBtn = screen.getByText('Add First Person')
    fireEvent.click(addFirstBtn)

    // Now a person card should exist with "New Person"
    expect(screen.getByText('New Person')).toBeInTheDocument()
  })
})

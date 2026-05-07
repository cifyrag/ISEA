import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from '../StarRating';

describe('StarRating', () => {
  it('renders 5 stars', () => {
    render(<StarRating value={undefined} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('highlights filled stars based on value', () => {
    const { container } = render(<StarRating value={3} onChange={vi.fn()} />);
    const svgs = container.querySelectorAll('svg');
    const filledCount = Array.from(svgs).filter(svg =>
      svg.classList.contains('fill-yellow-400')
    ).length;
    expect(filledCount).toBe(3);
  });

  it('calls onChange with star number on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRating value={undefined} onChange={onChange} />);

    await user.click(screen.getAllByRole('button')[3]);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with undefined when clicking the current value (toggle off)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    await user.click(screen.getAllByRole('button')[2]);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('renders in read-only mode without buttons', () => {
    render(<StarRating value={4} readOnly />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('shows correct aria-label in read-only mode', () => {
    render(<StarRating value={4} readOnly />);
    const ratingGroup = screen.getByRole('img');
    expect(ratingGroup).toHaveAttribute('aria-label', '4 out of 5 stars');
  });

  it('applies size classes correctly', () => {
    const { container } = render(<StarRating value={3} readOnly size="sm" />);
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.classList.contains('w-4')).toBe(true);
      expect(svg.classList.contains('h-4')).toBe(true);
    });
  });

  it('applies large size classes', () => {
    const { container } = render(<StarRating value={3} readOnly size="lg" />);
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg.classList.contains('w-8')).toBe(true);
      expect(svg.classList.contains('h-8')).toBe(true);
    });
  });

  it('handles value of 0 as no stars filled', () => {
    const { container } = render(<StarRating value={0} readOnly />);
    const svgs = container.querySelectorAll('svg');
    const filledCount = Array.from(svgs).filter(svg =>
      svg.classList.contains('fill-yellow-400')
    ).length;
    expect(filledCount).toBe(0);
  });

  it('handles undefined value gracefully', () => {
    const { container } = render(<StarRating value={undefined} readOnly />);
    const svgs = container.querySelectorAll('svg');
    const filledCount = Array.from(svgs).filter(svg =>
      svg.classList.contains('fill-yellow-400')
    ).length;
    expect(filledCount).toBe(0);
  });

  it('has aria-labels on interactive buttons', () => {
    render(<StarRating value={undefined} onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn, i) => {
      expect(btn).toHaveAttribute('aria-label', `${i + 1} out of 5 stars`);
    });
  });
});

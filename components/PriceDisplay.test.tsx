import { render, screen } from '@testing-library/react';
import { PriceDisplay } from './PriceDisplay';

describe('PriceDisplay', () => {
  it('displays loading state when isLoading is true', () => {
    render(<PriceDisplay price={undefined} isLoading={true} />);

    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('displays price formatted with commas and decimals', () => {
    render(<PriceDisplay price={45000} isLoading={false} />);

    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
  });

  it('displays price with fractional values correctly', () => {
    render(<PriceDisplay price={45123.45} isLoading={false} />);

    expect(screen.getByText('$45,123.45')).toBeInTheDocument();
  });

  it('displays "--" when price is undefined and not loading', () => {
    render(<PriceDisplay price={undefined} isLoading={false} />);

    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('displays the header label', () => {
    render(<PriceDisplay price={45000} isLoading={false} />);

    expect(screen.getByText('[LIVE_MARKET_PRICE]')).toBeInTheDocument();
  });

  it('displays BTC/USD label in footer', () => {
    render(<PriceDisplay price={45000} isLoading={false} />);

    expect(screen.getByText('BTC/USD')).toBeInTheDocument();
  });

  it('displays refresh rate in footer', () => {
    render(<PriceDisplay price={45000} isLoading={false} />);

    expect(screen.getByText('REFRESH: 5s')).toBeInTheDocument();
  });

  it('handles large prices correctly', () => {
    render(<PriceDisplay price={100000} isLoading={false} />);

    expect(screen.getByText('$100,000.00')).toBeInTheDocument();
  });

  it('handles small prices correctly', () => {
    render(<PriceDisplay price={0.01} isLoading={false} />);

    expect(screen.getByText('$0.01')).toBeInTheDocument();
  });
});

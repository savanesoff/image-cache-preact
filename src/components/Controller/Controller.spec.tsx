import { render } from '@testing-library/preact';
import { ControllerProvider } from './Controller';
import '@testing-library/jest-dom/extend-expect';
describe('ControllerProvider', () => {
  it('should render the children', () => {
    const { getByText } = render(
      <ControllerProvider>
        <div>Test Child</div>
      </ControllerProvider>,
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });
});

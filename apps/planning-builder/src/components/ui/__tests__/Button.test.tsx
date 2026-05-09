import { Button } from '@/components/ui/Button';
import { fireEvent, render } from '@testing-library/react-native';

describe('Button', () => {
  it('renders children text', () => {
    const { getByText } = render(<Button>Press me</Button>);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button onPress={onPress}>Tap</Button>);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button onPress={onPress} disabled>
        Tap
      </Button>,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

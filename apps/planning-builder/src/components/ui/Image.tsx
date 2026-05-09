import { Image as ExpoImage, type ImageProps } from 'expo-image';

export function Image(props: ImageProps) {
  return <ExpoImage {...props} />;
}

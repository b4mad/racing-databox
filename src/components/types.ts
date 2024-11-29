export interface ZoomState {
  left: number | undefined | null;
  right: number | undefined | null;
  top: number;
  bottom: number;
}
export type AnnotationType = 'turns' | 'segments';

declare module 'react-katex' {
  import { ComponentType } from 'react';
  
  interface MathProps {
    math: string;
    children?: React.ReactNode;
  }
  
  export const InlineMath: ComponentType<MathProps>;
  export const BlockMath: ComponentType<MathProps>;
} 
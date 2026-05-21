declare module "reactflow" {
  export interface Position {
    x: number;
    y: number;
  }

  export interface Node {
    id: string;
    data?: any;
    position?: Position | any;
    type?: string;
    style?: any;
    className?: string;
  }

  export interface Edge {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    label?: string;
    style?: any;
    markerEnd?: any;
    data?: any;
    [key: string]: any;
  }

  export {};
}

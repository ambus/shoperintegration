export type ParserOptions = {
  delimiter: string;
  columns?: boolean;
  skip_empty_lines?: boolean;
  skip_lines_with_error?: boolean;
  trim?: boolean;
  cast?: boolean;
};

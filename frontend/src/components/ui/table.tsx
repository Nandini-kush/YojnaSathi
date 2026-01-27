import { cn } from "@/lib/utils";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

const Table = ({ className, ...props }: TableProps) => (
  <table className={cn("w-full border-collapse", className)} {...props} />
);

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = ({ className, ...props }: TableHeaderProps) => (
  <thead className={cn("bg-gray-100", className)} {...props} />
);

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = ({ className, ...props }: TableBodyProps) => (
  <tbody className={cn("", className)} {...props} />
);

export interface TableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = ({ className, ...props }: TableFooterProps) => (
  <tfoot className={cn("bg-gray-100", className)} {...props} />
);

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead = ({ className, ...props }: TableHeadProps) => (
  <th
    className={cn(
      "border border-gray-300 px-4 py-2 text-left font-semibold",
      className
    )}
    {...props}
  />
);

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = ({ className, ...props }: TableCellProps) => (
  <td
    className={cn("border border-gray-300 px-4 py-2", className)}
    {...props}
  />
);

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = ({ className, ...props }: TableRowProps) => (
  <tr className={cn("hover:bg-gray-50", className)} {...props} />
);

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableCell, TableRow };
